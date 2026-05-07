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
import { CurrentUser } from '@/modules/identity/decorators/current-user.decorator';
import { Permissions } from '@/modules/identity/decorators/permissions.decorator';
import { AuthUser } from '@/modules/identity/auth-user.type';
import { CreateEducationTypeDto } from './dto/create-education-type.dto';
import { UpdateEducationTypeDto } from './dto/update-education-type.dto';
import { EducationTypeService } from './education-type.service';

@Controller('education-types')
export class EducationTypeController {
  constructor(
    private readonly educationTypeService: EducationTypeService,
  ) {}

  @Get()
  @Permissions({ resource: 'education_type', action: 'read' })
  listEducationTypes() {
    return this.educationTypeService.listEducationTypes();
  }

  @Post()
  @Permissions({ resource: 'education_type', action: 'create' })
  createEducationType(@Body() dto: CreateEducationTypeDto) {
    return this.educationTypeService.createEducationType(dto);
  }

  @Put(':id')
  @Permissions({ resource: 'education_type', action: 'update' })
  updateEducationType(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEducationTypeDto,
  ) {
    return this.educationTypeService.updateEducationType(user, id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'education_type', action: 'delete' })
  deleteEducationType(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.educationTypeService.deleteEducationType(user, id);
  }
}
