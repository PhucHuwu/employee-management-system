import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminManagerScopeController } from './controllers/admin-manager-scope.controller';
import { AdminPermissionController } from './controllers/admin-permission.controller';
import { AuthController } from './controllers/auth.controller';
import { DataScopeGuard } from './guards/data-scope.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './services/auth.service';
import { IdentityService } from './services/identity.service';
import { PermissionService } from './services/permission.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') ?? '1h' },
      }),
    }),
  ],
  controllers: [AuthController, AdminPermissionController, AdminManagerScopeController],
  providers: [
    IdentityService,
    AuthService,
    JwtStrategy,
    PermissionService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: DataScopeGuard,
    },
  ],
  exports: [IdentityService, PermissionService],
})
export class IdentityModule {}
