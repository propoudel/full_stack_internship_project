import { JobService } from "../../src/services/jobService";
import { JobRepository } from "../../src/repositories/jobRepository";
import { CompanyRepository } from "../../src/repositories/companyRepository";

// Replace the database with fakes (built inside each factory, because jest.mock runs first)
jest.mock("../../src/repositories/jobRepository", () => {
  const instance = {
    create: jest.fn(),
    findAllOpen: jest.fn(),
    findById: jest.fn(),
    findByIdWithCounts: jest.fn(),
    findByCompanyId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteWithRelations: jest.fn(),
  };
  return { JobRepository: jest.fn(() => instance) };
});

jest.mock("../../src/repositories/companyRepository", () => {
  const instance = { findByOwnerId: jest.fn() };
  return { CompanyRepository: jest.fn(() => instance) };
});

const jobRepository = new JobRepository() as jest.Mocked<JobRepository>;
const companyRepository = new CompanyRepository() as jest.Mocked<CompanyRepository>;

const OWNER_ID = 5; // owns company 3
const STRANGER_ID = 6; // owns company 4, or no company

const makeJob = (overrides: Record<string, unknown> = {}): any => ({
  id: 10,
  companyId: 3,
  title: "Backend Developer",
  description: "Build and maintain our APIs.",
  requirements: "3+ years of Node.js.",
  location: "Kathmandu",
  employmentType: "FullTime",
  experienceLevel: "Mid",
  salaryMin: 50000,
  salaryMax: 80000,
  deadline: new Date("2030-01-01"),
  status: "Open",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  ...overrides,
});

const makeCompany = (overrides: Record<string, unknown> = {}): any => ({
  id: 3,
  ownerId: OWNER_ID,
  name: "Tech Nova",
  ...overrides,
});

// The signed-in user is the owner of company 3
const signInAsOwner = () =>
  companyRepository.findByOwnerId.mockImplementation(async (userId: number) =>
    userId === OWNER_ID ? makeCompany({ id: 3 }) : null
  );

const service = new JobService();

beforeEach(() => {
  // clearMocks only forgets calls. resetAllMocks also removes answers set by earlier tests.
  jest.resetAllMocks();
});

describe("JobService.createJob", () => {
  const input: any = {
    title: "Backend Developer",
    description: "Build and maintain our APIs.",
    requirements: "3+ years of Node.js.",
    location: "Kathmandu",
    experienceLevel: "Mid",
    salaryMin: 50000,
    salaryMax: 80000,
    deadline: new Date("2030-01-01"),
  };

  it("posts the job under the caller's own company", async () => {
    signInAsOwner();
    jobRepository.create.mockResolvedValue(makeJob());

    await service.createJob(OWNER_ID, input);

    expect(jobRepository.create).toHaveBeenCalledWith({ ...input, companyId: 3 });
  });

  it("ignores a companyId sent by the client", async () => {
    signInAsOwner();
    jobRepository.create.mockResolvedValue(makeJob());

    await service.createJob(OWNER_ID, { ...input, companyId: 99 });

    expect(jobRepository.create.mock.calls[0][0].companyId).toBe(3);
  });

  it("refuses a user who has not created a company", async () => {
    signInAsOwner();

    await expect(service.createJob(STRANGER_ID, input)).rejects.toMatchObject({
      status: 400,
      message: "You must create a company before posting a job",
    });
    expect(jobRepository.create).not.toHaveBeenCalled();
  });
});

describe("JobService.getAllJobs", () => {
  it("passes the filters through and works out the page count", async () => {
    jobRepository.findAllOpen.mockResolvedValue({ jobs: [makeJob()], total: 25 });
    const filters = { search: "dev", page: 2, limit: 10 };

    const result = await service.getAllJobs(filters);

    expect(jobRepository.findAllOpen).toHaveBeenCalledWith(filters);
    expect(result).toMatchObject({ total: 25, page: 2, limit: 10, totalPages: 3 });
  });

  it("defaults to page 1 with 10 per page", async () => {
    jobRepository.findAllOpen.mockResolvedValue({ jobs: [], total: 0 });

    const result = await service.getAllJobs({});

    expect(result).toMatchObject({ page: 1, limit: 10, totalPages: 0 });
  });
});

