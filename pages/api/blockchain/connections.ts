import type { NextApiRequest, NextApiResponse } from "next";
import connectToDB from "@/lib/mongoose";
import BlockchainConnection from "@/lib/db/models/BlockchainConnection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectToDB();
    if (req.method === "GET") {
      const { studentId } = req.query;

      if (studentId) {
        const connection = await BlockchainConnection.findOne({
          studentProposalId: studentId,
        });

        if (!connection) {
          return res.status(404).json({ message: "Connection not found" });
        }

        return res.status(200).json(connection);
      } else {
        const connections = await BlockchainConnection.find({});
        return res.status(200).json(connections);
      }
    } else if (req.method === "POST") {
      const { studentProposalId, blockchainProposalId, title, ethAmount } =
        req.body;

      if (!studentProposalId || !blockchainProposalId || !title || !ethAmount) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const existingConnection = await BlockchainConnection.findOne({
        studentProposalId,
      });

      if (existingConnection) {
        return res.status(409).json({
          message: "Connection already exists for this student proposal",
          connection: existingConnection,
        });
      }
      const newConnection = new BlockchainConnection({
        studentProposalId,
        blockchainProposalId,
        title,
        ethAmount,
        transactions: [],
      });

      await newConnection.save();

      return res.status(201).json({
        message: "Connection created successfully",
        connection: newConnection,
      });
    } else if (req.method === "PUT") {
      const { studentProposalId, txHash, from, amount } = req.body;

      if (!studentProposalId || !txHash || !from || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const connection = await BlockchainConnection.findOne({
        studentProposalId,
      });

      if (!connection) {
        return res.status(404).json({
          message: "Connection not found for this student proposal",
        });
      }
      connection.transactions.push({
        txHash,
        from,
        amount,
        timestamp: new Date(),
      });

      await connection.save();

      return res.status(200).json({
        message: "Transaction recorded successfully",
        connection,
      });
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: String(error) });
  }
}
