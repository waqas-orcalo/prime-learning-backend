import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Visit, VisitSchema } from './schemas/visit.schema';
import { VisitRepository } from './repository/visit.repository';
import { VisitService } from './services/visit.service';
import { VisitController } from './controllers/visit.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Visit.name, schema: VisitSchema }]),
  ],
  controllers: [VisitController],
  providers: [VisitService, VisitRepository],
  exports: [VisitRepository],
})
export class VisitModule {}
