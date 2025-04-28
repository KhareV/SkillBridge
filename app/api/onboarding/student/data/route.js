import { NextResponse } from "next/server";
import { connectToDatabase, getDataOrMock } from "@/lib/db/mongoose";
import StudentOnboarding from "@/lib/db/models/studentOnboarding";
const mockStudentData = {
  name: "Mock Student",
  email: "mock.student@example.com",
  institution: "Mock University",
  courseOfStudy: "Computer Science",
  yearOfStudy: "3rd Year",
  skills: ["JavaScript", "React", "Node.js"],
  interests: ["AI", "Web Development", "Cloud Computing"],
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }
    const onboarding = await getDataOrMock(
      async (options) => {
        await connectToDatabase();
        return await StudentOnboarding.findOne(options);
      },
      mockStudentData,
      { $or: [{ clerkId: userId }, { userId: userId }] }
    );
    if (!onboarding) {
      return NextResponse.json(
        { success: false, message: "Student onboarding data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      onboarding,
    });
  } catch (error) {
    console.error("Error in student onboarding data retrieval:", error);
    return NextResponse.json({
      success: true,
      onboarding: mockStudentData,
      warning: "Using mock data due to database connection error",
    });
  }
}
