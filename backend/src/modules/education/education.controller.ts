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
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { ListEducationQueryDto } from './dto/list-education-query.dto';
import { EducationService } from './education.service';

@Controller('educations')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get()
  @Permissions({ resource: 'education', action: 'read' })
  listEducations(@Query() query: ListEducationQueryDto) {
    return this.educationService.listEducations(query);
  }

  @Post()
  @Permissions({ resource: 'education', action: 'create' })
  createEducation(@Body() dto: CreateEducationDto) {
    return this.educationService.createEducation(dto);
  }

  @Put(':id')
  @Permissions({ resource: 'education', action: 'update' })
  updateEducation(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEducationDto,
  ) {
    return this.educationService.updateEducation(user, id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'education', action: 'delete' })
  deleteEducation(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.educationService.deleteEducation(user, id);
  }
}
