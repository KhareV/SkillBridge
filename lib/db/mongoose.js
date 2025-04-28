import mongoose from "mongoose";

let isConnected = false;
let connectionRetryCount = 0;
const MAX_RETRIES = 3;

export const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  const mongoUri = process.env.NEXT_MONGODB_URI;

  if (!mongoUri) {
    throw new Error("NEXT_MONGODB_URI environment variable is not defined");
  }

  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    const db = await mongoose.connect(mongoUri, options);
    isConnected = db.connections[0].readyState === 1;
    connectionRetryCount = 0;
    console.log("MongoDB connected successfully");
  } catch (error) {
    connectionRetryCount++;
    console.error(
      `MongoDB connection attempt ${connectionRetryCount} failed:`,
      error.message
    );
    if (connectionRetryCount >= MAX_RETRIES) {
      console.error("Maximum MongoDB connection retry attempts reached");
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return connectToDatabase();
  }
};
export const getDataOrMock = async (modelFn, mockData, findOptions = {}) => {
  try {
    await connectToDatabase();
    return await modelFn(findOptions);
  } catch (error) {
    console.warn("Falling back to mock data due to database connection error");
    return mockData;
  }
};
