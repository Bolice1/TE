import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "admin" | "teacher";
    firstName?: string;
    lastName?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "admin" | "teacher";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "teacher";
  }
}
