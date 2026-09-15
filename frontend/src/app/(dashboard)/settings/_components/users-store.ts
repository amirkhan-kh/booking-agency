import { api } from "@/lib/api";
import type { Role, User } from "@/lib/types";

export type UserPayload = {
  name: string;
  email: string;
  password?: string;
  role: Role;
};

export async function loadUsers(): Promise<User[]> {
  return api<User[]>("/api/v1/users/");
}

export async function createUser(body: UserPayload): Promise<User> {
  return api<User>("/api/v1/users/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateUser(
  id: string,
  body: Partial<UserPayload>,
): Promise<User> {
  return api<User>(`/api/v1/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await api<void>(`/api/v1/users/${id}`, { method: "DELETE" });
}
