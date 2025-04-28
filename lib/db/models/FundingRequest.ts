import mongoose, { Schema, Document, models } from "mongoose";
interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
}

interface Education {
  currentLevel: string;
  institution: string;
  major: string;
  graduationDate: string;
  skills: string[];
}

interface Funding {
  amount: number;
  timeline: string;
  preferredModel: string;
  purpose: string;
}

interface Career {
  shortTermGoals: string;
  longTermGoals: string;
  targetIndustries: string[];
  targetRoles: string[];
  salaryExpectations: number;
}

interface Documents {
  resume: string;
  transcript: string;
  portfolioLink?: string;
  additionalLinks: string[];
}
export interface IFundingRequest extends Document {
  userId: Schema.Types.ObjectId;
  personalInfo: PersonalInfo;
  education: Education;
  funding: Funding;
  career: Career;
  documents: Documents;
  status: "pending" | "approved" | "rejected" | "under_review";
  createdAt: Date;
  updatedAt: Date;
}
const FundingRequestSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    personalInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      location: { type: String, required: true },
    },
    education: {
      currentLevel: { type: String, required: true },
      institution: { type: String, required: true },
      major: { type: String, required: true },
      graduationDate: { type: String, required: true },
      skills: [{ type: String }],
    },
    funding: {
      amount: { type: Number, required: true },
      timeline: { type: String, required: true },
      preferredModel: { type: String, required: true },
      purpose: { type: String, required: true },
    },
    career: {
      shortTermGoals: { type: String, required: true },
      longTermGoals: { type: String, required: true },
      targetIndustries: [{ type: String }],
      targetRoles: [{ type: String }],
      salaryExpectations: { type: Number, required: true },
    },
    documents: {
      resume: { type: String },
      transcript: { type: String },
      portfolioLink: { type: String },
      additionalLinks: [{ type: String }],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "under_review"],
      default: "pending",
    },
  },
  { timestamps: true }
);
const FundingRequest =
  models.FundingRequest ||
  mongoose.model<IFundingRequest>("FundingRequest", FundingRequestSchema);

export default FundingRequest;
