import {CompanyService} from "../../src/services/companyService";
import {CompanyRepository} from "../../src/repositories/companyRepository";
import {sendProfileReminderEmail} from "../../src/utils/emailUtils";

jest.mock("../../src/repositories/companyRepository",()=>{
    const instance={
        findByOwnerId: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete:jest.fn(),
        findByEmail: jest.fn(),
        findByPhone: jest.fn(),
        countApplications: jest.fn(),
        deleteWithRelations: jest.fn(),
    };
    return { CompanyRepository: jest.fn(()=> instance)};
});

jest.mock("../../src/utils/emailUtils",()=>({
    sendProfileReminderEmail: jest.fn(),
}));

const companyRepository = new CompanyRepository() as jest.Mocked<CompanyRepository>;
const sendReminderMock = sendProfileReminderEmail as jest.Mock;

const OWNER_ID = 4;
const STRANGER_ID = 6;

const makeCompany= (overrides: Record<string, unknown> ={}): any =>({
     id: 3,
  ownerId: OWNER_ID,
  name: "Tech Nova",
  description: "Software for startups.",
  logo: "https://logo1.com/logo.png",
  website: "https://technova.example.com",
  email: "contact@technova.com",
  phone: "9873593959",
  address: "Kathmandu",
  industry: "IT",
  companySize: "50-100",
  createdAt: new Date("2026-11-01"),
  updatedAt: new Date("2026-11-02"),
  ...overrides,
});

const service = new CompanyService();

beforeEach(()=> {
    jest.resetAllMocks();
});

describe("CompanyService.createCompany",()=>{
     const input: any = {
    name: "Tech Nova",
    description: "Software for startups.",
    logo: "https://logo1.com/logo.png",
    website: "https://technova.example.com",
    email: "contact@technova.com",
    phone: "9873593959",
    address: "Kathmandu",
    industry: "IT",
    companySize: "50-100",
};

const free = () =>{
    companyRepository.findByOwnerId.mockResolvedValue(null);
    companyRepository.findByEmail.mockResolvedValue(null);
    companyRepository.findByPhone.mockResolvedValue(null);
    companyRepository.create.mockResolvedValue(makeCompany());
};

it("creates the company with the caller as its owner",async()=>{
    free();
     await service.createCompany(OWNER_ID,"owner","owner@gmail.com",input);
    expect(companyRepository.create).toHaveBeenCalledWith({...input, ownerId: OWNER_ID});
});
it("allows only one company per user", async () => {
    free();
    companyRepository.findByOwnerId.mockResolvedValue(makeCompany());

    await expect(
      service.createCompany(OWNER_ID, "Employer", "owner@gmail.com", input)
    ).rejects.toMatchObject({ status: 409, message: "User already has a company" });
    expect(companyRepository.create).not.toHaveBeenCalled();
  });

  it("rejects an email that another company already uses", async () => {
    free();
    companyRepository.findByEmail.mockResolvedValue(makeCompany({ id: 9, ownerId: 99 }));

    await expect(
      service.createCompany(OWNER_ID, "Employer", "owner@gmail.com", input)
    ).rejects.toMatchObject({ status: 409 });
    expect(companyRepository.create).not.toHaveBeenCalled();
  });

  it("rejects a phone number that another company already uses", async () => {
    free();
    companyRepository.findByPhone.mockResolvedValue(makeCompany({ id: 9, ownerId: 99 }));

    await expect(
      service.createCompany(OWNER_ID, "Employer", "owner@gmail.com", input)
    ).rejects.toMatchObject({ status: 409 });
    expect(companyRepository.create).not.toHaveBeenCalled();
  });

  it("warns a default User and sends them a reminder email", async () => {
    free();

    const result = await service.createCompany(OWNER_ID, "User", "owner@gmail.com", input);

    expect(result.warning).toEqual(expect.any(String));
    expect(sendReminderMock).toHaveBeenCalledWith("owner@gmail.com");
  });

  it.each(["JobSeeker", "Employer", "Admin"])(
    "gives a %s no warning and sends no email",
    async (role) => {
      free();

      const result = await service.createCompany(OWNER_ID, role, "owner@gmail.com", input);

      expect(result.warning).toBeUndefined();
      expect(sendReminderMock).not.toHaveBeenCalled();
    }
  );

  it("sends no reminder when the company could not be created", async () => {
    free();
    companyRepository.findByOwnerId.mockResolvedValue(makeCompany());

    await expect(
      service.createCompany(OWNER_ID, "User", "owner@gmail.com", input)
    ).rejects.toBeDefined();
    expect(sendReminderMock).not.toHaveBeenCalled();
  });
});

