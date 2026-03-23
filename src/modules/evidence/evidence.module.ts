import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Evidence, EvidenceSchema } from './schemas/evidence.schema';
import { EvidenceRepository } from './repository/evidence.repository';
import { EvidenceService } from './services/evidence.service';
import { EvidenceController } from './controllers/evidence.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Evidence.name, schema: EvidenceSchema }]),
  ],
  controllers: [EvidenceController],
  providers: [EvidenceService, EvidenceRepository],
  exports: [EvidenceRepository],
})
export class EvidenceModule {}
