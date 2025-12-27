import { IsOptional, IsString } from 'class-validator';

export class UpdateWebsiteSettingsDto {
  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  primary_color?: string;

  @IsOptional()
  @IsString()
  secondary_color?: string;

  @IsOptional()
  @IsString()
  font_family?: string;

  @IsOptional()
  @IsString()
  base_font_size?: string;
}
