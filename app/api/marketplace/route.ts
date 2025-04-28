import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
const connectDB = connectToDatabase;
import Marketplace from "@/lib/db/models/Marketplace";

export async function GET(req: Request) {
  try {
    await connectDB();
    console.log("Successfully connected to DB for marketplace fetch.");
    const marketplaceItems = await Marketplace.find({}).lean();
    console.log("Fetched marketplace items:", marketplaceItems);
    if (marketplaceItems.length === 0) {
      return NextResponse.json({
        message: "No marketplace items found in database",
      });
    }
    return NextResponse.json(marketplaceItems);
  } catch (error) {
    console.error("Error fetching marketplace items from MongoDB:", error);
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch marketplace items" },
      { status: 500 }
    );
  }
}
