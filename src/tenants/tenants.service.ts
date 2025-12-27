import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UtilService } from '../util/util.service';
import { Createtenants, UpdateTenants } from './tenants.dto';

@Injectable()
export class TenantsService {
  constructor(
    private readonly dbService: DbService,
    private readonly utilService: UtilService,
  ) {}

  // 📌 CREATE TENANT
  async createTenant(dto: Createtenants) {
    try {
      const query = `
        INSERT INTO tenants
        (name, domain, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING *;
      `;

      const values = [dto.name, dto.domain, dto.is_active];

      const result = await this.dbService.executeQuery(query, values);

      return this.utilService.successResponse(
        result[0],
        'Tenant created successfully.',
      );
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw new InternalServerErrorException('Failed to create tenant');
    }
  }

  // 📌 UPDATE TENANT
  async updateTenant(id: number, dto: UpdateTenants) {
    await this.getTenantById(id);

    try {
      const fields: string[] = [];
      const values: any[] = [];
      let index = 1;

      if (dto.name !== undefined) {
        fields.push(`name = $${index++}`);
        values.push(dto.name);
      }

      if (dto.domain !== undefined) {
        fields.push(`domain = $${index++}`);
        values.push(dto.domain);
      }

      if (dto.is_active !== undefined) {
        fields.push(`is_active = $${index++}`);
        values.push(dto.is_active);
      }

      fields.push(`updated_at = NOW()`);

      const query = `
        UPDATE tenants
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *;
      `;

      values.push(id);

      const result = await this.dbService.executeQuery(query, values);

      return this.utilService.successResponse(
        result[0],
        'Tenant updated successfully.',
      );
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw new InternalServerErrorException('Failed to update tenant');
    }
  }

  // 📌 GET TENANT BY ID
  async getTenantById(id: number) {
    const query = `SELECT * FROM tenants WHERE id = $1 LIMIT 1`;
    const result = await this.dbService.executeQuery(query, [id]);

    if (!result.length) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return result[0];
  }

  // 📌 GET ALL TENANTS
  async getAllTenants() {
    try {
      const query = `SELECT * FROM tenants ORDER BY updated_at DESC`;
      return await this.dbService.executeQuery(query);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw new InternalServerErrorException('Failed to fetch tenants');
    }
  }

  // 📌 DELETE TENANT
  async deleteTenant(id: number) {
    try {
      const query = `DELETE FROM tenants WHERE id = $1 RETURNING *`;
      const result = await this.dbService.executeQuery(query, [id]);

      if (!result.length) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
      }

      return this.utilService.successResponse(
        null,
        `Tenant with ID ${id} deleted successfully.`,
      );
    } catch (error) {
      console.error(`Error deleting tenant with ID ${id}:`, error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to delete tenant');
    }
  }
}
