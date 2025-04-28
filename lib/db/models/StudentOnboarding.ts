import mongoose, { Schema, Document, models, Model, Types } from "mongoose";

export interface IStudentOnboarding extends Document {
  userId: Types.ObjectId;
  clerkId: string;
  educationalGoals?: string;
  careerAspirations?: string;
  preferredLearningStyle?: string;
  skillsToDevelop?: string[];
  fundingNeedReason?: string;
  location?: string;
  dateOfBirth?: Date;
  currentEducationLevel?: string;
  fieldOfStudy?: string;
  onboardingData: Record<string, any>;
  completedAt: Date;
}

const StudentOnboardingSchema: Schema<IStudentOnboarding> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clerkId: { type: String, required: true, index: true },
    educationalGoals: { type: String },
    careerAspirations: { type: String },
    preferredLearningStyle: { type: String },
    skillsToDevelop: [{ type: String }],
    fundingNeedReason: { type: String },
    location: { type: String },
    dateOfBirth: { type: Date },
    currentEducationLevel: { type: String },
    fieldOfStudy: { type: String },
    onboardingData: { type: Schema.Types.Mixed },
    completedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "completedAt", updatedAt: false },
    collection: "student-onboardings",
  }
);

const StudentOnboarding: Model<IStudentOnboarding> =
  models.StudentOnboarding ||
  mongoose.model<IStudentOnboarding>(
    "StudentOnboarding",
    StudentOnboardingSchema
  );

export default StudentOnboarding;
