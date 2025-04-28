import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import StudentOnboarding from "@/lib/db/models/studentOnboarding";
import InvestorOnboarding from "@/lib/db/models/investorOnboarding";

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("Received data:", JSON.stringify(data, null, 2));
    let role = data.role;
    if (!role && data.personalDetails && data.personalDetails.role) {
      role = data.personalDetails.role;
    }
    if (!role) {
      if (data.education && data.education.institution) {
        role = "student";
      } else if (data.institution) {
        role = "student";
      } else if (
        (data.investment && data.investment.focusAreas) ||
        data.company ||
        data.investmentFocus
      ) {
        role = "investor";
      }
    }

    if (!role || (role !== "student" && role !== "investor")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User role ('student' or 'investor') is required in data payload.",
        },
        { status: 400 }
      );
    }
    await connectToDatabase();
    if (role === "student") {
      let studentModelData;

      if (data.name && data.email && data.institution) {
        studentModelData = {
          name: data.name,
          email: data.email,
          institution: data.institution,
          courseOfStudy: data.courseOfStudy || "",
          yearOfStudy: data.yearOfStudy || "",
          skills: Array.isArray(data.skills) ? data.skills : [],
          interests: Array.isArray(data.interests) ? data.interests : [],
          role: "student",
        };
      } else {
        studentModelData = {
          name: data.personalDetails?.name || "",
          email: data.personalDetails?.email || "",
          institution: data.education?.institution || "",
          courseOfStudy: data.education?.major || "",
          yearOfStudy: data.education?.gradYear || "",
          skills: Array.isArray(data.skills?.selectedSkills)
            ? data.skills.selectedSkills
            : [],
          interests: Array.isArray(data.skills?.interests)
            ? data.skills.interests
            : [],
          role: "student",
        };
      }

      console.log("Formatted student data:", studentModelData);
      if (
        !studentModelData.name ||
        !studentModelData.email ||
        !studentModelData.institution
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Missing required fields for student onboarding",
          },
          { status: 400 }
        );
      }

      const studentData = new StudentOnboarding(studentModelData);
      await studentData.save();
    } else if (role === "investor") {
      let investorModelData;

      if (data.name && data.email && data.company) {
        investorModelData = {
          name: data.name,
          email: data.email,
          company: data.company,
          position: data.position || "",
          investmentFocus: Array.isArray(data.investmentFocus)
            ? data.investmentFocus
            : [],
          investmentStage: data.investmentStage || "",
          portfolioSize: data.portfolioSize || "",
          role: "investor",
        };
      } else {
        investorModelData = {
          name: data.personalDetails?.name || "",
          email: data.personalDetails?.email || "",
          company: data.company || data.professional?.company || "",
          position: data.position || data.professional?.position || "",
          investmentFocus:
            data.investmentFocus ||
            (data.investment?.focusAreas ? data.investment.focusAreas : []),
          investmentStage:
            data.investmentStage || data.investment?.investmentStage || "",
          portfolioSize: data.portfolioSize || data.investment?.checkSize || "",
          role: "investor",
        };
      }

      console.log("Formatted investor data:", investorModelData);
      if (
        !investorModelData.name ||
        !investorModelData.email ||
        !investorModelData.company
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Missing required fields for investor onboarding",
          },
          { status: 400 }
        );
      }

      const investorData = new InvestorOnboarding(investorModelData);
      await investorData.save();
    }

    return NextResponse.json({
      success: true,
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } onboarding completed successfully`,
    });
  } catch (error) {
    console.error("Error in onboarding:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save onboarding data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
