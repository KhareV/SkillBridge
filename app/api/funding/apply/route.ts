import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";
import Proposal from "@/lib/db/models/Proposal";

export async function POST(request: Request) {
  console.log("--- Received POST request to /api/funding/apply ---");
  try {
    console.log("Step 2: Parsing request body...");
    const formData = await request.json();
    console.log("Parsed formData:", JSON.stringify(formData, null, 2));
    console.log("Step 3: Validating incoming data...");
    if (!formData || !formData.personalInfo || !formData.fundingGoals) {
      return NextResponse.json(
        {
          error: "Missing required proposal data: personalInfo or fundingGoals",
        },
        { status: 400 }
      );
    }
    if (
      !formData.personalInfo.firstName ||
      !formData.personalInfo.lastName ||
      !formData.personalInfo.email ||
      !formData.fundingGoals.amountRequested ||
      !formData.fundingGoals.purpose ||
      !formData.fundingGoals.courseName ||
      !formData.fundingGoals.institutionName
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields within personalInfo or fundingGoals",
        },
        { status: 400 }
      );
    }
    console.log("Data validation passed.");
    console.log("Step 4: Connecting to database...");
    await connectToDB();
    console.log("Database connection successful.");
    console.log("Step 5: Preparing data for saving...");
    const proposalData = {
      personalInfo: formData.personalInfo,
      fundingGoals: formData.fundingGoals,
      financialInfo: formData.financialInfo,
      essayOrStatement: formData.essayOrStatement,
      supportingDocuments: formData.supportingDocuments,
      status: "submitted",
    };
    console.log(
      "Prepared proposalData:",
      JSON.stringify(proposalData, null, 2)
    );
    console.log("Step 6: Creating and saving the proposal...");
    const newProposal = new Proposal(proposalData);
    const savedProposal = await newProposal.save();
    console.log(
      `Proposal saved successfully! Document ID: ${savedProposal._id}`
    );
    console.log("Step 7: Returning success response.");
    return NextResponse.json(
      {
        message: "Proposal submitted successfully!",
        data: savedProposal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("--- Error submitting funding application ---");
    console.error("Error details:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      console.error("Validation Error details (message):", error.message);
      console.error(
        "Validation Error details (errors object):",
        JSON.stringify(error.errors, null, 2)
      );
      return NextResponse.json(
        { error: "Validation Error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Non-validation error details:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
import mongoose from "mongoose";
