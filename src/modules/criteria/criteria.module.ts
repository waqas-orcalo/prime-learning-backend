import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Criteria, CriteriaSchema } from './schemas/criteria.schema';
import { ActivityCriteria, ActivityCriteriaSchema } from './schemas/activity-criteria.schema';
import { CriteriaRepository } from './repository/criteria.repository';
import { ActivityCriteriaRepository } from './repository/activity-criteria.repository';
import { CriteriaService } from './services/criteria.service';
import { CriteriaController } from './controllers/criteria.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Criteria.name, schema: CriteriaSchema },
      { name: ActivityCriteria.name, schema: ActivityCriteriaSchema },
    ]),
  ],
  controllers: [CriteriaController],
  providers: [CriteriaService, CriteriaRepository, ActivityCriteriaRepository],
  exports: [CriteriaRepository, ActivityCriteriaRepository],
})
export class CriteriaModule {}
