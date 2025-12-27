import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UtilService } from '../util/util.service';
import { CreateMenuDto, UpdateMenuDto } from './menu.dto';
interface ReorderMenuItemDto {
  id: number;
  position: number;
}
@Injectable()
export class MenuService {
  constructor(
    private readonly dbService: DbService,
    private readonly utilService: UtilService,
  ) {}

  // 📌 CREATE MENU
 async createMenu(dto: CreateMenuDto) {
  try {
    const query = `
      INSERT INTO menus
      (title, slug, url, parent_id, "order", position, is_active, location, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, true, $7, NOW(), NOW())
      RETURNING *;
    `;

    const values = [
      dto.title,
      dto.slug ?? null,
      dto.url ?? null,
      dto.parent_id ?? null,
      dto.order ?? 0,
      dto.position ?? 0,
      dto.location ?? null,
    ];

    const result = await this.dbService.executeQuery(query, values);

    return this.utilService.successResponse(
      result[0],
      'Menu created successfully',
    );
  } catch (error) {
    console.error('Error creating menu:', error);
    throw new InternalServerErrorException('Failed to create menu');
  }
}


  // 📌 UPDATE MENU
  async updateMenu(id: number, dto: UpdateMenuDto) {
    await this.getMenuById(id);

    try {
      const fields: string[] = [];
      const values: any[] = [];
      let index = 1;

      if (dto.title !== undefined) {
        fields.push(`title = $${index++}`);
        values.push(dto.title);
      }

      if (dto.slug !== undefined) {
        fields.push(`slug = $${index++}`);
        values.push(dto.slug);
      }

      if (dto.url !== undefined) {
        fields.push(`url = $${index++}`);
        values.push(dto.url);
      }

      if (dto.parent_id !== undefined) {
        fields.push(`parent_id = $${index++}`);
        values.push(dto.parent_id);
      }

      if (dto.position !== undefined) {
        fields.push(`"position" = $${index++}`);
        values.push(dto.position);
      }

      if (dto.is_active !== undefined) {
        fields.push(`is_active = $${index++}`);
        values.push(dto.is_active);
      }

      fields.push(`updated_at = NOW()`);

      const query = `
        UPDATE menus
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *;
      `;

      values.push(id);

      const result = await this.dbService.executeQuery(query, values);

      return this.utilService.successResponse(
        result[0],
        'Menu updated successfully',
      );
    } catch (error) {
      console.error('Error updating menu:', error);
      throw new InternalServerErrorException('Failed to update menu');
    }
  }

  // 📌 GET MENU BY ID
  async getMenuById(id: number) {
    const query = `SELECT * FROM menus WHERE id = $1 LIMIT 1`;
    const result = await this.dbService.executeQuery(query, [id]);

    if (!result.length) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return result[0];
  }

  // 📌 GET ALL MENUS (FLAT)
  async getAllMenu() {
    try {
      const query = `
        SELECT *
        FROM menus
        WHERE is_active = true
        ORDER BY parent_id NULLS FIRST, "order" ASC
      `;
      return await this.dbService.executeQuery(query);
    } catch (error) {
      console.error('Error fetching menus:', error);
      throw new InternalServerErrorException('Failed to fetch menus');
    }
  }

  // 📌 DELETE MENU
  async deleteMenu(id: number) {
    try {
      const query = `DELETE FROM menus WHERE id = $1 RETURNING *`;
      const result = await this.dbService.executeQuery(query, [id]);

      if (!result.length) {
        throw new NotFoundException(`Menu with ID ${id} not found`);
      }

      return this.utilService.successResponse(
        null,
        'Menu deleted successfully',
      );
    } catch (error) {
      console.error('Error deleting menu:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to delete menu');
    }
  }

  async getAllWbsiteMenu() {
  try {
    const query = `
      SELECT id, title, slug, url, parent_id, "order" ,position
      FROM menus
      WHERE is_active = true
      ORDER BY parent_id NULLS FIRST, "order" ASC
    `;

    const rows = await this.dbService.executeQuery(query);

    const map = new Map<number, any>();
    const menuTree: any[] = [];

    // Step 1: Create map
    rows.forEach(row => {
      map.set(row.id, {
        title: row.title,
        slug: row.slug,
        url: row.url,
        position:row.position,
        children: [],
      });
    });

    // Step 2: Attach children to parents
    rows.forEach(row => {
      if (row.parent_id) {
        map.get(row.parent_id)?.children.push(map.get(row.id));
      } else {
        menuTree.push(map.get(row.id));
      }
    });

    // Step 3: Remove empty children arrays
    menuTree.forEach(menu => {
      if (!menu.children.length) {
        delete menu.children;
      }
    });

    return menuTree;
  } catch (error) {
    console.error('Error fetching menus:', error);
    throw new InternalServerErrorException('Failed to fetch menus');
  }
}

 async reorderMenus(items: ReorderMenuItemDto[]) {
    if (!items || items.length === 0) {
      return this.utilService.successResponse([], 'No menus to reorder');
    }

    try {
      // Build CASE statements for bulk update
      const ids: number[] = [];
      const cases: string[] = [];

      items.forEach((item, index) => {
        ids.push(item.id);
        cases.push(`WHEN id = $${index * 2 + 1} THEN $${index * 2 + 2}`);
      });

      const values: any[] = [];
      items.forEach(item => {
        values.push(item.id, item.position);
      });

      const query = `
        UPDATE menus
        SET "position" = CASE
          ${cases.join('\n')}
          ELSE "position"
        END,
        updated_at = NOW()
        WHERE id IN (${ids.map((_, i) => `$${i * 2 + 1}`).join(', ')})
        RETURNING *;
      `;

      const result = await this.dbService.executeQuery(query, values);

      return this.utilService.successResponse(result, 'Menus reordered successfully');
    } catch (error) {
      console.error('Error reordering menus:', error);
      throw new InternalServerErrorException('Failed to reorder menus');
    }
  }

}
