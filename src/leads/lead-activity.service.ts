import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UtilService } from '../util/util.service';

@Injectable()
export class LeadActivityService {
  constructor(
    private readonly dbService: DbService,
    private readonly utilService: UtilService,
  ) {}

  // 📌 Create Lead Activity
  async createLeadActivity(
    leadId: number,
    type: string,
    remark: string,
  ) {
    try {
      const query = `
        INSERT INTO lead_activities
        (lead_id, activity_type, remark, created_at)
        VALUES (
          ${leadId},
          '${type}',
          '${remark ?? 'Lead activity'}',
          NOW()
        )
        RETURNING *;
      `;

      const [activity] = await this.dbService.execute(query);

      return this.utilService.successResponse(
        activity,
        'Lead activity created successfully.',
      );
    } catch (error) {
      console.error('Error creating lead activity:', error);
      throw new InternalServerErrorException(
        'Failed to create lead activity',
      );
    }
  }

  // 📌 Get Activities for Lead
  async getActivitiesForLead(leadId: number) {
    try {
      const query = `
        SELECT *
        FROM lead_activities
        WHERE lead_id = ${leadId}
        ORDER BY created_at DESC;
      `;

      const activities = await this.dbService.execute(query);

      return this.utilService.successResponse(
        activities,
        'Lead activities fetched successfully.',
      );
    } catch (error) {
      console.error('Error fetching lead activities:', error);
      throw new InternalServerErrorException(
        'Failed to fetch lead activities',
      );
    }
  }
}
