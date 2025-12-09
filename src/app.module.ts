import { Module ,NestModule,MiddlewareConsumer} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonController } from './common/common.controller';
import { CommonService } from './common/common.service';
import { EmailService } from './email/email.service';
import { ApiMiddleware } from './middleware/api.middleware';
import { UtilService } from './util/util.service';
import { DbService } from './db/db.service';
import { ErrorLoggerService } from './error-logger/error-logger.service';
import { AesService } from './services/aes/aes.service';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { AuthController } from './auth/auth.controller';
import {SettingService} from './setting/setting.service';
import {SettingsController} from './setting/setting.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { ScheduleModule } from '@nestjs/schedule';
import { IMailService } from './util/mail.service';
import { GmailImapService } from './util/gmail-imap.service';
import { PagesController } from './pages/pages.controller';
import { PageService} from './pages/pages.service';
import { TestimonialsController } from './testimonial/testimonials.controller';
import { TestimonialService} from './testimonial/testimonials.service';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService} from './blogs/blogs.service';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { LeadController } from './leads/lead.controller';
import { LeadService} from './leads/lead.service';
import { LeadActivityService} from './leads/lead-activity.service';
@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule.forRoot({
      isGlobal: true, // So you can use ConfigService anywhere without importing again
    }),MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'youremail@gmail.com',
          pass: 'password',
        },
      },
    }),WhatsappModule],
  controllers: [AppController,CommonController,UserController, AuthController, SettingsController, PagesController,TestimonialsController,BlogsController,LeadController],
  providers: [AppService,CommonService,UtilService,DbService,ErrorLoggerService,AesService,AuthService,JwtService,UserService, AuthService,EmailService, SettingService, WhatsappService, IMailService,GmailImapService,PageService,TestimonialService,BlogsService,LeadService,LeadActivityService],
})
//with middle ware 
//without export class AppModule
 export class AppModule implements NestModule
  {
 configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiMiddleware,LoggerMiddleware).exclude()
      .forRoutes('*')
  }

}
