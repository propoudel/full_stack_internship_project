import { prisma } from "../config/prisma";
import { RefreshToken } from "@prisma/client";

export class RefreshTokenRepository{
    public async create(data :{
        token:string;
        userId:number;
        expiresAt:Date;
    }): Promise<RefreshToken>{
        return prisma.refreshToken.create({data});
    }

    public async findByToken(token:string): Promise<RefreshToken | null>{
        return prisma.refreshToken.findUnique({where:{token}});
    }

    public async deleteByToken(token:string): Promise<void>{
        await prisma.refreshToken.deleteMany({where:{token}});
    }

    public async deleteAllForUser(userId:number): Promise<void>{
        await prisma.refreshToken.deleteMany({where: {userId}});
    }
}