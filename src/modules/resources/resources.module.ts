import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Resource, ResourceSchema } from './schemas/resource.schema';
import { ResourceRepository } from './repository/resource.repository';
import { ResourcesService } from './services/resources.service';
import { ResourcesController } from './controllers/resources.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Resource.name, schema: ResourceSchema }]),
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService, ResourceRepository],
  exports: [ResourcesService, ResourceRepository],
})
export class ResourcesModule {}
