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
import { ProjectBudgetService } from './project-budget.service';
import { CreateProjectBudgetDto } from './dto/create-project-budget.dto';
import { UpdateProjectBudgetDto } from './dto/update-project-budget.dto';

@Controller('project-budgets')
export class ProjectBudgetController {
  constructor(private readonly projectBudgetService: ProjectBudgetService) {}

  @Post()
  @Permissions({ resource: 'project-budget', action: 'create' })
  create(
    @CurrentUser() _user: AuthUser,
    @Body() dto: CreateProjectBudgetDto,
  ) {
    return this.projectBudgetService.create(dto);
  }

  @Get()
  @Permissions({ resource: 'project-budget', action: 'read' })
  findAll(
    @CurrentUser() _user: AuthUser,
    @Query('page') page = '1',
    @Query('size') size = '20',
    @Query('projectId') projectId?: string,
  ) {
    return this.projectBudgetService.findAll({
      page: Number(page),
      size: Number(size),
      projectId,
    });
  }

  @Get(':id')
  @Permissions({ resource: 'project-budget', action: 'read' })
  findOne(
    @CurrentUser() _user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.projectBudgetService.findOne(id);
  }

  @Put(':id')
  @Permissions({ resource: 'project-budget', action: 'update' })
  update(
    @CurrentUser() _user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProjectBudgetDto,
  ) {
    return this.projectBudgetService.update(id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'project-budget', action: 'delete' })
  remove(
    @CurrentUser() _user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.projectBudgetService.remove(id);
  }

  @Get('budget-vs-actual/:projectId')
  @Permissions({ resource: 'project-budget', action: 'read' })
  getBudgetVsActual(
    @CurrentUser() _user: AuthUser,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
  ) {
    return this.projectBudgetService.getBudgetVsActual(projectId);
  }
}
