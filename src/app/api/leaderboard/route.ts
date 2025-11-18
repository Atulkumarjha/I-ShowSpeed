import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "time";
    const limit = searchParams.get("limit") || "15";

    const { db } = await connectToDatabase();

    // Get top results grouped by user
    const leaderboard = await db
      .collection("test_results")
      .aggregate([
        { $match: { mode } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$userId",
            name: { $first: "$user.name" },
            email: { $first: "$user.email" },
            bestWpm: { $max: "$wpm" },
            bestAccuracy: { $max: "$accuracy" },
            totalTests: { $sum: 1 },
            averageWpm: { $avg: "$wpm" },
          },
        },
        { $sort: { bestWpm: -1 } },
        { $limit: parseInt(limit) },
      ])
      .toArray();

    return NextResponse.json({ leaderboard });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
