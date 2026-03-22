import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Message, MessageSchema } from './schemas/message.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { MessageRepository } from './repository/message.repository';
import { MessagesService } from './services/messages.service';
import { SseService } from './services/sse.service';
import { MessagesController } from './controllers/messages.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
    // JwtModule so the controller can verify tokens from the SSE ?token= param
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'change-me-in-production'),
      }),
    }),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessageRepository, SseService],
  exports: [MessageRepository, SseService],
})
export class MessagesModule {}