describe("JobService.getJobById (public)", () => {
  it("returns an open job", async () => {
    jobRepository.findById.mockResolvedValue(makeJob({ status: "Open" }));

    await expect(service.getJobById(10)).resolves.toMatchObject({ id: 10 });
  });

  it.each(["Draft", "Closed", "Suspended"])("hides a %s job from the public", async (status) => {
    jobRepository.findById.mockResolvedValue(makeJob({ status }));

    await expect(service.getJobById(10)).rejects.toMatchObject({
      status: 404,
      message: "Job not found",
    });
  });

  it("returns 404 for a job that does not exist", async () => {
    jobRepository.findById.mockResolvedValue(null);

    await expect(service.getJobById(10)).rejects.toMatchObject({ status: 404 });
  });
});

describe("JobService.getMyJobById", () => {
  it("lets the owner see their own job in any status", async () => {
    signInAsOwner();
    jobRepository.findById.mockResolvedValue(makeJob({ status: "Draft" }));

    await expect(service.getMyJobById(OWNER_ID, 10)).resolves.toMatchObject({ status: "Draft" });
  });

  it("refuses someone else's job", async () => {
    companyRepository.findByOwnerId.mockResolvedValue(makeCompany({ id: 4 }));
    jobRepository.findById.mockResolvedValue(makeJob({ companyId: 3 }));

    await expect(service.getMyJobById(STRANGER_ID, 10)).rejects.toMatchObject({ status: 403 });
  });

  it("refuses a user with no company", async () => {
    signInAsOwner();
    jobRepository.findById.mockResolvedValue(makeJob());

    await expect(service.getMyJobById(STRANGER_ID, 10)).rejects.toMatchObject({ status: 403 });
  });

  it("returns 404 when the job does not exist", async () => {
    jobRepository.findById.mockResolvedValue(null);

    await expect(service.getMyJobById(OWNER_ID, 10)).rejects.toMatchObject({ status: 404 });
  });
});

describe("JobService.getMyJobs", () => {
  it("lists the jobs of the caller's company", async () => {
    signInAsOwner();
    jobRepository.findByCompanyId.mockResolvedValue([makeJob(), makeJob({ id: 11 })]);

    const jobs = await service.getMyJobs(OWNER_ID);

    expect(jobRepository.findByCompanyId).toHaveBeenCalledWith(3);
    expect(jobs).toHaveLength(2);
  });

  it("refuses a user with no company", async () => {
    signInAsOwner();

    await expect(service.getMyJobs(STRANGER_ID)).rejects.toMatchObject({ status: 400 });
    expect(jobRepository.findByCompanyId).not.toHaveBeenCalled();
  });
});

