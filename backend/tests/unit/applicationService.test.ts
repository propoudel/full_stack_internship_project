import { ApplicationService } from "../../src/services/applicationService";
import { ApplicationRepository } from "../../src/repositories/applicationRepository";
import { JobRepository } from "../../src/repositories/jobRepository";
import { CompanyRepository } from "../../src/repositories/companyRepository";

jest.mock("../../src/repositories/applicationRepository", () => {
  const instance = {
    create: jest.fn(),
    findByApplicantAndJob: jest.fn(),
    findById: jest.fn(),
    findByApplicant: jest.fn(),
    findByJob: jest.fn(),
    updateStatus: jest.fn(),
  };
  return { ApplicationRepository: jest.fn(() => instance) };
});

jest.mock("../../src/repositories/jobRepository", () => {
  const instance = { findById: jest.fn() };
  return { JobRepository: jest.fn(() => instance) };
});

jest.mock("../../src/repositories/companyRepository", () => {
  const instance = { findByOwnerId: jest.fn() };
  return { CompanyRepository: jest.fn(() => instance) };
});

const applicationRepository = new ApplicationRepository() as jest.Mocked<ApplicationRepository>;
const jobRepository = new JobRepository() as jest.Mocked<JobRepository>;
const companyRepository = new CompanyRepository() as jest.Mocked<CompanyRepository>;

// The scenario: job 10 belongs to company 3, which is owned by user 5.
// User 7 applied to it. User 8 is a stranger.
const OWNER_ID = 5;
const APPLICANT_ID = 7;
const STRANGER_ID = 8;

const makeJob = (overrides: Record<string, unknown> = {}): any => ({
  id: 10,
  companyId: 3,
  title: "Backend Developer",
  status: "Open",
  ...overrides,
});

const makeCompany = (overrides: Record<string, unknown> = {}): any => ({
  id: 3,
  ownerId: OWNER_ID,
  name: "Tech Nova",
  ...overrides,
});

const makeApplication = (overrides: Record<string, unknown> = {}): any => ({
  id: 20,
  resumeUrl: "https://example.com/resume.pdf",
  Experience: "Three years building REST APIs.",
  status: "Pending",
  applicantId: APPLICANT_ID,
  jobId: 10,
  appliedAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  ...overrides,
});

// Only the job's company owner has a company
const ownerHasCompany = () =>
  companyRepository.findByOwnerId.mockImplementation(async (userId: number) =>
    userId === OWNER_ID ? makeCompany({ id: 3 }) : null
  );

const service = new ApplicationService();

beforeEach(() => {
  jest.resetAllMocks();
});

describe("ApplicationService.applyToJob", () => {
  const input: any = {
    resumeUrl: "https://example.com/resume.pdf",
    Experience: "Three years building REST APIs.",
  };

  const open = () => {
    jobRepository.findById.mockResolvedValue(makeJob());
    companyRepository.findByOwnerId.mockResolvedValue(null);
    applicationRepository.findByApplicantAndJob.mockResolvedValue(null);
    applicationRepository.create.mockResolvedValue(makeApplication());
  };

  it("saves the application for the caller and the job", async () => {
    open();

    await service.applyToJob(APPLICANT_ID, 10, input);

    expect(applicationRepository.create).toHaveBeenCalledWith({
      resumeUrl: "https://example.com/resume.pdf",
      Experience: "Three years building REST APIs.",
      applicantId: APPLICANT_ID,
      jobId: 10,
    });
  });

  it("returns 404 when the job does not exist", async () => {
    jobRepository.findById.mockResolvedValue(null);

    await expect(service.applyToJob(APPLICANT_ID, 10, input)).rejects.toMatchObject({
      status: 404,
      message: "Job not found",
    });
    expect(applicationRepository.create).not.toHaveBeenCalled();
  });

  it.each(["Draft", "Closed", "Suspended"])("refuses a %s job", async (status) => {
    open();
    jobRepository.findById.mockResolvedValue(makeJob({ status }));

    await expect(service.applyToJob(APPLICANT_ID, 10, input)).rejects.toMatchObject({
      status: 400,
      message: "Job is not open to apply",
    });
    expect(applicationRepository.create).not.toHaveBeenCalled();
  });

  it("blocks applying to a job posted by your own company", async () => {
    open();
    companyRepository.findByOwnerId.mockResolvedValue(makeCompany({ id: 3 })); // same company as the job

    await expect(service.applyToJob(OWNER_ID, 10, input)).rejects.toMatchObject({
      status: 400,
      message: "You cannot apply to your own company's job",
    });
    expect(applicationRepository.create).not.toHaveBeenCalled();
  });

  it("lets a user who owns a different company apply", async () => {
    open();
    companyRepository.findByOwnerId.mockResolvedValue(makeCompany({ id: 4 })); // another company

    await service.applyToJob(STRANGER_ID, 10, input);

    expect(applicationRepository.create).toHaveBeenCalledTimes(1);
  });

  it("blocks a second application to the same job", async () => {
    open();
    applicationRepository.findByApplicantAndJob.mockResolvedValue(makeApplication());

    await expect(service.applyToJob(APPLICANT_ID, 10, input)).rejects.toMatchObject({
      status: 409,
      message: "You have already applied to this job",
    });
    expect(applicationRepository.create).not.toHaveBeenCalled();
  });
});

