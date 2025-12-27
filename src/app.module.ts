import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CommonController } from './common/common.controller';
import { CommonService } from './common/common.service';

import { EmailController } from './email/mail.controller';
import { MailService } from './email/mail.service';
import { EmailService } from './email/email.service';

import { UtilService } from './util/util.service';
import { DbService } from './db/db.service';
import { ErrorLoggerService } from './error-logger/error-logger.service';
import { AesService } from './services/aes/aes.service';

import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

import { SettingsController } from './setting/setting.controller';
import { SettingService } from './setting/setting.service';

import { PagesController } from './pages/pages.controller';
import { PageService } from './pages/pages.service';

import { TestimonialsController } from './testimonial/testimonials.controller';
import { TestimonialService } from './testimonial/testimonials.service';

import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/blogs.service';

import { LeadController } from './leads/lead.controller';
import { LeadService } from './leads/lead.service';
import { LeadActivityService } from './leads/lead-activity.service';

import { ClusterService } from './services/cluster/cluster.service';

import { TenantsController } from './tenants/tenants.controller';
import { TenantsService } from './tenants/tenants.service';

import { MenuController } from './menu/menu.controller';
import { MenuService } from './menu/menu.service';

import { WebsiteSettingsController } from './website/website-settings.controller';
import { WebsiteSettingsService } from './website/website-settings.service';

import { WhatsappModule } from './whatsapp/whatsapp.module';
import { WhatsappService } from './whatsapp/whatsapp.service';

import { IMailService } from './util/mail.service';
import { GmailImapService } from './util/gmail-imap.service';

import { ApiMiddleware } from './middleware/api.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { join } from 'path';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    WhatsappModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'youremail@gmail.com',
          pass: 'password',
        },
      },
      defaults: {
        from: '"No Reply" <youremail@gmail.com>',
      },
      template: {
        //  dir: join(__dirname, 'email', 'templates'),
        dir: join(process.cwd(), 'src','email', 'templates'),
        //dir: process.cwd() + '/templates',
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
  ],
  controllers: [
    AppController,
    CommonController,
    UserController,
    AuthController,
    SettingsController,
    PagesController,
    TestimonialsController,
    BlogsController,
    LeadController,
    TenantsController,
    MenuController,
    WebsiteSettingsController,
    EmailController,
  ],
  providers: [
    AppService,
    CommonService,
    UtilService,
    DbService,
    ErrorLoggerService,
    AesService,
    AuthService,
    JwtService,
    UserService,
    EmailService,
    SettingService,
    WhatsappService,
    IMailService,
    GmailImapService,
    PageService,
    TestimonialService,
    BlogsService,
    LeadService,
    LeadActivityService,
    ClusterService,
    TenantsService,
    MenuService,
    WebsiteSettingsService,
    MailService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiMiddleware, LoggerMiddleware)
      .forRoutes('*');
  }
}
