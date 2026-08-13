import NextAuth from "next-auth";
import authConfig from "./auth.config";

function isRole(value: unknown): value is "USER" | "ADMIN" {
  return value === "USER" || value === "ADMIN";
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";

        session.user.role = isRole(token.role)
          ? token.role
          : "USER";
      }

      return session;
    },
  },
});