import { Module } from '@nestjs/common';
import { ReviewInternController } from './review-intern.controller';
import { ReviewInternService } from './review-intern.service';

@Module({
  controllers: [ReviewInternController],
  providers: [ReviewInternService],
})
export class ReviewInternModule {}
