import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Delete,
  Query,
} from '@nestjs/common';
import { ProjectMemberShadowService } from './project-member-shadow.service';
import { CreateProjectMemberShadowDto } from './dto/create-project-member-shadow.dto';

@Controller('project-member-shadows')
export class ProjectMemberShadowController {
  constructor(private readonly projectMemberShadowService: ProjectMemberShadowService) {}

  @Post()
  create(@Body() dto: CreateProjectMemberShadowDto) {
    return this.projectMemberShadowService.create(dto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.projectMemberShadowService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectMemberShadowService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectMemberShadowService.remove(id);
  }
}
