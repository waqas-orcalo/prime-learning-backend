import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearningSupport, LearningSupportSchema } from './schemas/learning-support.schema';
import { LearningSupportRepository } from './repository/learning-support.repository';
import { LearningSupportService } from './services/learning-support.service';
import { LearningSupportController } from './controllers/learning-support.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LearningSupport.name, schema: LearningSupportSchema },
    ]),
  ],
  controllers: [LearningSupportController],
  providers: [LearningSupportService, LearningSupportRepository],
  exports: [LearningSupportService],
})
export class LearningSupportModule {}