describe("CompanyService read methods", () => {
  it("getMyCompany returns the caller's company", async () => {
    companyRepository.findByOwnerId.mockResolvedValue(makeCompany());

    await expect(service.getMyCompany(OWNER_ID)).resolves.toMatchObject({ id: 3 });
    expect(companyRepository.findByOwnerId).toHaveBeenCalledWith(OWNER_ID);
  });

  it("getMyCompany returns 404 when the caller has none", async () => {
    companyRepository.findByOwnerId.mockResolvedValue(null);

    await expect(service.getMyCompany(OWNER_ID)).rejects.toMatchObject({ status: 404 });
  });

  it("getAllCompanies returns every company", async () => {
    companyRepository.findAll.mockResolvedValue([makeCompany(), makeCompany({ id: 4 })]);

    await expect(service.getAllCompanies()).resolves.toHaveLength(2);
  });

  it("getCompanyById returns the company", async () => {
    companyRepository.findById.mockResolvedValue(makeCompany());

    await expect(service.getCompanyById(3)).resolves.toMatchObject({ id: 3 });
  });

  it("getCompanyById returns 404 when it does not exist", async () => {
    companyRepository.findById.mockResolvedValue(null);

    await expect(service.getCompanyById(3)).rejects.toMatchObject({ status: 404 });
  });
});

describe("CompanyService.updateCompany", () => {
  it("lets the owner update their company", async () => {
    companyRepository.findById.mockResolvedValue(makeCompany());
    companyRepository.update.mockResolvedValue(makeCompany({ industry: "Fintech" }));

    await service.updateCompany(OWNER_ID, 3, { industry: "Fintech" });

    expect(companyRepository.update).toHaveBeenCalledWith(3, { industry: "Fintech" });
  });

  it("refuses someone who is not the owner", async () => {
    companyRepository.findById.mockResolvedValue(makeCompany());

    await expect(service.updateCompany(STRANGER_ID, 3, { industry: "x" })).rejects.toMatchObject({
      status: 403,
    });
    expect(companyRepository.update).not.toHaveBeenCalled();
  });

  it("returns 404 when the company does not exist", async () => {
    companyRepository.findById.mockResolvedValue(null);

    await expect(service.updateCompany(OWNER_ID, 3, { industry: "x" })).rejects.toMatchObject({
      status: 404,
    });
  });

  it("rejects an email that belongs to a different company", async () => {
    companyRepository.findById.mockResolvedValue(makeCompany());
    companyRepository.findByEmail.mockResolvedValue(makeCompany({ id: 9, ownerId: 99 }));

    await expect(
      service.updateCompany(OWNER_ID, 3, { email: "taken@example.com" })
    ).rejects.toMatchObject({ status: 409 });
    expect(companyRepository.update).not.toHaveBeenCalled();
  });

  it("rejects a phone number that belongs to a different company", async () => {
    companyRepository.findById.mockResolvedValue(makeCompany());
    companyRepository.findByPhone.mockResolvedValue(makeCompany({ id: 9, ownerId: 99 }));

    await expect(
      service.updateCompany(OWNER_ID, 3, { phone: "9878439548" })
    ).rejects.toMatchObject({ status: 409 });
    expect(companyRepository.update).not.toHaveBeenCalled();
  });

  it("does not treat re-sending the company's own email and phone as a duplicate", async () => {
    companyRepository.findById.mockResolvedValue(makeCompany());
    companyRepository.update.mockResolvedValue(makeCompany());

    await service.updateCompany(OWNER_ID, 3, {
      email: "contact@technova.com",
      phone: "9873593959",
    });

    expect(companyRepository.findByEmail).not.toHaveBeenCalled();
    expect(companyRepository.findByPhone).not.toHaveBeenCalled();
    expect(companyRepository.update).toHaveBeenCalledTimes(1);
  });
});

describe("CompanyService.deleteCompany", () => {
  it("deletes the owner's company together with its jobs", async () => {
    companyRepository.findById.mockResolvedValue(makeCompany());
    companyRepository.countApplications.mockResolvedValue(0);

    await service.deleteCompany(OWNER_ID, 3);

    expect(companyRepository.deleteWithRelations).toHaveBeenCalledWith(3);
  });

  it("refuses someone who is not the owner", async () => {
    companyRepository.findById.mockResolvedValue(makeCompany());
    companyRepository.countApplications.mockResolvedValue(0);

    await expect(service.deleteCompany(STRANGER_ID, 3)).rejects.toMatchObject({ status: 403 });
    expect(companyRepository.deleteWithRelations).not.toHaveBeenCalled();
    expect(companyRepository.delete).not.toHaveBeenCalled();
  });

  it("refuses to delete a company whose jobs have received applications", async () => {
    companyRepository.findById.mockResolvedValue(makeCompany());
    companyRepository.countApplications.mockResolvedValue(4);

    await expect(service.deleteCompany(OWNER_ID, 3)).rejects.toMatchObject({
      status: 409,
      message: expect.stringContaining("4 application"),
    });
    expect(companyRepository.deleteWithRelations).not.toHaveBeenCalled();
  });

  it("returns 404 when the company does not exist", async () => {
    companyRepository.findById.mockResolvedValue(null);

    await expect(service.deleteCompany(OWNER_ID, 3)).rejects.toMatchObject({ status: 404 });
  });
})
