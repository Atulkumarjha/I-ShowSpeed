import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TestResult } from "@/models/User";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify token
    let decoded: { userId: string; email: string; name: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        name: string;
      };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { wpm, accuracy, correctChars, incorrectChars, mode, limit } =
      await request.json();

    // Validate input
    if (typeof wpm !== "number" || typeof accuracy !== "number") {
      return NextResponse.json(
        { error: "Invalid test result data" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const resultsCollection = db.collection<TestResult>("test_results");

    // Save test result
    const testResult: Omit<TestResult, "_id"> = {
      userId: new ObjectId(decoded.userId),
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      mode,
      limit,
      completedAt: new Date(),
    };

    const result = await resultsCollection.insertOne(testResult as TestResult);

    return NextResponse.json(
      {
        message: "Test result saved successfully",
        resultId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save result error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify token
    let decoded: { userId: string; email: string; name: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        name: string;
      };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const resultsCollection = db.collection<TestResult>("test_results");

    // Get user's test results
    const results = await resultsCollection
      .find({ userId: new ObjectId(decoded.userId) })
      .sort({ completedAt: -1 })
      .limit(10)
      .toArray();

    // Calculate stats
    const totalTests = await resultsCollection.countDocuments({
      userId: new ObjectId(decoded.userId),
    });

    const allResults = await resultsCollection
      .find({ userId: new ObjectId(decoded.userId) })
      .toArray();

    const averageWpm =
      allResults.length > 0
        ? Math.round(
            allResults.reduce((sum, r) => sum + r.wpm, 0) / allResults.length
          )
        : 0;

    const averageAccuracy =
      allResults.length > 0
        ? Math.round(
            allResults.reduce((sum, r) => sum + r.accuracy, 0) /
              allResults.length
          )
        : 0;

    const bestWpm =
      allResults.length > 0 ? Math.max(...allResults.map((r) => r.wpm)) : 0;

    const bestAccuracy =
      allResults.length > 0
        ? Math.max(...allResults.map((r) => r.accuracy))
        : 0;

    return NextResponse.json(
      {
        totalTests,
        averageWpm,
        averageAccuracy,
        bestWpm,
        bestAccuracy,
        recentTests: results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
