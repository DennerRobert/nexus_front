import { mockDb } from "@/lib/mock-db";
import { ok } from "@/lib/route-handler";

export const GET = async () => {
  const configs = mockDb.getAll("kanban-configs");
  return ok(configs);
};
