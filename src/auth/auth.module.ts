// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { UtilService } from '../util/util.service';
import { DbService } from '../db/db.service';
import { JwtStrategy } from '../jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
    imports: [
        ConfigModule,
        JwtModule.register({
            global: true,
        }),
         PassportModule.register({ session: false }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService, 
        AuthGuard, 
        UserService, 
        UtilService, 
        DbService,JwtStrategy,GoogleStrategy,
    ],
    exports: [AuthGuard, AuthService],
})
export class AuthModule {}