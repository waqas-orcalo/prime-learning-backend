import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Scorecard, ScorecardSchema } from './schemas/scorecard.schema';
import { ScorecardRepository } from './repository/scorecard.repository';
import { ScorecardService } from './services/scorecard.service';
import { ScorecardController } from './controllers/scorecard.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Scorecard.name, schema: ScorecardSchema },
    ]),
  ],
  controllers: [ScorecardController],
  providers: [ScorecardService, ScorecardRepository],
  exports: [ScorecardRepository],
})
export class ScorecardModule {}
