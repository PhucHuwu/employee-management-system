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
import { ProjectTaskService } from './project-task.service';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { UpdateProjectTaskDto } from './dto/update-project-task.dto';

@Controller('project-tasks')
export class ProjectTaskController {
  constructor(private readonly projectTaskService: ProjectTaskService) {}

  @Post()
  create(@Body() dto: CreateProjectTaskDto) {
    return this.projectTaskService.create(dto);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.projectTaskService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectTaskService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectTaskDto,
  ) {
    return this.projectTaskService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectTaskService.remove(id);
  }
}
