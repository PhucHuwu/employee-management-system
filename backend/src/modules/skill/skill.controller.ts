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
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillService } from './skill.service';

@Controller('skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Get()
  @Permissions({ resource: 'skill', action: 'read' })
  listSkills() {
    return this.skillService.listSkills();
  }

  @Post()
  @Permissions({ resource: 'skill', action: 'create' })
  createSkill(@Body() dto: CreateSkillDto) {
    return this.skillService.createSkill(dto);
  }

  @Put(':id')
  @Permissions({ resource: 'skill', action: 'update' })
  updateSkill(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSkillDto,
  ) {
    return this.skillService.updateSkill(user, id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'skill', action: 'delete' })
  deleteSkill(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.skillService.deleteSkill(user, id);
  }
}
