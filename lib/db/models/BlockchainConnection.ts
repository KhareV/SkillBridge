import mongoose, { Schema, Document, models, Model } from "mongoose";
export interface IBlockchainConnection extends Document {
  studentProposalId: string;
  blockchainProposalId: number;
  title: string;
  ethAmount: number;
  transactions: Array<{
    txHash: string;
    from: string;
    amount: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
const BlockchainConnectionSchema: Schema<IBlockchainConnection> = new Schema(
  {
    studentProposalId: {
      type: String,
      required: true,
      unique: true,
    },
    blockchainProposalId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    ethAmount: {
      type: Number,
      required: true,
    },
    transactions: [
      {
        txHash: { type: String, required: true },
        from: { type: String, required: true },
        amount: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    collection: "blockchain-connections",
  }
);
if (
  process.env.NODE_ENV === "development" &&
  mongoose.models.BlockchainConnection
) {
  delete mongoose.models.BlockchainConnection;
  console.log("Deleted cached BlockchainConnection model in development.");
}

const BlockchainConnection: Model<IBlockchainConnection> =
  models.BlockchainConnection ||
  mongoose.model<IBlockchainConnection>(
    "BlockchainConnection",
    BlockchainConnectionSchema
  );

export default BlockchainConnection;
