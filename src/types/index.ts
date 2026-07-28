export type UserRole = "USER" | "ADMIN";

export interface UserSummary {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
}

export interface BlogSummary {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  updatedAt: string;
}
