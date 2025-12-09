// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract from `Authorization: Bearer <token>`
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'yourSecretKey',
    });
  }

  async validate(payload: any) {
    // This function runs after successful JWT validation
    // You can attach user info to request object
    return { userId: payload.sub, email: payload.email };
  }
}
