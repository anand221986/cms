import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  IsBoolean,
  IsArray
} from 'class-validator';
import { Type } from 'class-transformer';

/* ================= CREATE ================= */

export class CreateMenuDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parent_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  position?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @IsOptional()
  @IsIn(['HEADER', 'FOOTER'])
  location?: 'HEADER' | 'FOOTER';
}

/* ================= UPDATE ================= */

export class UpdateMenuDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parent_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  position?: number;

  @IsOptional()
  @IsIn(['HEADER', 'FOOTER'])
  location?: 'HEADER' | 'FOOTER';

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
export class ReorderMenuItemDto {
  @IsNumber()
  id: number;

  @IsNumber()
  position: number;
}
export class ReorderMenuDto {
  @IsArray()
  orders: ReorderMenuItemDto[];
}
