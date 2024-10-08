import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@repo/db/client";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  secret: "m8bVR7LDvLw+dXJ5wzD9zPDnFLIopKVNvUXg/pGBcO0=",
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId:
        "548624448516-9aphfvepsbtjk610eqb2tngok81kfkc9.apps.googleusercontent.com",
      clientSecret: "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",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      const user = await prisma.user.findUnique({
        where: {
          id: token.sub as string,
        },
      });
      if (user) {
        session.user = {
          ...session.user,
          //@ts-ignore
          id: user.id,
          name: user.name,
          email: user.email,
        };
      }
      return session;
    },
  },
};
