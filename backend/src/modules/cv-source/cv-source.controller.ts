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
import { CreateCvSourceDto } from './dto/create-cv-source.dto';
import { UpdateCvSourceDto } from './dto/update-cv-source.dto';
import { CvSourceService } from './cv-source.service';

@Controller('cv-sources')
export class CvSourceController {
  constructor(private readonly cvSourceService: CvSourceService) {}

  @Get()
  @Permissions({ resource: 'cv_source', action: 'read' })
  listCvSources() {
    return this.cvSourceService.listCvSources();
  }

  @Post()
  @Permissions({ resource: 'cv_source', action: 'create' })
  createCvSource(@Body() dto: CreateCvSourceDto) {
    return this.cvSourceService.createCvSource(dto);
  }

  @Put(':id')
  @Permissions({ resource: 'cv_source', action: 'update' })
  updateCvSource(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCvSourceDto,
  ) {
    return this.cvSourceService.updateCvSource(user, id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'cv_source', action: 'delete' })
  deleteCvSource(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cvSourceService.deleteCvSource(user, id);
  }
}
