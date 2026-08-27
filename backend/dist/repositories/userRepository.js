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
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.findUnique({ where: { email } });
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
}
exports.UserRepository = UserRepository;
