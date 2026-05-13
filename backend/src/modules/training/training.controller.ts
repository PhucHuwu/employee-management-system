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
import { CreateTrainingPlanDto } from './dto/create-training-plan.dto';
import { UpdateTrainingPlanDto } from './dto/update-training-plan.dto';
import { CreateTrainingRecordDto } from './dto/create-training-record.dto';
import { UpdateTrainingRecordDto } from './dto/update-training-record.dto';
import { TrainingService } from './training.service';

@Controller()
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  // ─── TrainingPlan ───

  @Post('training-plans')
  @Permissions({ resource: 'training', action: 'create' })
  createTrainingPlan(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTrainingPlanDto,
  ) {
    return this.trainingService.createTrainingPlan(user, dto);
  }

  @Get('training-plans/:id')
  @Permissions({ resource: 'training', action: 'read' })
  getTrainingPlan(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.getTrainingPlanById(id);
  }

  @Get('training-plans')
  @Permissions({ resource: 'training', action: 'read' })
  listTrainingPlans() {
    return this.trainingService.listTrainingPlans();
  }

  @Put('training-plans/:id')
  @Permissions({ resource: 'training', action: 'update' })
  updateTrainingPlan(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTrainingPlanDto,
  ) {
    return this.trainingService.updateTrainingPlan(user, id, dto);
  }

  @Delete('training-plans/:id')
  @Permissions({ resource: 'training', action: 'delete' })
  deleteTrainingPlan(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.trainingService.deleteTrainingPlan(user, id);
  }

  // ─── TrainingRecord ───

  @Post('training-records')
  @Permissions({ resource: 'training', action: 'create' })
  createTrainingRecord(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTrainingRecordDto,
  ) {
    return this.trainingService.createTrainingRecord(user, dto);
  }

  @Get('training-records/:id')
  @Permissions({ resource: 'training', action: 'read' })
  getTrainingRecord(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.getTrainingRecordById(id);
  }

  @Get('training-records')
  @Permissions({ resource: 'training', action: 'read' })
  listTrainingRecords(
    @Query('employeeId') employeeId?: string,
    @Query('trainingPlanId') trainingPlanId?: string,
  ) {
    return this.trainingService.listTrainingRecords({
      employeeId,
      trainingPlanId,
    });
  }

  @Put('training-records/:id')
  @Permissions({ resource: 'training', action: 'update' })
  updateTrainingRecord(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTrainingRecordDto,
  ) {
    return this.trainingService.updateTrainingRecord(user, id, dto);
  }

  @Delete('training-records/:id')
  @Permissions({ resource: 'training', action: 'delete' })
  deleteTrainingRecord(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.trainingService.deleteTrainingRecord(user, id);
  }

  @Get('training-records/expiring-soon')
  @Permissions({ resource: 'training', action: 'read' })
  getExpiringSoonRecords() {
    return this.trainingService.getExpiringSoonRecords();
  }
}