describe("ApplicationService.getMyApplications", () => {
  it("returns the caller's own applications", async () => {
    applicationRepository.findByApplicant.mockResolvedValue([makeApplication()]);

    const result = await service.getMyApplications(APPLICANT_ID);

    expect(applicationRepository.findByApplicant).toHaveBeenCalledWith(APPLICANT_ID);
    expect(result).toHaveLength(1);
  });
});

describe("ApplicationService.getApplicationsForJob", () => {
  it("shows the applicants to the owner of the job's company", async () => {
    ownerHasCompany();
    jobRepository.findById.mockResolvedValue(makeJob());
    applicationRepository.findByJob.mockResolvedValue([makeApplication()]);

    await expect(service.getApplicationsForJob(OWNER_ID, 10)).resolves.toHaveLength(1);
    expect(applicationRepository.findByJob).toHaveBeenCalledWith(10);
  });

  it("hides the applicants from a user who owns another company", async () => {
    companyRepository.findByOwnerId.mockResolvedValue(makeCompany({ id: 4 }));
    jobRepository.findById.mockResolvedValue(makeJob({ companyId: 3 }));

    await expect(service.getApplicationsForJob(STRANGER_ID, 10)).rejects.toMatchObject({
      status: 403,
    });
    expect(applicationRepository.findByJob).not.toHaveBeenCalled();
  });

  it("hides the applicants from a user with no company", async () => {
    ownerHasCompany();
    jobRepository.findById.mockResolvedValue(makeJob());

    await expect(service.getApplicationsForJob(STRANGER_ID, 10)).rejects.toMatchObject({
      status: 403,
    });
  });

  it("returns 404 when the job does not exist", async () => {
    jobRepository.findById.mockResolvedValue(null);

    await expect(service.getApplicationsForJob(OWNER_ID, 10)).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe("ApplicationService.getApplicationById", () => {
  it("lets the applicant read their own application", async () => {
    applicationRepository.findById.mockResolvedValue(makeApplication());

    await expect(service.getApplicationById(APPLICANT_ID, 20)).resolves.toMatchObject({ id: 20 });
  });

  it("lets the job's company owner read it", async () => {
    ownerHasCompany();
    applicationRepository.findById.mockResolvedValue(makeApplication());
    jobRepository.findById.mockResolvedValue(makeJob());

    await expect(service.getApplicationById(OWNER_ID, 20)).resolves.toMatchObject({ id: 20 });
  });

  it("refuses a stranger with no company", async () => {
    ownerHasCompany();
    applicationRepository.findById.mockResolvedValue(makeApplication());
    jobRepository.findById.mockResolvedValue(makeJob());

    await expect(service.getApplicationById(STRANGER_ID, 20)).rejects.toMatchObject({ status: 403 });
  });

  it("refuses the owner of a different company", async () => {
    companyRepository.findByOwnerId.mockResolvedValue(makeCompany({ id: 4 }));
    applicationRepository.findById.mockResolvedValue(makeApplication());
    jobRepository.findById.mockResolvedValue(makeJob({ companyId: 3 }));

    await expect(service.getApplicationById(STRANGER_ID, 20)).rejects.toMatchObject({ status: 403 });
  });

  it("returns 404 when the application does not exist", async () => {
    applicationRepository.findById.mockResolvedValue(null);

    await expect(service.getApplicationById(APPLICANT_ID, 20)).rejects.toMatchObject({ status: 404 });
  });
});

describe("ApplicationService.updateStatus", () => {
  it("lets the job's company owner change the status", async () => {
    ownerHasCompany();
    applicationRepository.findById.mockResolvedValue(makeApplication());
    jobRepository.findById.mockResolvedValue(makeJob());
    applicationRepository.updateStatus.mockResolvedValue(makeApplication({ status: "Accepted" }));

    await service.updateStatus(OWNER_ID, 20, "Accepted");

    expect(applicationRepository.updateStatus).toHaveBeenCalledWith(20, "Accepted");
  });

  it("does not let applicants change the status of their own application", async () => {
    ownerHasCompany();
    applicationRepository.findById.mockResolvedValue(makeApplication());
    jobRepository.findById.mockResolvedValue(makeJob());

    await expect(service.updateStatus(APPLICANT_ID, 20, "Accepted")).rejects.toMatchObject({
      status: 403,
    });
    expect(applicationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it("does not let the owner of a different company change it", async () => {
    companyRepository.findByOwnerId.mockResolvedValue(makeCompany({ id: 4 }));
    applicationRepository.findById.mockResolvedValue(makeApplication());
    jobRepository.findById.mockResolvedValue(makeJob({ companyId: 3 }));

    await expect(service.updateStatus(STRANGER_ID, 20, "Rejected")).rejects.toMatchObject({
      status: 403,
    });
    expect(applicationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it("returns 404 when the application does not exist", async () => {
    applicationRepository.findById.mockResolvedValue(null);

    await expect(service.updateStatus(OWNER_ID, 20, "Accepted")).rejects.toMatchObject({
      status: 404,
    });
  });

  it("returns 404 when the application's job no longer exists", async () => {
    applicationRepository.findById.mockResolvedValue(makeApplication());
    jobRepository.findById.mockResolvedValue(null);

    await expect(service.updateStatus(OWNER_ID, 20, "Accepted")).rejects.toMatchObject({
      status: 404,
    });
  });
});