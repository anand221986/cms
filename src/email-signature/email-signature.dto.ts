import { IsEmail, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { Expose,Type } from 'class-transformer';
 

export class CreateEmailSignatureDto {
  @IsInt()
  @Type(() => Number)
  user_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;
 @Expose({ name: 'logoUrl' })
  @IsOptional()
  @IsString()
  logo_url?: string;

  @Expose({ name: 'logoBase64' })
  @IsOptional()
  @IsString()
  logo_base64?: string;

  @Expose({ name: 'customHTML' })
  @IsOptional()
  @IsString()
  custom_html?: string;
  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  website?: string;

   
}

export class UpdateEmailSignatureDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  logo_base64?: string;

  @IsOptional()
  @IsString()
  custom_html?: string;
}
