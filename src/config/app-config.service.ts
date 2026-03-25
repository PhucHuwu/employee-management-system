import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  getPort(): number {
    return this.getNumber('PORT', 3000);
  }

  getDatabaseUrl(): string {
    return this.getString('DATABASE_URL');
  }

  getJwtSecret(): string {
    return this.getString('JWT_SECRET');
  }

  getJwtExpiresIn(): string {
    return this.getString('JWT_EXPIRES_IN');
  }

  private getString(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  private getNumber(key: string, fallback?: number): number {
    const raw = this.configService.get<string>(key);

    if (!raw) {
      if (fallback !== undefined) {
        return fallback;
      }

      throw new Error(`Missing required environment variable: ${key}`);
    }

    const value = Number(raw);
    if (Number.isNaN(value)) {
      throw new Error(`Environment variable ${key} must be a valid number`);
    }

    return value;
  }
}
