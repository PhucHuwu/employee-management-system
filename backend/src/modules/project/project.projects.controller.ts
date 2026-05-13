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
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { Permissions } from '@/modules/identity/decorators/permissions.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
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
import { CreateProjectTaskDto } from '@/modules/project-task/dto/create-project-task.dto';
import { CreateProjectMemberShadowDto } from '@/modules/project-member-shadow/dto/create-project-member-shadow.dto';
import { ProjectService } from './services/project.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @Permissions({ resource: 'project', action: 'create' })
  createProject(@Body() dto: CreateProjectDto) {
    return this.projectService.createProject(dto);
  }

  @Get()
  @Permissions({ resource: 'project', action: 'read' })
  listProjects(
    @CurrentUser() user: AuthUser,
    @Query() query: ProjectQueryDto,
  ) {
    return this.projectService.listProjects(user, query);
  }

  @Get(':id')
  @Permissions({ resource: 'project', action: 'read' })
  getProjectById(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.projectService.getProjectById(user, id);
  }

  @Put(':id')
  @Permissions({ resource: 'project', action: 'update' })
  updateProject(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.updateProject(id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'project', action: 'delete' })
  deleteProject(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectService.deleteProject(id);
  }

  @Post(':id/members')
  @Permissions({ resource: 'project-member', action: 'create' })
  addMember(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddProjectMemberDto) {
    return this.projectService.addMember(id, dto);
  }

  @Delete(':id/members/:employeeId')
  @Permissions({ resource: 'project-member', action: 'delete' })
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ) {
    return this.projectService.removeMember(id, employeeId);
  }

  @Get(':projectId/daily-progress')
  @Permissions({ resource: 'daily-report', action: 'read' })
  getDailyProgress(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ProjectProgressQueryDto,
  ) {
    return this.projectService.getProjectDailyProgress(projectId, query);
  }

  @Get(':id/revenues')
  @Permissions({ resource: 'project-revenue', action: 'read' })
  listRevenues(@Param('id', ParseUUIDPipe) id: string, @Query() query: RevenueQueryDto) {
    return this.projectService.listRevenues(id, query);
  }

  @Post(':id/revenues')
  @Permissions({ resource: 'project-revenue', action: 'create' })
  createRevenue(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateRevenueDto) {
    return this.projectService.createRevenue(id, dto);
  }

  @Put(':id/revenues/:revenueId')
  @Permissions({ resource: 'project-revenue', action: 'update' })
  updateRevenue(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('revenueId', ParseUUIDPipe) revenueId: string,
    @Body() dto: UpdateRevenueDto,
  ) {
    return this.projectService.updateRevenue(id, revenueId, dto);
  }

  @Delete(':id/revenues/:revenueId')
  @Permissions({ resource: 'project-revenue', action: 'delete' })
  deleteRevenue(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('revenueId', ParseUUIDPipe) revenueId: string,
  ) {
    return this.projectService.deleteRevenue(id, revenueId);
  }

  @Post(':id/documents')
  @Permissions({ resource: 'project-document', action: 'create' })
  uploadDocument(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UploadProjectDocumentDto) {
    return this.projectService.uploadDocument(id, dto);
  }

  @Get(':id/documents')
  @Permissions({ resource: 'project-document', action: 'read' })
  listDocuments(@Param('id', ParseUUIDPipe) id: string, @Query() query: PaginationQueryDto) {
    return this.projectService.listDocuments(id, query);
  }

  @Get(':id/documents/:docId/download')
  @Permissions({ resource: 'project-document', action: 'download' })
  downloadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('docId', ParseUUIDPipe) docId: string,
  ) {
    return this.projectService.downloadDocument(id, docId);
  }

  @Delete(':id/documents/:docId')
  @Permissions({ resource: 'project-document', action: 'delete' })
  deleteDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('docId', ParseUUIDPipe) docId: string,
  ) {
    return this.projectService.deleteDocument(id, docId);
  }

  @Get(':id/timesheet-export')
  @Permissions({ resource: 'project', action: 'read' })
  getTimesheetExport(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectService.getTimesheetExport(id);
  }

  @Get(':id/tasks')
  @Permissions({ resource: 'project', action: 'read' })
  getProjectTasks(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectService.getProjectTasks(id);
  }

  @Post(':id/tasks')
  @Permissions({ resource: 'project', action: 'update' })
  createProjectTask(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateProjectTaskDto) {
    return this.projectService.createProjectTask(id, dto);
  }

  @Post(':id/members/:memberId/shadows')
  @Permissions({ resource: 'project', action: 'update' })
  createProjectMemberShadow(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() dto: CreateProjectMemberShadowDto,
  ) {
    return this.projectService.createProjectMemberShadow(memberId, dto);
  }
}
