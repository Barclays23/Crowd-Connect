import { z } from "zod";



export const MongoIdBase = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");



export const MongoIdParamSchema = z.object({
  _id: MongoIdBase,
});



export const UserIdParamSchema = z.object({
  userId: MongoIdBase
});

export const HostIdParamSchema = z.object({
  userId: MongoIdBase
});

export const EventIdParamSchema = z.object({
  eventId: MongoIdBase
});
