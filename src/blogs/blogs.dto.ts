import { IsString, IsOptional } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsString()
  author: string;
   @IsString()
  badge: string;
  @IsOptional()
  @IsString()
  imageUrl?: string;
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
 
    ogImage?: string;
}
export class UpdateBlogDto extends CreateBlogDto { }