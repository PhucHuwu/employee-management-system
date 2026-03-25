import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '@/infrastructure/prisma/prisma.module';
import { CustomersController } from './project.customers.controller';
import { ProjectsController } from './project.projects.controller';
import { AuditLogService } from './services/audit-log.service';
import { CustomerService } from './services/customer.service';
import { LocalStorageAdapter } from './services/storage/local-storage.adapter';
import { MinioStorageAdapter } from './services/storage/minio-storage.adapter';
import { STORAGE_ADAPTER } from './services/storage/storage.adapter';
import { ProjectService } from './services/project.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController, CustomersController],
  providers: [
    ProjectService,
    CustomerService,
    AuditLogService,
    LocalStorageAdapter,
    {
      provide: STORAGE_ADAPTER,
      useFactory: (
        configService: ConfigService,
        localStorageAdapter: LocalStorageAdapter,
      ) => {
        const driver = (configService.get<string>('STORAGE_DRIVER') ?? 'local').toLowerCase();
        if (driver === 'minio') {
          return new MinioStorageAdapter({
            endpoint: configService.get<string>('S3_ENDPOINT') ?? '',
            region: configService.get<string>('S3_REGION') ?? 'us-east-1',
            accessKeyId: configService.get<string>('S3_ACCESS_KEY_ID') ?? '',
            secretAccessKey: configService.get<string>('S3_SECRET_ACCESS_KEY') ?? '',
            bucket: configService.get<string>('S3_BUCKET') ?? '',
            forcePathStyle:
              (configService.get<string>('S3_FORCE_PATH_STYLE') ?? 'true').toLowerCase() !== 'false',
          });
        }

        return localStorageAdapter;
      },
      inject: [ConfigService, LocalStorageAdapter],
    },
  ],
})
export class ProjectModule {}
