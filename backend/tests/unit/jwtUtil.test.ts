import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken, REFRESH_TOKEN_EXPIRY_MS } from "../../src/utils/jwtUtil";

describe("jwtUtil", () => {
    it("puts user's id, emailand role into the access token", () => {
        const token = generateAccessToken({ id: 31, email: "sushantkafle39@gmail.com", role: "User" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        expect(decoded.id).toBe(31);
        expect(decoded.email).toBe("sushantkafle39@gmail.com");
        expect(decoded.role).toBe("User");
    })

    it("makes the access token expire in 15 minutes", () => {
        const token = generateAccessToken({ id: 31, email: "sushantkafle39@gmail.com", role: "User" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        expect(decoded.exp - decoded.iat).toBe(15 * 60);
    });

    it("rejects an access token checked against a different secret", () => {
        const token = generateAccessToken({ id: 31, email: "sushantkafle39@gmail.com", role: "User" });
        expect(() => jwt.verify(token, "some-other-secret")).toThrow();
    });

    it("generates a unique 80-character hex refresh token each time", () => {
        const first = generateRefreshToken();
        const second = generateRefreshToken();

        expect(first).toMatch(/^[0-9a-f]{80}$/);
        expect(first).not.toBe(second);
    });

    it("keeps refresh tokens valid for 7 days", () => {
        expect(REFRESH_TOKEN_EXPIRY_MS).toBe(7 * 24 * 60 * 60 * 1000);
    });
})