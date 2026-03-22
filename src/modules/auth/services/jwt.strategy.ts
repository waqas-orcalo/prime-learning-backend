import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IAuthUser } from '../../../common/interfaces/auth-user.interface';

/**
 * JwtStrategy
 * ────────────────────────────────────────────────────────────────────────────
 * Passport strategy that validates the Bearer token from the Authorization
 * header. Decoded payload is attached to request.user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'change-me-in-production'),
    });
  }

  async validate(payload: IAuthUser): Promise<IAuthUser> {
    // Return value becomes request.user
    return payload;
  }
}
