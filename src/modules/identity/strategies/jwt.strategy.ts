import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../auth-user.type';

interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  departmentScopeId?: string | null;
  projectScopeIds?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      departmentScopeId: payload.departmentScopeId,
      projectScopeIds: payload.projectScopeIds ?? [],
    };
  }
}
