import { z } from "zod";



export const MongoIdBase = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");



export const MongoIdParamSchema = z.object({
  hostId: MongoIdBase,
});
