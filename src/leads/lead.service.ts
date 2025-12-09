import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UtilService } from '../util/util.service';
import { LeadActivityService } from './lead-activity.service';  // New service
import { CreateLeadDto, UpdateLeadDto } from './lead.dto';

@Injectable()
export class LeadService {
  constructor(
    private readonly dbService: DbService,
    private readonly utilService: UtilService,
    private readonly leadActivityService: LeadActivityService,  // Injected service
  ) {}

 
// 📌 CREATE LEAD + ACTIVITY
async createLead(dto: CreateLeadDto) {
  try {
    // 🔹 Insert Lead
    const leadQuery = `
      INSERT INTO leads
      (first_name, last_name, email, phone, status, source, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *;
    `;

    const leadValues = [
      dto.first_name,
      dto.last_name,
      dto.email,
      dto.phone,
      dto.status ?? 'NEW',
      dto.source ?? null,
    ];

    const leadResult = await this.dbService.executeQuery(
      leadQuery,
      leadValues,
    );

    const lead = leadResult[0];

    // 🔹 Insert Lead Activity
    const activityQuery = `
      INSERT INTO lead_activity
      (lead_id, action, remark, created_at)
      VALUES ($1, $2, $3, NOW());
    `;

    const activityValues = [
      lead.id,
      'CREATED',
      dto.remark ?? 'Lead created',
    ];

    await this.dbService.executeQuery(activityQuery, activityValues);

    return this.utilService.successResponse(
      lead,
      'Lead created successfully.',
    );
  } catch (error) {
    console.error('Error creating lead:', error);
    throw new InternalServerErrorException('Failed to create lead');
  }
}


  // ✅ UPDATE LEAD + ACTIVITY
  // 📌 Update Lead
async updateLead(leadId: number, dto: UpdateLeadDto) {
  // 🔹 Check lead exists
  await this.getLeadById(leadId);

  try {
    // 🔹 Prepare update fields
    const fields: string[] = [];
    const values: any[] = [];

    let index = 1;

    if (dto.first_name !== undefined) {
      fields.push(`first_name = $${index++}`);
      values.push(dto.first_name);
    }

    if (dto.last_name !== undefined) {
      fields.push(`last_name = $${index++}`);
      values.push(dto.last_name);
    }

    if (dto.email !== undefined) {
      fields.push(`email = $${index++}`);
      values.push(dto.email);
    }

    if (dto.phone !== undefined) {
      fields.push(`phone = $${index++}`);
      values.push(dto.phone);
    }

    if (dto.status !== undefined) {
      fields.push(`status = $${index++}`);
      values.push(dto.status);
    }

    if (dto.source !== undefined) {
      fields.push(`source = $${index++}`);
      values.push(dto.source);
    }

    // 🔹 Always update timestamp
    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE leads
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *;
    `;

    values.push(leadId);

    const result = await this.dbService.executeQuery(query, values);
    const updatedLead = result[0];

    // 🔹 Insert Lead Activity
    await this.leadActivityService.createLeadActivity(
      leadId,
      'UPDATED',
      dto.remark ?? 'Lead updated',
    );

    return this.utilService.successResponse(
      updatedLead,
      'Lead updated successfully.',
    );
  } catch (error) {
    console.error('Error updating lead:', error);
    throw new InternalServerErrorException('Failed to update lead');
  }
}


  // ✅ GET LEAD BY ID
  async getLeadById(id: number) {
    const query = `SELECT * FROM leads WHERE id = '${id}' LIMIT 1`;
    const result = await this.dbService.execute(query);

    if (!result.length) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return result[0];
  }

  // ✅ GET LEAD WITH ACTIVITIES
  async getLeadWithActivities(id: number) {
    const lead = await this.getLeadById(id);
    const activities = await this.leadActivityService.getActivitiesForLead(id);
    
    return {
      lead,
      activities,
    };
  }

  

    // 📌 Get All leads
  async getAllLeads() {
    try {
      const query = 'SELECT * FROM leads ORDER BY updated_at DESC';
      const list = await this.dbService.executeQuery(query); // Consistent use of executeQuery
      return list.length > 0 ? list : [];
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw new InternalServerErrorException('Failed to fetch leads');
    }
  }

    // 📌 Delete Blog
  async deleteleads(id: number) {
    try {
      const query = 'DELETE FROM leads WHERE id = $1 RETURNING *';
      const result = await this.dbService.executeQuery(query, [id]);

      if (result.length === 0) {
        throw new NotFoundException(`leads with ID ${id} not found`);
      }

      return this.utilService.successResponse(`leads with ID ${id} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting leads with ID ${id}:`, error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to delete lead');
    }
  }
}
