import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: Number(this.configService.get('EMAIL_PORT')),
      secure: false, // ✅ Titan requires SSL
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });

    // // 🔍 Verify SMTP on app startup
    // this.transporter.verify((error) => {
    //   if (error) {
    //     this.logger.error('SMTP connection failed', error);
    //   } else {
    //     this.logger.log('SMTP server is ready to send emails');
    //   }
    // });
  }

  async sendLeadNotification(leadData: {
    name: string;
    email: string;
    subject: string;
    phone?: string;
    message: string;
  }): Promise<void> {
    const ownerEmail = this.configService.get<string>('OWNER_EMAIL');

    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('SMTP_FROM_EMAIL'),
      to: ownerEmail,
      subject: `New Lead: ${leadData.subject}`,
      replyTo: leadData.email,
      html: `
        <h2>New Lead Notification</h2>
        <p><b>Name:</b> ${leadData.name}</p>
        <p><b>Email:</b> <a href="mailto:${leadData.email}">${leadData.email}</a></p>
        <p><b>Subject:</b> ${leadData.subject}</p>
        ${leadData.phone ? `<p><b>Phone:</b> <a href="tel:${leadData.phone}">${leadData.phone}</a></p>` : ''}
        <p><b>Message:</b></p>
        <p>${leadData.message}</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log('Lead notification email sent');
    } catch (error) {
      this.logger.error('Error sending lead notification email', error);
      throw new Error('Failed to send lead notification');
    }
  }

  async sendThankYouEmail(leadData: {
    name: string;
    email: string;
    subject: string;
  }): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('SMTP_FROM_EMAIL'),
      to: leadData.email,
      subject: `Thank you for contacting us - ${leadData.subject}`,
      html: `
        <h2>Thank You for Contacting Us</h2>
        <p>Hello ${leadData.name},</p>
        <p>We have received your message and our team will get back to you soon.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log('Thank-you email sent');
    } catch (error) {
      this.logger.error('Error sending thank-you email', error);
    }
  }

 
}
