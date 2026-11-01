import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthService } from "../../src/services/authService";
import { UserRepository } from "../../src/repositories/userRepository";
import { RefreshTokenRepository } from "../../src/repositories/refreshTokenRepository";
import { sendVerificationEmail } from "../../src/utils/emailUtils";
import { REFRESH_TOKEN_EXPIRY_MS } from "../../src/utils/jwtUtil";

// Replace the real database, bcrypt and email sending with fakes.
// Each factory builds its fakes inside, because jest.mock runs before the imports above.
jest.mock("../../src/repositories/userRepository", () => {
  const instance = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
    findByVerificationToken: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  return { UserRepository: jest.fn(() => instance) };
});

jest.mock("../../src/repositories/refreshTokenRepository", () => {
  const instance = {
    create: jest.fn(),
    findByToken: jest.fn(),
    deleteByToken: jest.fn(),
  };
  return { RefreshTokenRepository: jest.fn(() => instance) };
});

jest.mock("../../src/utils/emailUtils", () => ({
  sendVerificationEmail: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// `new X()` hands back the same fake object the service is using
const userRepository = new UserRepository() as jest.Mocked<UserRepository>;
const refreshTokenRepository = new RefreshTokenRepository() as jest.Mocked<RefreshTokenRepository>;
const sendEmailMock = sendVerificationEmail as jest.Mock;
const hashMock = bcrypt.hash as unknown as jest.Mock;
const compareMock = bcrypt.compare as unknown as jest.Mock;

const DAY_MS = 24 * 60 * 60 * 1000;

// A complete user record, as the database would return it
const makeUser = (overrides: Record<string, unknown> = {}): any => ({
  id: 1,
  name: "Test User",
  email: "test@example.com",
  password: "stored-hash",
  role: "User",
  phone: "9800000000",
  isVerified: true,
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  ...overrides,
});

const service = new AuthService();

beforeEach(() => {
  // clearMocks only forgets calls. resetAllMocks also removes answers set by
  // earlier tests, so every test starts from blank fakes.
  jest.resetAllMocks();
  hashMock.mockResolvedValue("hashed-password");
});

describe("AuthService.register", () => {
  const input = {
    name: "New User",
    email: "new@example.com",
    password: "plain-password",
    phone: "9811111111",
  };

  it("creates an unverified account with the User role and a hashed password", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByPhone.mockResolvedValue(null);
    userRepository.create.mockImplementation(async (data: any) => makeUser({ ...data, id: 5 }));

    const before = Date.now();
    await service.register(input);
    const after = Date.now();

    expect(hashMock).toHaveBeenCalledWith("plain-password", 10);

    const saved = userRepository.create.mock.calls[0][0];
    expect(saved.password).toBe("hashed-password");
    expect(saved.password).not.toBe("plain-password");
    expect(saved.role).toBe("User");
    expect(saved.isVerified).toBe(false);
    expect(saved.verificationToken).toMatch(/^[0-9a-f]{64}$/);

    const expiry = (saved.verificationTokenExpiry as Date).getTime();
    expect(expiry).toBeGreaterThanOrEqual(before + DAY_MS);
    expect(expiry).toBeLessThanOrEqual(after + DAY_MS);
  });

  it("emails the same token it saved", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByPhone.mockResolvedValue(null);
    userRepository.create.mockImplementation(async (data: any) => makeUser({ ...data }));

    await service.register(input);

    const savedToken = userRepository.create.mock.calls[0][0].verificationToken;
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    expect(sendEmailMock).toHaveBeenCalledWith("new@example.com", "New User", savedToken);
  });

  it("never returns the password or the verification token", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByPhone.mockResolvedValue(null);
    userRepository.create.mockImplementation(async (data: any) => makeUser({ ...data }));

    const result = await service.register(input);

    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("verificationToken");
    expect(result).not.toHaveProperty("verificationTokenExpiry");
    expect(result.email).toBe("new@example.com");
  });

  it("rejects an email that belongs to a verified account", async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser({ isVerified: true }));

    await expect(service.register(input)).rejects.toMatchObject({
      status: 409,
      message: "Email already registered",
    });

    expect(userRepository.create).not.toHaveBeenCalled();
    expect(userRepository.update).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("rejects a phone number that is already registered", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByPhone.mockResolvedValue(makeUser());

    await expect(service.register(input)).rejects.toMatchObject({
      status: 409,
      message: "Phone number already registered",
    });

    expect(userRepository.create).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  describe("when the email belongs to an unverified account", () => {
    const pending = makeUser({
      id: 9,
      name: "Original Owner",
      email: "new@example.com",
      isVerified: false,
      password: "original-hash",
    });

    it("only issues a new verification link and changes nothing else", async () => {
      userRepository.findByEmail.mockResolvedValue(pending);
      userRepository.update.mockImplementation(async (_id: number, data: any) =>
        makeUser({ ...pending, ...data })
      );

      await service.register({ ...input, name: "Attacker", password: "attacker-password" });

      const [id, changes] = userRepository.update.mock.calls[0];
      expect(id).toBe(9);
      expect(Object.keys(changes).sort()).toEqual(["verificationToken", "verificationTokenExpiry"]);
      expect(changes.verificationToken).toMatch(/^[0-9a-f]{64}$/);

      // The existing password and name must survive
      expect(hashMock).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("sends the new link to the address on the existing account", async () => {
      userRepository.findByEmail.mockResolvedValue(pending);
      userRepository.update.mockImplementation(async (_id: number, data: any) =>
        makeUser({ ...pending, ...data })
      );

      await service.register(input);

      const newToken = userRepository.update.mock.calls[0][1].verificationToken;
      expect(sendEmailMock).toHaveBeenCalledWith("new@example.com", "Original Owner", newToken);
    });
  });
});

describe("AuthService.login", () => {
  const credentials = { email: "test@example.com", password: "secret" };

  it("rejects an unknown email", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(service.login(credentials)).rejects.toMatchObject({
      status: 401,
      message: "Invalid email or password",
    });
  });

  it("rejects a wrong password with the same message as an unknown email", async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());
    compareMock.mockResolvedValue(false);

    await expect(service.login(credentials)).rejects.toMatchObject({
      status: 401,
      message: "Invalid email or password",
    });
    expect(refreshTokenRepository.create).not.toHaveBeenCalled();
  });

  it("blocks an unverified account and says to check the inbox", async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser({ isVerified: false }));
    compareMock.mockResolvedValue(true);

    await expect(service.login(credentials)).rejects.toMatchObject({
      status: 403,
      message: expect.stringContaining("test@example.com"),
    });
    expect(refreshTokenRepository.create).not.toHaveBeenCalled();
  });

  it("blocks a deactivated account", async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser({ isActive: false }));
    compareMock.mockResolvedValue(true);

    await expect(service.login(credentials)).rejects.toMatchObject({
      status: 403,
      message: "Your account has been deactivated. Please contact support.",
    });
    expect(refreshTokenRepository.create).not.toHaveBeenCalled();
  });

  it("does not reveal that an account is unverified or deactivated when the password is wrong", async () => {
    compareMock.mockResolvedValue(false);

    userRepository.findByEmail.mockResolvedValue(makeUser({ isVerified: false }));
    await expect(service.login(credentials)).rejects.toMatchObject({ status: 401 });

    userRepository.findByEmail.mockResolvedValue(makeUser({ isActive: false }));
    await expect(service.login(credentials)).rejects.toMatchObject({ status: 401 });
  });

  it("returns an access token that carries the user's id, email and role", async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser({ id: 7, role: "Employer" }));
    compareMock.mockResolvedValue(true);

    const result = await service.login(credentials);

    const decoded = jwt.verify(result.accessToken, process.env.JWT_SECRET as string) as any;
    expect(decoded).toMatchObject({ id: 7, email: "test@example.com", role: "Employer" });
  });

  it("stores the refresh token for 7 days and returns the same token", async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser({ id: 7 }));
    compareMock.mockResolvedValue(true);

    const before = Date.now();
    const result = await service.login(credentials);
    const after = Date.now();

    expect(result.refreshToken).toMatch(/^[0-9a-f]{80}$/);

    const saved = refreshTokenRepository.create.mock.calls[0][0];
    expect(saved.token).toBe(result.refreshToken);
    expect(saved.userId).toBe(7);
    expect(saved.expiresAt.getTime()).toBeGreaterThanOrEqual(before + REFRESH_TOKEN_EXPIRY_MS);
    expect(saved.expiresAt.getTime()).toBeLessThanOrEqual(after + REFRESH_TOKEN_EXPIRY_MS);
  });

  it("never returns the password or verification fields", async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());
    compareMock.mockResolvedValue(true);

    const result = await service.login(credentials);

    expect(result.user).not.toHaveProperty("password");
    expect(result.user).not.toHaveProperty("verificationToken");
    expect(result.user).not.toHaveProperty("verificationTokenExpiry");
    expect(result.user.email).toBe("test@example.com");
  });
});

