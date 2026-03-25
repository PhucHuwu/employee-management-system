import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserAccount } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

@Injectable()
export class IdentityService {
  constructor(private readonly prismaService: PrismaService) {}

  async validateCredentials(email: string, password: string): Promise<UserAccount> {
    const account = await this.prismaService.userAccount.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!account || !account.active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (account.passwordHash !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return account;
  }
}
