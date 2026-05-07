import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ReviewInternService } from './review-intern.service';
import { CreateReviewInternDto } from './dto/create-review-intern.dto';
import { UpdateReviewInternDto } from './dto/update-review-intern.dto';

@Controller('review-interns')
export class ReviewInternController {
  constructor(private readonly reviewInternService: ReviewInternService) {}

  @Post()
  create(@Body() dto: CreateReviewInternDto) {
    return this.reviewInternService.create(dto);
  }

  @Get()
  findAll(
    @Query('reviewerId') reviewerId?: string,
    @Query('internId') internId?: string,
  ) {
    return this.reviewInternService.findAll(reviewerId, internId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewInternService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewInternDto,
  ) {
    return this.reviewInternService.update(id, dto);
  }

  @Post(':id/submit-review')
  submitReview(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewInternService.submitReview(id);
  }

  @Post(':id/approve')
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewInternService.approve(id);
  }

  @Post(':id/reject')
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewInternService.reject(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewInternService.remove(id);
  }
}
