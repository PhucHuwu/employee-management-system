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
import { JobRequisitionStatus, CandidateStatus } from '@prisma/client';
import { RecruitmentService } from './recruitment.service';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@Controller('job-requisitions')
class JobRequisitionController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Post()
  @Permissions({ resource: 'job_requisition', action: 'create' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateJobRequisitionDto) {
    return this.recruitmentService.createJobRequisition(user, dto);
  }

  @Get(':id')
  @Permissions({ resource: 'job_requisition', action: 'read' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.recruitmentService.getJobRequisitionById(id);
  }

  @Get()
  @Permissions({ resource: 'job_requisition', action: 'read' })
  findAll(
    @Query('status') status?: JobRequisitionStatus,
    @Query('page') page = '1',
    @Query('size') size = '20',
  ) {
    return this.recruitmentService.listJobRequisitions({
      status,
      page: parseInt(page, 10),
      size: parseInt(size, 10),
    });
  }

  @Put(':id')
  @Permissions({ resource: 'job_requisition', action: 'update' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobRequisitionDto,
  ) {
    return this.recruitmentService.updateJobRequisition(user, id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'job_requisition', action: 'delete' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.recruitmentService.deleteJobRequisition(user, id);
  }
}

@Controller('candidates')
class CandidateController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Post()
  @Permissions({ resource: 'candidate', action: 'create' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCandidateDto) {
    return this.recruitmentService.createCandidate(user, dto);
  }

  @Get(':id')
  @Permissions({ resource: 'candidate', action: 'read' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.recruitmentService.getCandidateById(id);
  }

  @Get()
  @Permissions({ resource: 'candidate', action: 'read' })
  findAll(
    @Query('jobRequisitionId') jobRequisitionId?: string,
    @Query('status') status?: CandidateStatus,
    @Query('page') page = '1',
    @Query('size') size = '20',
  ) {
    return this.recruitmentService.listCandidates({
      jobRequisitionId,
      status,
      page: parseInt(page, 10),
      size: parseInt(size, 10),
    });
  }

  @Put(':id')
  @Permissions({ resource: 'candidate', action: 'update' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCandidateDto,
  ) {
    return this.recruitmentService.updateCandidate(user, id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'candidate', action: 'delete' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.recruitmentService.deleteCandidate(user, id);
  }
}

@Controller('interviews')
class InterviewController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Post()
  @Permissions({ resource: 'interview', action: 'create' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateInterviewDto) {
    return this.recruitmentService.createInterview(user, dto);
  }

  @Get(':id')
  @Permissions({ resource: 'interview', action: 'read' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.recruitmentService.getInterviewById(id);
  }

  @Get()
  @Permissions({ resource: 'interview', action: 'read' })
  findAll(
    @Query('candidateId') candidateId?: string,
    @Query('page') page = '1',
    @Query('size') size = '20',
  ) {
    return this.recruitmentService.listInterviews({
      candidateId,
      page: parseInt(page, 10),
      size: parseInt(size, 10),
    });
  }

  @Put(':id')
  @Permissions({ resource: 'interview', action: 'update' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInterviewDto,
  ) {
    return this.recruitmentService.updateInterview(user, id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'interview', action: 'delete' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.recruitmentService.deleteInterview(user, id);
  }
}

export { JobRequisitionController, CandidateController, InterviewController };
