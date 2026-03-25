import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { Roles } from '@/modules/identity/decorators/roles.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateJobTitleDto } from './dto/create-job-title.dto';
import { PromoteEmployeeDto } from './dto/promote-employee.dto';
import { UpdateJobTitleDto } from './dto/update-job-title.dto';
import { JobTitleService } from './job-title.service';

@Controller()
@Roles(Role.ADMIN, Role.MANAGER)
export class JobTitleController {
  constructor(private readonly jobTitleService: JobTitleService) {}

  @Get('job-titles')
  listJobTitles() {
    return this.jobTitleService.listJobTitles();
  }

  @Post('job-titles')
  createJobTitle(@Body() dto: CreateJobTitleDto) {
    return this.jobTitleService.createJobTitle(dto);
  }

  @Put('job-titles/:id')
  updateJobTitle(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateJobTitleDto) {
    return this.jobTitleService.updateJobTitle(id, dto);
  }

  @Delete('job-titles/:id')
  deleteJobTitle(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobTitleService.deleteJobTitle(id);
  }

  @Post('employees/:id/promotions')
  promoteEmployee(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) employeeId: string,
    @Body() dto: PromoteEmployeeDto,
  ) {
    return this.jobTitleService.promoteEmployee(user, employeeId, dto);
  }

  @Get('employees/:id/promotions')
  getEmployeePromotions(@Param('id', ParseUUIDPipe) employeeId: string) {
    return this.jobTitleService.getEmployeePromotions(employeeId);
  }
}
