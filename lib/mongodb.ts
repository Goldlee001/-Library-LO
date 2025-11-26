import { MongoClient, type MongoClientOptions } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options: MongoClientOptions = {
  maxPoolSize: 50, // Maximum number of connections in the connection pool
  serverSelectionTimeoutMS: 5000, // Time to wait for server selection
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  connectTimeoutMS: 10000, // Fail fast on initial connection
  heartbeatFrequencyMS: 10000, // How often to check the connection status
  retryWrites: true,
  retryReads: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to maintain a single connection
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options);
    global._mongoClientPromise = client.connect();
    
    // Optional: Add error handling
    client.on('serverHeartbeatFailed', () => {
      console.warn('MongoDB connection lost. Attempting to reconnect...');
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, avoid using a global variable
  client = new MongoClient(MONGODB_URI, options);
  clientPromise = client.connect();
  
  // Add error handling for production
  client.on('serverHeartbeatFailed', () => {
    console.error('MongoDB connection lost in production!');
  });
}

// Helper function to get the database with proper typing
export async function getDatabase(dbName = 'library') {
  const client = await clientPromise;
  return client.db(dbName);
}

export default clientPromise;

