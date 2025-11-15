import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcryptjs";
import { ObjectId } from "mongodb";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const db = client.db("library");

        const user = await db.collection("users").findOne({ email: credentials?.email });

        if (!user) throw new Error("No user found with this email");

        if (user.status) {
          const st = String(user.status).toLowerCase();
          if (["suspended", "blocked", "banned"].includes(st)) {
            throw new Error("This user is suspended.");
          }
        }

        const isValid = await compare(credentials!.password, user.passwordHash);
        if (!isValid) throw new Error("Invalid password");

        await db.collection("users").updateOne(
          { _id: user._id },
          { $set: { lastLogin: new Date() } }
        );

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || "user",
        } as any;
      },
    }),
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        const parsedUrl = new URL(url, baseUrl);
        if (parsedUrl.pathname === "/auth/login") {
          return baseUrl;
        }
        if (parsedUrl.origin === baseUrl) {
          return parsedUrl.toString();
        }
        return baseUrl;
      } catch {
        return baseUrl;
      }
    },

    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = (user as any).id;
          (token as any).role = (user as any).role;
          return token;
        }
        if (token?.id) {
          const client = await clientPromise;
          const db = client.db("library");
          const dbUser = await db
            .collection("users")
            .findOne({ _id: new ObjectId(token.id as string) });
          if (dbUser?.role) {
            (token as any).role = dbUser.role;
          }
        }
      } catch (e) {
        console.error("JWT role refresh failed:", e);
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        try {
          const client = await clientPromise;
          const db = client.db("library");
          const dbUser = await db
            .collection("users")
            .findOne({ _id: new ObjectId(token.id as string) });

          session.user = {
            ...session.user,
            id: token.id as string,
            role: (dbUser?.role as string) ?? ((token as any).role as string),
            name: dbUser?.name ?? session.user?.name,
            email: dbUser?.email ?? session.user?.email,
            username: dbUser?.username || undefined,
            createdAt: dbUser?.createdAt
              ? new Date(dbUser.createdAt).toISOString()
              : undefined,
            lastLogin: dbUser?.lastLogin
              ? new Date(dbUser.lastLogin).toISOString()
              : undefined,
            avatar: dbUser?.avatar || undefined,
          } as any;
        } catch (e) {
          console.error("Session enrichment failed:", e);
          session.user = {
            ...session.user,
            id: token.id as string,
            role: (token as any).role as string,
          } as any;
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
