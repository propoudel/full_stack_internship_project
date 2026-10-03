import { z } from "zod";

export const applyToJobSchema = z.object({
  resumeUrl: z.url("Resume must be a valid URL"),
  Experience: z.string().min(10, "Experience must be at least 10 characters").optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["Pending", "Reviewed", "Accepted", "Rejected"]),
});

export type ApplyToJobInput = z.infer<typeof applyToJobSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;