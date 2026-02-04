// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract from `Authorization: Bearer <token>`,
      audience: process.env.AUTH_AUDIENCE,
      issuer: process.env.AUTH_ISSUER,
      algorithms: ['RS256'],
      ignoreExpiration: false,
      // secretOrKey: process.env.JWT_SECRET || 'yourSecretKey',
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.AUTH_ISSUER}.well-known/jwks.json`,
      }),
    });
  }

  async validate(payload: any) {
    // This function runs after successful JWT validation
    // You can attach user info to request object
    return { userId: payload.sub, email: payload.email,roles: payload.roles || [], };
  }
}
