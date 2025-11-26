import { type NextAuthOptions, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ObjectId } from "mongodb";
import { compare } from "bcryptjs";
import { getDatabase } from "@/lib/mongodb";

// Simple in-memory cache with 5-minute TTL
const userCache = new Map<string, { user: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface SessionUser extends User {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
  username?: string;
  createdAt?: string;
  lastLogin?: string;
  avatar?: string;
}

export const authOptions: NextAuthOptions = {
  session: { 
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const cacheKey = `user:${credentials.email}`;
        const cached = userCache.get(cacheKey);
        
        // Return cached user if available and not expired
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
          return cached.user;
        }

        try {
          const db = await getDatabase();
          
          // Optimize query by only fetching necessary fields
          const user = await db.collection("users").findOne(
            { email: credentials.email },
            { 
              projection: { 
                _id: 1,
                name: 1,
                email: 1,
                passwordHash: 1,
                role: 1,
                status: 1,
                username: 1,
                avatar: 1,
                createdAt: 1,
                lastLogin: 1
              } 
            }
          );

          if (!user) {
            throw new Error("Invalid email or password");
          }

          // Check account status
          if (user.status && ["suspended", "blocked", "banned"].includes(String(user.status).toLowerCase())) {
            throw new Error("This account has been suspended. Please contact support.");
          }

          // Verify password
          const isValid = await compare(credentials.password, user.passwordHash);
          if (!isValid) {
            throw new Error("Invalid email or password");
          }

          // Update last login time without waiting
          db.collection("users").updateOne(
            { _id: user._id },
            { $set: { lastLogin: new Date() } }
          ).catch(console.error);

          const userData: SessionUser = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "user",
            username: user.username,
            avatar: user.avatar,
            createdAt: user.createdAt?.toISOString(),
            lastLogin: user.lastLogin?.toISOString(),
          };

          // Cache the user
          userCache.set(cacheKey, {
            user: userData,
            timestamp: Date.now()
          });

          return userData;
        } catch (error) {
          console.error("Authentication error:", error);
          throw error; // Re-throw to be handled by NextAuth
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: (token as any).role,
        } as SessionUser;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error(code, metadata);
    },
    warn(code) {
      console.warn(code);
    },
    debug(code, metadata) {
      console.debug(code, metadata);
    },
  },
};
