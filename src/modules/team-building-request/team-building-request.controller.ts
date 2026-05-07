import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { TeamBuildingRequestService } from './team-building-request.service';
import { CreateTeamBuildingRequestDto } from './dto/create-team-building-request.dto';
import { UpdateTeamBuildingRequestDto } from './dto/update-team-building-request.dto';

@Controller('team-building-requests')
export class TeamBuildingRequestController {
  constructor(private readonly teamBuildingRequestService: TeamBuildingRequestService) {}

  @Post()
  create(@Body() dto: CreateTeamBuildingRequestDto) {
    // TODO: extract pmId from auth context
    return this.teamBuildingRequestService.create(dto, '');
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.teamBuildingRequestService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamBuildingRequestService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeamBuildingRequestDto,
  ) {
    return this.teamBuildingRequestService.update(id, dto);
  }

  @Post(':id/approve')
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamBuildingRequestService.approve(id);
  }

  @Post(':id/reject')
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamBuildingRequestService.reject(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamBuildingRequestService.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamBuildingRequestService.remove(id);
  }
}
