import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemas/group.schema';
import { GroupRepository } from './repository/group.repository';
import { GroupsService } from './services/groups.service';
import { GroupsController } from './controllers/groups.controller';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService, GroupRepository],
  exports: [GroupsService, GroupRepository],
})
export class GroupsModule {}
