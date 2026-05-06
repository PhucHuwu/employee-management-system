import { Injectable, OnModuleInit } from '@nestjs/common';
import { Permission, Role } from '@prisma/client';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

@Injectable()
export class PermissionService implements OnModuleInit {
  private cache = new Map<string, Permission>();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.loadPermissions();
  }

  async loadPermissions(): Promise<void> {
    const permissions = await this.prisma.permission.findMany();
    this.cache.clear();
    for (const permission of permissions) {
      const key = this.buildKey(permission.resource, permission.action, permission.role);
      this.cache.set(key, permission);
    }
  }

  findPermission(resource: string, action: string, role: Role): Permission | undefined {
    const key = this.buildKey(resource, action, role);
    return this.cache.get(key);
  }

  async clearCache(): Promise<void> {
    this.cache.clear();
    await this.loadPermissions();
  }

  private buildKey(resource: string, action: string, role: Role): string {
    return `${resource}:${action}:${role}`;
  }
}
