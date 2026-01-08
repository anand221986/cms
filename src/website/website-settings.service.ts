import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UpdateWebsiteSettingsDto } from './website-settings.dto';
import { UtilService } from '../util/util.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WebsiteSettingsService {
  constructor(
    private readonly dbService: DbService,
    private readonly utilService: UtilService,
  ) {}

  /* ---------------- GET SETTINGS ---------------- */
  async getSettings() {
    try {
      const query = `
        SELECT *
        FROM website_settings
        WHERE id = 1
        LIMIT 1
      `;

      const result = await this.dbService.executeQuery(query);

      return this.utilService.successResponse(
        result[0] || {},
        'Website settings fetched successfully',
      );
    } catch (error) {
      console.error('Error fetching website settings:', error);
      throw new InternalServerErrorException(
        'Failed to fetch website settings',
      );
    }
  }

  /* ---------------- UPDATE SETTINGS ---------------- */
  async updateSettings(
    dto: UpdateWebsiteSettingsDto,
    logo?: Express.Multer.File,
  ) {
    try {
      let logoUrl: string | null = null;

      /* ---------- HANDLE LOGO FILE ---------- */
      if (logo) {
        const uploadDir = path.join(process.cwd(), 'uploads');

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir);
        }

        const fileName = `${Date.now()}-${logo.originalname}`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, logo.buffer);

        logoUrl = `http://72.61.229.100/uploads/${fileName}`;
      }

      /* ---------- UPSERT SETTINGS ---------- */
      const query = `
        INSERT INTO website_settings (
          id,
          logo_url,
          primary_color,
          secondary_color,
          font_family,
          base_font_size,
          updated_at
        )
        VALUES (
          1,
          $1,
          $2,
          $3,
          $4,
          $5,
          NOW()
        )
        ON CONFLICT (id)
        DO UPDATE SET
          logo_url = COALESCE(EXCLUDED.logo_url, website_settings.logo_url),
          primary_color = EXCLUDED.primary_color,
          secondary_color = EXCLUDED.secondary_color,
          font_family = EXCLUDED.font_family,
          base_font_size = EXCLUDED.base_font_size,
          updated_at = NOW()
        RETURNING *;
      `;

      const values = [
        logoUrl,
        dto.primary_color || '#2563eb',
        dto.secondary_color || '#9333ea',
        dto.font_family || 'Inter',
        dto.base_font_size || '16px',
      ];

      const result = await this.dbService.executeQuery(query, values);

      return this.utilService.successResponse(
        result[0],
        'Website settings updated successfully',
      );
    } catch (error) {
      console.error('Error updating website settings:', error);
      throw new InternalServerErrorException(
        'Failed to update website settings',
      );
    }
  }
}
