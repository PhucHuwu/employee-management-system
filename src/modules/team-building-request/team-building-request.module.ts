import { Module } from '@nestjs/common';
import { TeamBuildingRequestController } from './team-building-request.controller';
import { TeamBuildingRequestService } from './team-building-request.service';

@Module({
  controllers: [TeamBuildingRequestController],
  providers: [TeamBuildingRequestService],
})
export class TeamBuildingRequestModule {}
