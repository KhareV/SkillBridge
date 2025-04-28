import mongoose, { Schema, Document, models, Model } from "mongoose";
export interface IProposal extends Document {
  userId?: Schema.Types.ObjectId;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
  };
  fundingGoals: {
    amountRequested: number;
    purpose: string;
    courseName: string;
    institutionName: string;
    studyDurationMonths?: number;
  };
  financialInfo?: {
    annualIncome?: number;
    hasCollateral?: boolean;
    creditScore?: number;
  };
  essayOrStatement?: string;
  supportingDocuments?: {
    documentType: string;
    url: string;
  }[];
  status: "submitted" | "under_review" | "approved" | "rejected" | "withdrawn";
  submittedAt: Date;
  updatedAt: Date;
}
const ProposalSchema: Schema<IProposal> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      address: { type: String },
    },
    fundingGoals: {
      amountRequested: { type: Number, required: true },
      purpose: { type: String, required: true },
      courseName: { type: String, required: true },
      institutionName: { type: String, required: true },
      studyDurationMonths: { type: Number },
    },
    financialInfo: {
      annualIncome: { type: Number },
      hasCollateral: { type: Boolean },
      creditScore: { type: Number },
    },
    essayOrStatement: { type: String },
    supportingDocuments: [
      {
        documentType: { type: String },
        url: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["submitted", "under_review", "approved", "rejected", "withdrawn"],
      default: "submitted",
    },
  },
  {
    timestamps: { createdAt: "submittedAt", updatedAt: "updatedAt" },
    collection: "proposal-student",
  }
);
if (process.env.NODE_ENV === "development" && mongoose.models.Proposal) {
  delete mongoose.models.Proposal;
  console.log("Deleted cached Proposal model in development.");
}

const Proposal: Model<IProposal> =
  models.Proposal || mongoose.model<IProposal>("Proposal", ProposalSchema);

export default Proposal;
