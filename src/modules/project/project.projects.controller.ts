import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '@/modules/identity/decorators/roles.decorator';
import { Scope } from '@/modules/identity/decorators/scope.decorator';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateRevenueDto } from './dto/create-revenue.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { ProjectProgressQueryDto } from './dto/project-progress-query.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { RevenueQueryDto } from './dto/revenue-query.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateRevenueDto } from './dto/update-revenue.dto';
import { UploadProjectDocumentDto } from './dto/upload-project-document.dto';
import { ProjectService } from './services/project.service';

@Controller('projects')
@Roles(Role.ADMIN, Role.MANAGER)
@Scope('project')
export class ProjectsController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  createProject(@Body() dto: CreateProjectDto) {
    return this.projectService.createProject(dto);
  }

  @Get()
  listProjects(@Query() query: ProjectQueryDto) {
    return this.projectService.listProjects(query);
  }

  @Get(':id')
  getProjectById(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectService.getProjectById(id);
  }

  @Put(':id')
  updateProject(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.updateProject(id, dto);
  }

  @Delete(':id')
  deleteProject(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectService.deleteProject(id);
  }

  @Post(':id/members')
  addMember(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddProjectMemberDto) {
    return this.projectService.addMember(id, dto);
  }

  @Delete(':id/members/:employeeId')
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ) {
    return this.projectService.removeMember(id, employeeId);
  }

  @Get(':projectId/daily-progress')
  getDailyProgress(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ProjectProgressQueryDto,
  ) {
    return this.projectService.getProjectDailyProgress(projectId, query);
  }

  @Get(':id/revenues')
  listRevenues(@Param('id', ParseUUIDPipe) id: string, @Query() query: RevenueQueryDto) {
    return this.projectService.listRevenues(id, query);
  }

  @Post(':id/revenues')
  createRevenue(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateRevenueDto) {
    return this.projectService.createRevenue(id, dto);
  }

  @Put(':id/revenues/:revenueId')
  updateRevenue(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('revenueId', ParseUUIDPipe) revenueId: string,
    @Body() dto: UpdateRevenueDto,
  ) {
    return this.projectService.updateRevenue(id, revenueId, dto);
  }

  @Delete(':id/revenues/:revenueId')
  deleteRevenue(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('revenueId', ParseUUIDPipe) revenueId: string,
  ) {
    return this.projectService.deleteRevenue(id, revenueId);
  }

  @Post(':id/documents')
  uploadDocument(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UploadProjectDocumentDto) {
    return this.projectService.uploadDocument(id, dto);
  }

  @Get(':id/documents')
  listDocuments(@Param('id', ParseUUIDPipe) id: string, @Query() query: PaginationQueryDto) {
    return this.projectService.listDocuments(id, query);
  }

  @Get(':id/documents/:docId/download')
  downloadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('docId', ParseUUIDPipe) docId: string,
  ) {
    return this.projectService.downloadDocument(id, docId);
  }

  @Delete(':id/documents/:docId')
  deleteDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('docId', ParseUUIDPipe) docId: string,
  ) {
    return this.projectService.deleteDocument(id, docId);
  }
}
