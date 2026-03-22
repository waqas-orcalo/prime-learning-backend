import { SetMetadata } from '@nestjs/common';

/**
 * @Public()
 * ────────────────────────────────────────────────────────────────────────────
 * Mark any controller method as publicly accessible (no JWT required).
 * The global JwtAuthGuard checks for this metadata before verifying the token.
 *
 * Usage:
 *   @Public()
 *   @Post(API_ENDPOINTS.AUTH.SIGNIN)
 *   signIn(@Body() dto: SignInDto) { ... }
 *
 * Inspired by: AAC-BE-DEV-001 › apps/gateway/src/app/decorators/auth.decorator.ts
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
