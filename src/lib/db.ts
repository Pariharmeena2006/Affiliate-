import mongoose from "mongoose";

const uri = process.env.DATABASE_URL;

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalWithMongoose = globalThis as typeof globalThis & { mongooseCache?: MongooseCache };
const cache = globalWithMongoose.mongooseCache ?? { conn: null, promise: null };
globalWithMongoose.mongooseCache = cache;

export async function connectDB() {
  if (!uri) throw new Error("DATABASE_URL is not configured. Copy .env.example to .env.local and set a MongoDB connection string.");
  if (cache.conn) return cache.conn;
  if (!cache.promise) cache.promise = mongoose.connect(uri!, { bufferCommands: false });
  cache.conn = await cache.promise;
  return cache.conn;
}
