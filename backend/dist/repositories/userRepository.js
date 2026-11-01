"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = require("../config/prisma");
const safeUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    phone: true,
    isVerified: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
};
class UserRepository {
    // Get all users from the database
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.findMany();
        });
    }
    // Get a single user by their id
    // Returns null if no user is found with that id
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.findUnique({ where: { id } });
        });
    }
    findByPhone(phone) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.findUnique({ where: { phone } });
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.findUnique({ where: { email } });
        });
    }
    findByVerificationToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.findFirst({ where: { verificationToken: token } });
        });
    }
    // Create a new User in the database
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.create({ data });
        });
    }
    // update an existing user by id
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.update({
                where: { id },
                data
            });
        });
    }
    // delete a user by id
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.delete({ where: { id } });
        });
    }
    // Get all users for admin with optional filters
    findAllForAdmin(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, role, isActive, page = 1, limit = 10 } = filters;
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ];
            }
            if (role)
                where.role = role;
            if (isActive !== undefined)
                where.isActive = isActive;
            const [users, total] = yield Promise.all([
                prisma_1.prisma.user.findMany({
                    where,
                    select: safeUserSelect,
                    orderBy: { createdAt: "desc" },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                prisma_1.prisma.user.count({ where }),
            ]);
            return { users, total };
        });
    }
    findByIdForAdmin(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.findUnique({ where: { id }, select: safeUserSelect });
        });
    }
}
exports.UserRepository = UserRepository;
