import mongoose, { Schema, Document, models, Model, Types } from "mongoose";

export interface IInvestorOnboarding extends Document {
  userId: Types.ObjectId;
  clerkId: string;
  investmentFocus?: string[];
  preferredStages?: string[];
  portfolioSize?: string;
  companyName?: string;
  roleInCompany?: string;
  riskAppetite?: "low" | "medium" | "high";
  linkedInProfile?: string;
  website?: string;
  accreditationStatus?: boolean;
  onboardingData: Record<string, any>;
  completedAt: Date;
}

const InvestorOnboardingSchema: Schema<IInvestorOnboarding> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clerkId: { type: String, required: true, index: true },
    investmentFocus: [{ type: String }],
    preferredStages: [{ type: String }],
    portfolioSize: { type: String },
    companyName: { type: String },
    roleInCompany: { type: String },
    riskAppetite: { type: String, enum: ["low", "medium", "high"] },
    linkedInProfile: { type: String },
    website: { type: String },
    accreditationStatus: { type: Boolean },
    onboardingData: { type: Schema.Types.Mixed },
    completedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "completedAt", updatedAt: false },
    collection: "investor-onboardings",
  }
);

const InvestorOnboarding: Model<IInvestorOnboarding> =
  models.InvestorOnboarding ||
  mongoose.model<IInvestorOnboarding>(
    "InvestorOnboarding",
    InvestorOnboardingSchema
  );

export default InvestorOnboarding;
