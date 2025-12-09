import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLeadDto {
  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  source?: string;

  @IsOptional()
  remark?: string; // used for activity
}

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  source?: string;

  @IsOptional()
  remark?: string;
}
