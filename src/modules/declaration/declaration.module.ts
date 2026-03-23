import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Declaration, DeclarationSchema } from './schemas/declaration.schema';
import { DeclarationRepository } from './repository/declaration.repository';
import { DeclarationService } from './services/declaration.service';
import { DeclarationController } from './controllers/declaration.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Declaration.name, schema: DeclarationSchema },
    ]),
  ],
  controllers: [DeclarationController],
  providers: [DeclarationService, DeclarationRepository],
  exports: [DeclarationRepository],
})
export class DeclarationModule {}
