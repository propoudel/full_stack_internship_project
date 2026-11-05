import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../../src/middlewares/validateMiddleware";

const mockReq = (body?: unknown): Request =>
  ({ body } as unknown as Request);

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

const schema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

describe("validate middleware", () => {
  let res: ReturnType<typeof mockRes>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    res = mockRes();
    next = jest.fn();
  });

  it("returns a middleware function", () => {
    expect(typeof validate(schema)).toBe("function");
  });

  describe("valid body", () => {
    it("calls next() and does not send a response", () => {
      const req = mockReq({ email: "a@b.com", password: "secret123" });

      validate(schema)(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("replaces req.body with the parsed data (strips unknown keys)", () => {
      const req = mockReq({
        email: "a@b.com",
        password: "secret123",
        isAdmin: true, // should be stripped by z.object
      });

      validate(schema)(req, res, next);

      expect(req.body).toEqual({ email: "a@b.com", password: "secret123" });
      expect(req.body).not.toHaveProperty("isAdmin");
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("applies schema transforms and defaults to req.body", () => {
      const transformSchema = z.object({
        name: z.string().trim(),
        role: z.string().default("JOBSEEKER"),
      });
      const req = mockReq({ name: "  John  " });

      validate(transformSchema)(req, res, next);

      expect(req.body).toEqual({ name: "John", role: "JOBSEEKER" });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("coerces values when the schema uses z.coerce", () => {
      const coerceSchema = z.object({ salary: z.coerce.number() });
      const req = mockReq({ salary: "5000" });

      validate(coerceSchema)(req, res, next);

      expect(req.body).toEqual({ salary: 5000 });
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe("invalid body", () => {
    it("returns 400 with the validation payload and does not call next()", () => {
      const req = mockReq({ email: "not-an-email", password: "123" });

      validate(schema)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: expect.any(Object),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("includes per-field errors produced by z.treeifyError", () => {
      const body = { email: "not-an-email", password: "123" };
      const req = mockReq(body);

      validate(schema)(req, res, next);

      const expectedErrors = z.treeifyError(schema.safeParse(body).error!);
      const payload = res.json.mock.calls[0][0];

      expect(payload.errors).toEqual(expectedErrors);
      expect(payload.errors.properties).toHaveProperty("email");
      expect(payload.errors.properties).toHaveProperty("password");
    });

    it("only reports the fields that failed", () => {
      const req = mockReq({ email: "a@b.com", password: "123" });

      validate(schema)(req, res, next);

      const payload = res.json.mock.calls[0][0];
      expect(payload.errors.properties).toHaveProperty("password");
      expect(payload.errors.properties).not.toHaveProperty("email");
    });

    it("returns 400 when required fields are missing", () => {
      const req = mockReq({});

      validate(schema)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const payload = res.json.mock.calls[0][0];
      expect(payload.errors.properties).toHaveProperty("email");
      expect(payload.errors.properties).toHaveProperty("password");
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 (and does not throw) when req.body is undefined", () => {
      const req = mockReq(undefined);

      expect(() => validate(schema)(req, res, next)).not.toThrow();

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when req.body is null", () => {
      const req = mockReq(null);

      validate(schema)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("does not modify req.body when validation fails", () => {
      const body = { email: "bad", password: "123", extra: "keep-me" };
      const req = mockReq(body);

      validate(schema)(req, res, next);

      expect(req.body).toEqual({ email: "bad", password: "123", extra: "keep-me" });
    });

    it("rejects wrong types", () => {
      const req = mockReq({ email: 123, password: ["x"] });

      validate(schema)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  it("validates only req.body (ignores query and params)", () => {
    const req = {
      body: { email: "a@b.com", password: "secret123" },
      query: { email: "nope" },
      params: { password: "x" },
    } as unknown as Request;

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});