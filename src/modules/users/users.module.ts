import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './repository/user.repository';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';

/**
 * UsersModule
 * ────────────────────────────────────────────────────────────────────────────
 * Self-contained feature module. Each feature module owns:
 *   schemas/     → Mongoose schemas
 *   repository/  → AbstractRepository extension
 *   services/    → Business logic
 *   controllers/ → HTTP endpoints
 *   dto/         → Input validation classes
 *
 * UserRepository is exported so AuthModule can use it.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UserRepository, UsersService],
})
export class UsersModule {}
