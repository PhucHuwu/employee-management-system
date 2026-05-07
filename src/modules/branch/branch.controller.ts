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
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchService } from './branch.service';

@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get()
  @Permissions({ resource: 'branch', action: 'read' })
  listBranches() {
    return this.branchService.listBranches();
  }

  @Post()
  @Permissions({ resource: 'branch', action: 'create' })
  createBranch(@Body() dto: CreateBranchDto) {
    return this.branchService.createBranch(dto);
  }

  @Put(':id')
  @Permissions({ resource: 'branch', action: 'update' })
  updateBranch(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchService.updateBranch(user, id, dto);
  }

  @Delete(':id')
  @Permissions({ resource: 'branch', action: 'delete' })
  deleteBranch(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.branchService.deleteBranch(user, id);
  }
}
