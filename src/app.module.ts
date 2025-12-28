import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

/* Controllers */
import { AppController } from './app.controller';
import { CommonController } from './common/common.controller';
import { AuthController } from './auth/auth.controller';
import { UserController } from './user/user.controller';
import { SettingsController } from './setting/setting.controller';
import { PagesController } from './pages/pages.controller';
import { TestimonialsController } from './testimonial/testimonials.controller';
import { BlogsController } from './blogs/blogs.controller';
import { LeadController } from './leads/lead.controller';
import { TenantsController } from './tenants/tenants.controller';
import { MenuController } from './menu/menu.controller';
import { WebsiteSettingsController } from './website/website-settings.controller';
import { EmailController } from './email/mail.controller';

/* Services */
import { AppService } from './app.service';
import { CommonService } from './common/common.service';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { UtilService } from './util/util.service';
import { DbService } from './db/db.service';
import { ErrorLoggerService } from './error-logger/error-logger.service';
import { AesService } from './services/aes/aes.service';
import { EmailService } from './email/email.service';
import { MailService } from './email/mail.service';
import { SettingService } from './setting/setting.service';
import { PageService } from './pages/pages.service';
import { TestimonialService } from './testimonial/testimonials.service';
import { BlogsService } from './blogs/blogs.service';
import { LeadService } from './leads/lead.service';
import { LeadActivityService } from './leads/lead-activity.service';
import { ClusterService } from './services/cluster/cluster.service';
import { TenantsService } from './tenants/tenants.service';
import { MenuService } from './menu/menu.service';
import { WebsiteSettingsService } from './website/website-settings.service';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { IMailService } from './util/mail.service';
import { GmailImapService } from './util/gmail-imap.service';

/* Modules */
import { WhatsappModule } from './whatsapp/whatsapp.module';

/* Middleware */
import { ApiMiddleware } from './middleware/api.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    WhatsappModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || '15m',
        },
      }),
    }),

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
        dir: join(process.cwd(), 'src', 'email', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
  ],

  controllers: [
    AppController,
    CommonController,
    AuthController,
    UserController,
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
    MailService,
    SettingService,
    PageService,
    TestimonialService,
    BlogsService,
    LeadService,
    LeadActivityService,
    ClusterService,
    TenantsService,
    MenuService,
    WebsiteSettingsService,
    WhatsappService,
    IMailService,
    GmailImapService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiMiddleware, LoggerMiddleware)
      .forRoutes('*');
  }
}
