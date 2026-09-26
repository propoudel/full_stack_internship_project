import { z } from "zod";

const employmentTypeEnum = z.enum(["FullTime", "PartTime", "Contract", "Internship", "Remote"]);

export const createJobSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  employmentType: employmentTypeEnum.optional(),
  experienceLevel: z.string().min(1, "Experience level is required"),
  salaryMin: z.number().positive("Minimum salary must be a positive number"),
  salaryMax: z.number().positive("Maximum salary must be a positive number"),
  deadline: z.coerce.date().refine((date) => date > new Date(), {
    message: "Deadline must be in the future",
  }),
});

export const updateJobSchema = createJobSchema.partial();

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;