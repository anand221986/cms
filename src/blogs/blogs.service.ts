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
      const query = `SELECT * FROM blogs WHERE id = $1`; // Fixed SQL query to use parameterized query correctly
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

  // 📌 Create Blog
  async createBlog(dto: CreateBlogDto) {
    try {
      const query = `
        INSERT INTO blogs
        (title,  content, author, image_url, created_at, updated_at)
        VALUES ($1, $2, $3, $4,NOW(), NOW())
        RETURNING *;
      `;
      const values = [
        dto.title,
        dto.content,
        dto.author || null,
        dto.imageUrl || null, // Assuming imageUrl is part of the DTO
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
      const query = `
        UPDATE blogs
        SET title = $1,
            content = $2,
            author = $3,
            image_url = $4,
            updated_at = NOW()
        WHERE id = $5
        RETURNING *;
      `;
      const values = [
        dto.title,
        dto.content,
        dto.author || null,
        dto.imageUrl || null, // Assuming imageUrl is part of the DTO
        id,
      ];

      const result = await this.dbService.executeQuery(query, values);
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
}
