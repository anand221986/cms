import { IsString, IsOptional, IsUrl, IsIn,IsObject,IsInt,IsBoolean,IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
export class CreatePageDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @IsUrl()
  ogImage?: string;

  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;
}

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @IsUrl()
  ogImage?: string;

  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;
}

export class CreatePageSectionDto {
  @IsString()
  section_key: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  sub_title?: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
    @IsOptional()
  @IsInt()
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}


export class AddSectionDto {
  @IsString()
   @IsOptional()
section_key?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  sub_title?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sort_order?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  meta?: any; // could be string from FormData
}

