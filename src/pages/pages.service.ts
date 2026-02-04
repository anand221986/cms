import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service'; // adjust path to your dbService
import { CreatePageDto, UpdatePageDto,CreatePageSectionDto } from './page.dto';
import { UtilService } from "../util/util.service";
@Injectable()
export class PageService {
  constructor(private readonly dbService: DbService,public utilService: UtilService) {}

  // 📌 Get All Pages
  async getAllPages() {
    try {
      const query = 'SELECT * FROM pages ORDER BY updated_at DESC';
      const list = await this.dbService.execute(query);
      return list.length > 0 ? list : [];
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw new InternalServerErrorException('Failed to fetch pages');
    }
  }

  // 📌 Get Page By ID
  async getPageById(id: number) {
    try {
      const query = `SELECT title,slug,content,meta_title,meta_description,meta_keywords,og_title,og_description,og_image,sub_title
       FROM pages WHERE id =${id} and status='published'`;
      const result = await this.dbService.execute(query);
      if (result.length === 0) {
        throw new NotFoundException(`Page with ID ${id} not found`);
      }
      return this.utilService.successResponse(result[0], 'get page by id Successfully.');
    } catch (error) {
      console.error(`Error fetching page by ID ${id}:`, error);
      throw error instanceof NotFoundException ? error : new InternalServerErrorException('Failed to fetch page');
    }
  }

  // 📌 Create Page
  async createPage(dto: CreatePageDto) {
    try {
      const query = `
        INSERT INTO pages 
        (title, slug, content, meta_title, meta_description, meta_keywords, og_title, og_description, og_image, status, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())
        RETURNING *;
      `;
      const values = [
        dto.title,
        dto.slug,
        dto.content || null,
        dto.metaTitle || null,
        dto.metaDescription || null,
        dto.metaKeywords || null,
        dto.ogTitle || null,
        dto.ogDescription || null,
        dto.ogImage || null,
        dto.status || 'draft',
      ];

      const result = await this.dbService.executeQuery(query, values);
      return this.utilService.successResponse(result[0], 'page Add Successfully.');
    } catch (error) {
      console.error('Error creating page:', error);
      throw new InternalServerErrorException('Failed to create page');
    }
  }

  // 📌 Update Page
  async updatePage(id: number, dto: UpdatePageDto) {
    try {
      const query = `
        UPDATE pages 
        SET title = $1,
            slug = $2,
            content = $3,
            meta_title = $4,
            meta_description = $5,
            meta_keywords = $6,
            og_title = $7,
            og_description = $8,
            og_image = $9,
            status = $10,
            updated_at = NOW()
        WHERE id = $11
        RETURNING *;
      `;
      const values = [
        dto.title,
        dto.slug,
        dto.content || null,
        dto.metaTitle || null,
        dto.metaDescription || null,
        dto.metaKeywords || null,
        dto.ogTitle || null,
        dto.ogDescription || null,
        dto.ogImage || null,
        dto.status || 'draft',
        id,
      ];
    const result = await this.dbService.executeQuery(query, values);
      return this.utilService.successResponse(result[0], 'page updated Successfully.');
      return result[0];
    } catch (error) {
      console.error(`Error updating page with ID ${id}:`, error);
      throw error instanceof NotFoundException ? error : new InternalServerErrorException('Failed to update page');
    }
  }

  // 📌 Delete Page
  async deletePage(id: number) {
    try {
      const query = 'DELETE FROM pages WHERE id = $1 RETURNING *';
     const result = await this.dbService.executeQuery(query, [id]);

      if (result.length === 0) {
        throw new NotFoundException(`Page with ID ${id} not found`);
      }
      return this.utilService.successResponse(`Page with ID ${id} deleted successfully` );
    } catch (error) {
      console.error(`Error deleting page with ID ${id}:`, error);
      throw error instanceof NotFoundException ? error : new InternalServerErrorException('Failed to delete page');
    }
  }

  
  async getPageBySlug(slug: string) {
const query = `SELECT p.id, p.title, p.sub_title, p.slug, p.content, p.meta_title, p.meta_description, p.meta_keywords, p.og_title, p.og_description, p.og_image, p.status, p.created_at, p.updated_at, COALESCE(json_agg(json_build_object('id', ps.id, 'section_key', ps.section_key, 'title', ps.title, 'sub_title', ps.sub_title, 'meta', ps.meta, 'sort_order', ps.sort_order,'images', ps.images,'image', ps.image  ) ORDER BY ps.sort_order) FILTER (WHERE ps.id IS NOT NULL), '[]') AS sections FROM pages p LEFT JOIN page_sections ps ON ps.page_id = p.id AND ps.is_active = true WHERE p.slug = '${slug}' AND p.status = 'published' GROUP BY p.id;`;

 const result = await this.dbService.execute(query);
    if (result.length === 0) {
        throw new NotFoundException(`Page with ID ${slug} not found`);
      }
      return this.utilService.successResponse(result[0], 'get page by id Successfully.');
    } catch (error) {
      console.error(`Error fetching page by ID  :`, error);
      throw error instanceof NotFoundException ? error : new InternalServerErrorException('Failed to fetch page');
    }



