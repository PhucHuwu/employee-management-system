import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserAccount } from '@prisma/client';
import { compare } from 'bcrypt';
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

    const isMatch = await compare(password, account.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return account;
  }
}
