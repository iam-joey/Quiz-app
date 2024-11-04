import { NextAuthOptions } from "next-auth";
import bcrypt from "bcrypt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@repo/db/client";
import type { Adapter } from "next-auth/adapters";
import CredenstialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET!,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredenstialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text", placeholder: "" },
        password: { label: "password", type: "password", placeholder: "" },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        const admin = await prisma.admin.findUnique({
          where: {
            email: credentials?.email,
          },
          select: {
            email: true,
            password: true,
            id: true,
            name: true,
          },
        });

        if (
          admin &&
          (await bcrypt.compare(credentials.password, admin.password))
        ) {
          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  callbacks: {
    async jwt({ token, user }) {
      return token;
    },
    async session({ session, token }: any) {
      if (session) {
        session.user = {
          ...session.user,
          id: token.sub,
          name: token.name,
          email: token.email,
        };
      }

      return session;
    },
  },
};
