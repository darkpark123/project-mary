import type { DefaultSession } from "next-auth";
import "next-auth";
import "next-auth/jwt";

// Extend the built-in types with the fields our authorize() callback returns.
declare module "next-auth" {
  interface User {
    role: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
  }
}
