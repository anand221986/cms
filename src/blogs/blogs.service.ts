import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBlogDto, UpdateBlogDto } from './blogs.dto';
import { UtilService } from "../util/util.service";
import { DbService } from '../db/db.service'; // adjust path to your dbService

@Injectable()
export class BlogsService {
  constructor(
    private readonly dbService: DbService,
    public utilService: UtilService
  ) {}

    // 📌 Create Blog
  async createBlog(dto: CreateBlogDto) {
    try {
      const query = `
        INSERT INTO blogs
        (title,  description, author,badge, image_url,meta_title,meta_description,meta_keywords,og_title,og_description,og_image, created_at, updated_at)
        VALUES ($1, $2, $3, $4,$5,$6,$7,$8,$9,$10,$11,NOW(), NOW())
        RETURNING *;
      `;
      const values = [
        dto.title,
        dto.description,
        dto.author || null,
        dto.badge || null,
        dto.imageUrl || null, // Assuming imageUrl is part of the DTO
        dto.metaTitle || null,
        dto.metaDescription || null,
        dto.metaKeywords || null,
        dto.ogTitle || null,
        dto.ogDescription || null,
        dto.ogImage || null,
      ];
      const result = await this.dbService.executeQuery(query, values);
      return this.utilService.successResponse(result[0], 'Blog added successfully.');
    } catch (error) {
      console.error('Error creating blog:', error);
      throw new InternalServerErrorException('Failed to create blog');
    }
  }
  // 📌 Update Blog
 async updateBlog(id: number, dto: UpdateBlogDto) {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (dto.title) {
      fields.push(`title = $${index++}`);
      values.push(dto.title);
    }

    if (dto.description) {
      fields.push(`description = $${index++}`);
      values.push(dto.description);
    }

    if (dto.author) {
      fields.push(`author = $${index++}`);
      values.push(dto.author);
    }
     if (dto.badge) {
      fields.push(`badge = $${index++}`);
      values.push(dto.badge);
    }

    // ✅ Only update image if provided
    if (dto.imageUrl) {
      fields.push(`image_url = $${index++}`);
      values.push(dto.imageUrl);
    }

    // Always update timestamp
    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE blogs
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *;
    `;

    values.push(id);

    const result = await this.dbService.executeQuery(query, values);

    if (!result.length) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return this.utilService.successResponse(result[0], 'Blog updated successfully.');
  } catch (error) {
    console.error(`Error updating blog with ID ${id}:`, error);
    throw error instanceof NotFoundException
      ? error
      : new InternalServerErrorException('Failed to update blog');
  }
}


  // 📌 Delete Blog
  async deleteBlog(id: number) {
    try {
      const query = 'DELETE FROM blogs WHERE id = $1 RETURNING *';
      const result = await this.dbService.executeQuery(query, [id]);

      if (result.length === 0) {
        throw new NotFoundException(`Blog with ID ${id} not found`);
      }

      return this.utilService.successResponse(`Blog with ID ${id} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting blog with ID ${id}:`, error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to delete blog');
    }
  }

  // 📌 Get All Blogs
  async getAllBlogs() {
    try {
      const query = 'SELECT * FROM blogs ORDER BY updated_at DESC';
      const list = await this.dbService.executeQuery(query); // Consistent use of executeQuery
      return list.length > 0 ? list : [];
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw new InternalServerErrorException('Failed to fetch blogs');
    }
  }

  // 📌 Get Blog By ID
async getBlogById(id: number) {
  try {
    const query = `SELECT *, regexp_replace(description, '<[^>]*>', '', 'g') AS plain_description FROM blogs WHERE id = $1`;
    const result = await this.dbService.executeQuery(query, [id]);

    if (result.length === 0) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error(`Error fetching blog by ID ${id}:`, error);
    throw error instanceof NotFoundException
      ? error
      : new InternalServerErrorException('Failed to fetch blog');
  }
}

}
