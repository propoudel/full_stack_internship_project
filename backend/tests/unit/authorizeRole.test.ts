import { Response, NextFunction } from "express";
import { authorizeRoles } from "../../src/middlewares/roleMiddleware";
import type { AuthRequest } from "../../src/middlewares/authMiddleware";

const mockReq = (user?: Record<string, unknown>): AuthRequest =>
  ({ user } as unknown as AuthRequest);

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

const FORBIDDEN_BODY = {
  sucess: false, // NOTE: matches the typo in the source
  message: "You don't have permission to perform this action",
};

describe("authorizeRoles", () => {
  let res: ReturnType<typeof mockRes>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    res = mockRes();
    next = jest.fn();
  });

  it("returns a middleware function", () => {
    expect(typeof authorizeRoles("ADMIN")).toBe("function");
  });

  describe("allowed", () => {
    it("calls next() when the user's role matches the single allowed role", () => {
      const req = mockReq({ id: "1", role: "ADMIN" });

      authorizeRoles("ADMIN")(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("calls next() when the user's role is one of several allowed roles", () => {
      const req = mockReq({ id: "1", role: "EMPLOYER" });

      authorizeRoles("ADMIN", "EMPLOYER", "JOBSEEKER")(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("forbidden", () => {
    it("returns 403 when the role is not in the allowed list", () => {
      const req = mockReq({ id: "1", role: "JOBSEEKER" });

      authorizeRoles("ADMIN", "EMPLOYER")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(FORBIDDEN_BODY);
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 403 when req.user is undefined (authMiddleware didn't run)", () => {
      const req = mockReq(undefined);

      authorizeRoles("ADMIN")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(FORBIDDEN_BODY);
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 403 when req.user exists but has no role", () => {
      const req = mockReq({ id: "1" });

      authorizeRoles("ADMIN")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 403 when the role is an empty string", () => {
      const req = mockReq({ id: "1", role: "" });

      authorizeRoles("ADMIN")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 403 when no allowed roles are passed", () => {
      const req = mockReq({ id: "1", role: "ADMIN" });

      authorizeRoles()(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("is case-sensitive ('admin' does not match 'ADMIN')", () => {
      const req = mockReq({ id: "1", role: "admin" });

      authorizeRoles("ADMIN")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  it("creates independent middlewares for different role lists", () => {
    const adminOnly = authorizeRoles("ADMIN");
    const employerOnly = authorizeRoles("EMPLOYER");
    const req = mockReq({ id: "1", role: "EMPLOYER" });

    adminOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();

    const res2 = mockRes();
    const next2 = jest.fn();
    employerOnly(req, res2, next2);
    expect(next2).toHaveBeenCalledTimes(1);
    expect(res2.status).not.toHaveBeenCalled();
  });
});