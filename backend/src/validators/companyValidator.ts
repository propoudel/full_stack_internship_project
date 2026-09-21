import zod from "zod";

export const createCompanySchema = zod.object({
    name: zod.string().min(3, "Company name must be at least 3 characters long"),
    description: zod.string().min(10, "Description must be at least 10 characters long"),
    logo: zod.url("Logo must be a valid URL"),
    website: zod.url("Website must be a valid URL"),
    email: zod.email("Email must be a valid email address"),
    phone: zod.string().min(10, "Phone number must be at least 10 characters long"),
    address: zod.string().min(10, "Address must be at least 10 characters long"),
    industry: zod.string().min(3, "Industry must be at least 3 characters long"),
    companySize: zod.string().min(3, "Company size must be at least 3 characters long"),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = zod.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = zod.infer<typeof updateCompanySchema>;