describe("JobService.updateJob", () => {
  it("lets the owner edit their job", async () => {
    signInAsOwner();
    jobRepository.findById.mockResolvedValue(makeJob());
    jobRepository.update.mockResolvedValue(makeJob({ title: "Senior Developer" }));

    await service.updateJob(OWNER_ID, 10, { title: "Senior Developer" });

    expect(jobRepository.update).toHaveBeenCalledWith(10, { title: "Senior Developer" });
  });

  it("refuses someone who owns a different company", async () => {
    companyRepository.findByOwnerId.mockResolvedValue(makeCompany({ id: 4 }));
    jobRepository.findById.mockResolvedValue(makeJob({ companyId: 3 }));

    await expect(service.updateJob(STRANGER_ID, 10, { title: "Hijacked" })).rejects.toMatchObject({
      status: 403,
    });
    expect(jobRepository.update).not.toHaveBeenCalled();
  });

  it("refuses a user with no company", async () => {
    signInAsOwner();
    jobRepository.findById.mockResolvedValue(makeJob());

    await expect(service.updateJob(STRANGER_ID, 10, { title: "x" })).rejects.toMatchObject({
      status: 403,
    });
    expect(jobRepository.update).not.toHaveBeenCalled();
  });

  it("returns 404 when the job does not exist", async () => {
    jobRepository.findById.mockResolvedValue(null);

    await expect(service.updateJob(OWNER_ID, 10, { title: "x" })).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe("JobService.deleteJob", () => {
  it("deletes the owner's own job", async () => {
    signInAsOwner();
    jobRepository.findById.mockResolvedValue(makeJob());

    await service.deleteJob(OWNER_ID, 10);

    expect(jobRepository.delete).toHaveBeenCalledWith(10);
  });

  it("refuses to delete a job that belongs to another company", async () => {
    companyRepository.findByOwnerId.mockResolvedValue(makeCompany({ id: 4 }));
    jobRepository.findById.mockResolvedValue(makeJob({ companyId: 3 }));

    await expect(service.deleteJob(STRANGER_ID, 10)).rejects.toMatchObject({ status: 403 });
    expect(jobRepository.delete).not.toHaveBeenCalled();
  });

  it("refuses a user with no company", async () => {
    signInAsOwner();
    jobRepository.findById.mockResolvedValue(makeJob());

    await expect(service.deleteJob(STRANGER_ID, 10)).rejects.toMatchObject({ status: 403 });
    expect(jobRepository.delete).not.toHaveBeenCalled();
  });

  it("returns 404 when the job does not exist", async () => {
    jobRepository.findById.mockResolvedValue(null);

    await expect(service.deleteJob(OWNER_ID, 10)).rejects.toMatchObject({ status: 404 });
  });
});

describe("JobService status changes", () => {
  describe("publishJob", () => {
    it("moves a Draft job to Open", async () => {
      signInAsOwner();
      jobRepository.findById.mockResolvedValue(makeJob({ status: "Draft" }));

      await service.publishJob(OWNER_ID, 10);

      expect(jobRepository.update).toHaveBeenCalledWith(10, { status: "Open" });
    });

    it.each(["Open", "Closed", "Suspended"])("refuses a %s job", async (status) => {
      signInAsOwner();
      jobRepository.findById.mockResolvedValue(makeJob({ status }));

      await expect(service.publishJob(OWNER_ID, 10)).rejects.toMatchObject({
        status: 400,
        message: "Only draft jobs can be published",
      });
      expect(jobRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("deactivateJob", () => {
    it("moves an Open job to Closed", async () => {
      signInAsOwner();
      jobRepository.findById.mockResolvedValue(makeJob({ status: "Open" }));

      await service.deactivateJob(OWNER_ID, 10);

      expect(jobRepository.update).toHaveBeenCalledWith(10, { status: "Closed" });
    });

    it.each(["Draft", "Closed", "Suspended"])("refuses a %s job", async (status) => {
      signInAsOwner();
      jobRepository.findById.mockResolvedValue(makeJob({ status }));

      await expect(service.deactivateJob(OWNER_ID, 10)).rejects.toMatchObject({
        status: 400,
        message: "Only open jobs can be deactivated",
      });
      expect(jobRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("reopenJob", () => {
    it("moves a Closed job back to Open", async () => {
      signInAsOwner();
      jobRepository.findById.mockResolvedValue(makeJob({ status: "Closed" }));

      await service.reopenJob(OWNER_ID, 10);

      expect(jobRepository.update).toHaveBeenCalledWith(10, { status: "Open" });
    });

    it.each(["Draft", "Open", "Suspended"])("refuses a %s job", async (status) => {
      signInAsOwner();
      jobRepository.findById.mockResolvedValue(makeJob({ status }));

      await expect(service.reopenJob(OWNER_ID, 10)).rejects.toMatchObject({
        status: 400,
        message: "Only closed jobs can be reopened",
      });
      expect(jobRepository.update).not.toHaveBeenCalled();
    });
  });

  it.each([
    ["publishJob", "Draft"],
    ["deactivateJob", "Open"],
    ["reopenJob", "Closed"],
  ])("%s refuses a user who does not own the job", async (method, status) => {
    companyRepository.findByOwnerId.mockResolvedValue(makeCompany({ id: 4 }));
    jobRepository.findById.mockResolvedValue(makeJob({ companyId: 3, status }));

    await expect((service as any)[method](STRANGER_ID, 10)).rejects.toMatchObject({ status: 403 });
    expect(jobRepository.update).not.toHaveBeenCalled();
  });

  it.each(["publishJob", "deactivateJob", "reopenJob"])(
    "%s cannot be used by the owner to lift an admin suspension",
    async (method) => {
      signInAsOwner();
      jobRepository.findById.mockResolvedValue(makeJob({ status: "Suspended" }));

      await expect((service as any)[method](OWNER_ID, 10)).rejects.toMatchObject({ status: 400 });
      expect(jobRepository.update).not.toHaveBeenCalled();
    }
  );
});