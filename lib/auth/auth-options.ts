import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db/connect";
import { Admin, Teacher, ActivityLog } from "@/lib/db/models";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectToDatabase();

        // Check if admin
        const admin = await Admin.findOne({ email: credentials.email });
        if (admin) {
          const isValid = await bcrypt.compare(
            credentials.password,
            admin.password
          );
          if (!isValid) {
            throw new Error("Invalid credentials");
          }

          // Log admin login
          await ActivityLog.create({
            userId: admin._id,
            userType: "admin",
            action: "LOGIN",
            details: { email: admin.email },
          });

          return {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.name,
            role: "admin" as const,
          };
        }

        // Check if teacher
        const teacher = await Teacher.findOne({ email: credentials.email });
        if (!teacher) {
          throw new Error("Invalid credentials");
        }

        if (!teacher.isActive) {
          throw new Error("Your account has been deactivated");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          teacher.password
        );
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // Update last login
        teacher.lastLogin = new Date();
        await teacher.save();

        // Log teacher login
        await ActivityLog.create({
          userId: teacher._id,
          userType: "teacher",
          action: "LOGIN",
          details: { email: teacher.email },
        });

        return {
          id: teacher._id.toString(),
          email: teacher.email,
          name: `${teacher.firstName} ${teacher.lastName}`,
          role: "teacher" as const,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