   // getSectionsByPageId
   async getSectionsByPageId(pageId: number) {
  const query = `
 SELECT
  ps.id,
  ps.page_id,
  p.title AS page_name,
  ps.section_key,
  ps.title,
  ps.sub_title,
  ps.meta,
  ps.sort_order,
  ps.is_active,
  ps.created_at,
  ps.updated_at,
  ps.image,
  ps.images
FROM page_sections ps
INNER JOIN pages p ON p.id = ps.page_id
WHERE ps.page_id = $1
ORDER BY ps.sort_order ASC, ps.id ASC;`;

  return this.dbService.executeQuery(query, [pageId]);
}
 

// Add a new section
  // async addSection(pageId: number, payload: any) {
  //   const query = `
  //     INSERT INTO page_sections 
  //     (page_id, section_key, title, sub_title, meta, sort_order, is_active)
  //     VALUES ($1, $2, $3, $4, $5, $6, $7)
  //     RETURNING *;
  //   `;
  //   const values = [
  //     pageId,
  //     payload.section_key,
  //     payload.title || null,
  //     payload.sub_title || null,
  //     payload.meta || null,
  //     payload.sort_order || 0,
  //     payload.is_active ?? true,
  //   ];
  //   return this.dbService.executeQuery(query, values);
  // }

//   async addSection(pageId: number, payload: any) {
//   const query = `
//     INSERT INTO page_sections
//     (
//       page_id,
//       section_key,
//       title,
//       sub_title,
//       meta,
//       image,
//       sort_order,
//       is_active
//     )
//     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//     RETURNING *;
//   `;

//   console.log(payload,'payload')

//   const values = [
//     pageId,
//     payload.section_key,
//     payload.title || null,
//     payload.sub_title || null,
//     payload.meta ? JSON.stringify(payload.meta) : null, // ✅ store JSON
//     payload.imagePath,                                 // ✅ image filename
//     Number(payload.sort_order) || 0,
//     payload.is_active === 'true' || payload.is_active === true,
//   ];
  

//   return this.dbService.executeQuery(query, values);
// }

async addSection(pageId: number, payload: any) {

  console.log(payload);
  const query = `
    INSERT INTO page_sections
    (
      page_id,
      section_key,
      title,
      sub_title,
      meta,
      image,
      images,
      sort_order,
      is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;

  const values = [
    pageId,
    payload.section_key,
    payload.title || null,
    payload.sub_title || null,
    payload.meta ? JSON.stringify(payload.meta) : null,
    payload.imagePath || null,                       // single image
    // payload.imagesPaths && payload.imagesPaths.length > 0 ? JSON.stringify(payload.imagesPaths) : null, // multiple images,
    payload.imagesPaths?.length ? payload.imagesPaths : null,
    Number(payload.sort_order) || 0,
    payload.is_active === 'true' || payload.is_active === true,
  ];

  return this.dbService.executeQuery(query, values);
}



    // Update an existing section
  // Update a section by ID (PATCH)
  async updateSection(pageId: number,sectionId:number, payload: Partial<any>) {
    // Build dynamic SQL to only update provided fields
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (payload.section_key !== undefined) {
      fields.push(`section_key = $${idx++}`);
      values.push(payload.section_key);
    }
    if (payload.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(payload.title);
    }
    if (payload.sub_title !== undefined) {
      fields.push(`sub_title = $${idx++}`);
      values.push(payload.sub_title);
    }
    if (payload.meta !== undefined) {
      fields.push(`meta = $${idx++}`);
      values.push(payload.meta);
    }
    if (payload.sort_order !== undefined) {
      fields.push(`sort_order = $${idx++}`);
      values.push(payload.sort_order);
    }
    if (payload.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(payload.is_active);
    }
    if (payload.imagePath !== undefined) {
  fields.push(`image = $${idx++}`);
  values.push(payload.imagePath);
}

    if (fields.length === 0) return null;

    // always update updated_at
    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE page_sections
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;
    values.push(sectionId);

    const result = await this.dbService.executeQuery(query, values);
    return result[0] || null;
  }
 async createSection(pageId: number, dto: CreatePageSectionDto) {
  
    const payload = [
      { set: 'page_id', value: pageId },
      { set: 'section_key', value: dto.section_key },
      { set: 'title', value: dto.title ?? null },
      { set: 'sub_title', value: dto.sub_title ?? null },
      { set: 'meta', value: JSON.stringify(dto.meta ?? {}) },
      { set: 'sort_order', value: dto.sort_order ?? 0 },
      { set: 'is_active', value: dto.is_active ?? true },
    ];

    return this.dbService.insertData('page_sections', payload);
  }

 async deletePageSection(id: number) {
  try {
    // const query = `
    //   UPDATE page_sections
    //   SET is_active = false,
    //       updated_at = NOW()
    //   WHERE id = $1
    //   RETURNING *;
    // `;
    const query = `
  DELETE FROM page_sections
  WHERE id = $1
  RETURNING *;
`;

    const values = [id];

    const result = await this.dbService.executeQuery(query, values);
    return result[0];
  } catch (error) {
    throw error;
  }
}
}

  
