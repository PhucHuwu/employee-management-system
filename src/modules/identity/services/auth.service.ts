import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserAccount } from '@prisma/client';
import { AuthUser } from '../auth-user.type';
import { LoginDto } from '../dto/login.dto';
import { IdentityService } from './identity.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly identityService: IdentityService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; user: AuthUser }> {
    const account = await this.identityService.validateCredentials(dto.email, dto.password);

    const user = this.toAuthUser(account);
    const accessToken = await this.jwtService.signAsync(user);

    return {
      accessToken,
      user,
    };
  }

  private toAuthUser(account: UserAccount): AuthUser {
    return {
      id: account.id,
      email: account.email,
      role: account.role,
      departmentScopeId: account.departmentScopeId,
      projectScopeIds: account.projectScopeIds,
    };
  }
}
