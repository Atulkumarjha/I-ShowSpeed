import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestResult {
  _id?: ObjectId;
  userId: ObjectId;
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  mode: "time" | "words";
  limit: number;
  completedAt: Date;
}

export interface UserStats {
  totalTests: number;
  averageWpm: number;
  averageAccuracy: number;
  bestWpm: number;
  bestAccuracy: number;
  recentTests: TestResult[];
}
