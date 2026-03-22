import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  MessageEvent,
  Param,
  Post,
  Query,
  Sse,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Observable, finalize } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtService } from '@nestjs/jwt';
import { API_ENDPOINTS, API_TAGS, CONTROLLERS } from '../../../common/constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';
import { MessagesService } from '../services/messages.service';
import { SseService, SseMessageEvent } from '../services/sse.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { Public } from '../../../common/decorators/auth.decorator';

@ApiTags(API_TAGS.MESSAGES)
@ApiBearerAuth()
@Controller(CONTROLLERS.MESSAGES)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly sseService: SseService,
    private readonly jwtService: JwtService,
  ) {}

  // ── Send a message ───────────────────────────────────────────────────────────
  @Post(API_ENDPOINTS.MESSAGES.SEND)
  @ApiOperation({ summary: 'Send a message to another user' })
  send(@Body() dto: SendMessageDto, @CurrentUser() user: IAuthUser) {
    return this.messagesService.send(dto, user);
  }

  // ── SSE stream ───────────────────────────────────────────────────────────────
  // Auth via ?token= query param because EventSource cannot send headers.
  // @Header() decorators avoid the need to inject @Res() which would break
  // NestJS's automatic Observable→SSE serialization.
  @Public()
  @Sse(API_ENDPOINTS.MESSAGES.STREAM)
  @Header('Cache-Control', 'no-cache')
  @Header('X-Accel-Buffering', 'no')
  @ApiOperation({ summary: 'SSE stream for real-time message events' })
  stream(@Query('token') token: string): Observable<MessageEvent> {
    // Validate JWT from query param
    let payload: IAuthUser;
    try {
      payload = this.jwtService.verify<IAuthUser>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const userId = String(payload._id);

    return this.sseService.getStream(userId).pipe(
      map((event: SseMessageEvent): MessageEvent => ({
        type: event.type,
        data: JSON.stringify(event.data),
      })),
      finalize(() => {
        this.sseService.removeStream(userId);
      }),
    );
  }

  // ── Conversations sidebar list ──────────────────────────────────────────────
  @Get(API_ENDPOINTS.MESSAGES.CONVERSATIONS_LIST)
  @ApiOperation({ summary: 'Get all conversations for the current user' })
  getConversationsList(@CurrentUser() user: IAuthUser) {
    return this.messagesService.getConversationsList(user);
  }

  // ── Users NOT yet in current user's conversations ───────────────────────────
  @Get(API_ENDPOINTS.MESSAGES.AVAILABLE_CONTACTS)
  @ApiOperation({ summary: 'Get users not yet in a conversation with me' })
  @ApiQuery({ name: 'search', required: false, type: String })
  getAvailableContacts(
    @CurrentUser() user: IAuthUser,
    @Query('search') search?: string,
  ) {
    return this.messagesService.getAvailableContacts(user, search);
  }

  // ── Conversation messages ───────────────────────────────────────────────────
  @Get(API_ENDPOINTS.MESSAGES.CONVERSATION)
  @ApiOperation({ summary: 'Get conversation with a specific user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getConversation(
    @Param('userId') userId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.messagesService.getConversation(
      userId,
      page ? +page : 1,
      limit ? +limit : 20,
      user,
    );
  }

  // ── Unread count ────────────────────────────────────────────────────────────
  @Get(API_ENDPOINTS.MESSAGES.UNREAD_COUNT)
  @ApiOperation({ summary: 'Get unread message count for current user' })
  getUnreadCount(@CurrentUser() user: IAuthUser) {
    return this.messagesService.getUnreadCount(user);
  }

  // ── Delete message ──────────────────────────────────────────────────────────
  @Delete(API_ENDPOINTS.MESSAGES.DELETE)
  @ApiOperation({ summary: 'Soft-delete a message' })
  remove(@Param('id') id: string) {
    return this.messagesService.deleteMessage(id);
  }
}