describe("AuthService.verifyEmail", () => {
  it("rejects an unknown token", async () => {
    userRepository.findByVerificationToken.mockResolvedValue(null);

    await expect(service.verifyEmail("nope")).rejects.toMatchObject({
      status: 400,
      message: "Invalid or expired verification link",
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("rejects an expired token without verifying the account", async () => {
    userRepository.findByVerificationToken.mockResolvedValue(
      makeUser({
        isVerified: false,
        verificationToken: "abc",
        verificationTokenExpiry: new Date(Date.now() - 1000),
      })
    );

    await expect(service.verifyEmail("abc")).rejects.toMatchObject({ status: 400 });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("verifies the account and clears the token so the link works only once", async () => {
    userRepository.findByVerificationToken.mockResolvedValue(
      makeUser({
        id: 4,
        isVerified: false,
        verificationToken: "abc",
        verificationTokenExpiry: new Date(Date.now() + 60_000),
      })
    );

    await service.verifyEmail("abc");

    expect(userRepository.update).toHaveBeenCalledWith(4, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    });
  });
});

describe("AuthService.refreshAccessToken", () => {
  const storedToken = (overrides: Record<string, unknown> = {}): any => ({
    id: 1,
    token: "refresh-abc",
    userId: 3,
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    ...overrides,
  });

  it("rejects an unknown refresh token", async () => {
    refreshTokenRepository.findByToken.mockResolvedValue(null);

    await expect(service.refreshAccessToken("nope")).rejects.toMatchObject({
      status: 401,
      message: "Invalid refresh token",
    });
  });

  it("rejects an expired refresh token and deletes it", async () => {
    refreshTokenRepository.findByToken.mockResolvedValue(
      storedToken({ expiresAt: new Date(Date.now() - 1000) })
    );

    await expect(service.refreshAccessToken("refresh-abc")).rejects.toMatchObject({ status: 401 });
    expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith("refresh-abc");
  });

  it("rejects when the token's user no longer exists", async () => {
    refreshTokenRepository.findByToken.mockResolvedValue(storedToken());
    userRepository.findById.mockResolvedValue(null);

    await expect(service.refreshAccessToken("refresh-abc")).rejects.toMatchObject({
      status: 401,
      message: "User not found",
    });
  });

  it("issues a new access token with the user's current role", async () => {
    refreshTokenRepository.findByToken.mockResolvedValue(storedToken({ userId: 3 }));
    userRepository.findById.mockResolvedValue(makeUser({ id: 3, role: "Admin" }));

    const accessToken = await service.refreshAccessToken("refresh-abc");

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string) as any;
    expect(decoded).toMatchObject({ id: 3, role: "Admin" });
  });
});

describe("AuthService.logout", () => {
  it("deletes the refresh token so it can't be used again", async () => {
    await service.logout("refresh-abc");

    expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith("refresh-abc");
  });

  it("does nothing when there is no refresh token", async () => {
    await service.logout("");

    expect(refreshTokenRepository.deleteByToken).not.toHaveBeenCalled();
  });
});

describe("AuthService.getCurrentUser", () => {
  it("returns 404 when the user does not exist", async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(service.getCurrentUser(99)).rejects.toMatchObject({
      status: 404,
      message: "User not found",
    });
  });

  it("returns the user without sensitive fields", async () => {
    userRepository.findById.mockResolvedValue(makeUser({ id: 2 }));

    const result = await service.getCurrentUser(2);

    expect(result.id).toBe(2);
    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("verificationToken");
  });
});