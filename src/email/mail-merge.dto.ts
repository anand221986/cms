import { IsString, IsOptional,IsEmail,IsArray } from 'class-validator';
export class MailMergeRecipientDto {
  @IsEmail()
  email: string;

  data: Record<string, any>;
}

export class SendMailMergeDto {
  @IsString()
  subject: string;

  @IsString()
  template: string;

  @IsArray()
  recipients: MailMergeRecipientDto[];
}

export class UpdateEmailTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;
  // id?:number;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;
  // created_at?: string; 
}

export class CreateEmailTemplateDto {
  @IsString()
  name: string;

  @IsString()
  subject: string;

  @IsString()
  body: string;
}

export class CreateMailMergeJobDto {
  template_id: number;
  total: number;
}

