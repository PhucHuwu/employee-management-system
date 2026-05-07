import { Module } from '@nestjs/common';
import { ProjectMemberShadowController } from './project-member-shadow.controller';
import { ProjectMemberShadowService } from './project-member-shadow.service';

@Module({
  controllers: [ProjectMemberShadowController],
  providers: [ProjectMemberShadowService],
})
export class ProjectMemberShadowModule {}
