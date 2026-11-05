import { Response, NextFunction } from "express";
import type { AuthRequest } from "../../src/middlewares/authMiddleware";

jest.mock("jsonwebtoken");

const TEST_SECRET = "test-secret";

let authMiddleware: typeof import("../../src/middlewares/authMiddleware").authMiddleware;
let verifyMock: jest.Mock;

// JWT_SECRET is read once at module load, so set it BEFORE requiring the module.
beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
  jest.isolateModules(() => {
    const jwt = require("jsonwebtoken");
    verifyMock = jwt.verify as jest.Mock;
    authMiddleware = require("../../src/middlewares/authMiddleware").authMiddleware;
  });
});

const mockReq = (overrides: Record<string, unknown> = {}): AuthRequest =>
  ({ cookies: {}, headers: {}, ...overrides } as unknown as AuthRequest);

const mockRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
};

describe("authMiddleware", () => {
  let res: ReturnType<typeof mockRes>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockRes();
    next = jest.fn();
  });

  describe("when no token is provided", () => {
    it("returns 401 when req.cookies is undefined", () => {
      const req = mockReq({ cookies: undefined });

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false, 
        message: "No token provided",
      });
      expect(next).not.toHaveBeenCalled();
      expect(verifyMock).not.toHaveBeenCalled();
    });

    it("returns 401 when cookies exist but accessToken is missing", () => {
      const req = mockReq({ cookies: { somethingElse: "abc" } });

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "No token provided" })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when accessToken is an empty string", () => {
      const req = mockReq({ cookies: { accessToken: "" } });

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
      expect(verifyMock).not.toHaveBeenCalled();
    });

    it("ignores a token sent in the Authorization header (cookie only)", () => {
      const req = mockReq({
        cookies: {},
        headers: { authorization: "Bearer valid.header.token" },
      });

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(verifyMock).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("when a token is provided", () => {
    it("verifies the token with JWT_SECRET", () => {
      verifyMock.mockReturnValue({ id: "1", role: "ADMIN" });
      const req = mockReq({ cookies: { accessToken: "valid.token" } });

      authMiddleware(req, res, next);

      expect(verifyMock).toHaveBeenCalledTimes(1);
      expect(verifyMock).toHaveBeenCalledWith("valid.token", TEST_SECRET);
    });

    it("attaches the decoded payload to req.user and calls next()", () => {
      const payload = { id: "user-123", email: "a@b.com", role: "ADMIN" };
      verifyMock.mockReturnValue(payload);
      const req = mockReq({ cookies: { accessToken: "valid.token" } });

      authMiddleware(req, res, next);

      expect(req.user).toEqual(payload);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); 
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("returns 401 when jwt.verify throws (invalid signature)", () => {
      verifyMock.mockImplementation(() => {
        throw new Error("invalid signature");
      });
      const req = mockReq({ cookies: { accessToken: "tampered.token" } });

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid or expired token",
      });
      expect(next).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it("returns 401 when the token is expired", () => {
      verifyMock.mockImplementation(() => {
        const err = new Error("jwt expired");
        err.name = "TokenExpiredError";
        throw err;
      });
      const req = mockReq({ cookies: { accessToken: "expired.token" } });

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Invalid or expired token" })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when the token is malformed", () => {
      verifyMock.mockImplementation(() => {
        const err = new Error("jwt malformed");
        err.name = "JsonWebTokenError";
        throw err;
      });
      const req = mockReq({ cookies: { accessToken: "not-a-jwt" } });

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});