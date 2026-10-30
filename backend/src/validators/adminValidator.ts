import { z } from "zod";

export const updateUserRoleSchema = z.object({
  role: z.enum(["User", "JobSeeker", "Employer", "Admin"]),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const updateJobStatusSchema = z.object({
  status: z.enum(["Open", "Suspended"]),
});