import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UtilService } from '../util/util.service';
import { UserService } from "../user/user.service";
import {
  CreateEmailSignatureDto,
  UpdateEmailSignatureDto,
} from './email-signature.dto';

@Injectable()
export class EmailSignatureService {
  constructor(
    private readonly dbService: DbService,
    private readonly utilService: UtilService,
    private usersService: UserService,
  ) {}

  // 📌 CREATE SIGNATURE
  async create(dto: CreateEmailSignatureDto) {
    try {
    const isPro = await this.usersService.isPro(dto.user_id);

    if (!isPro) {
      // Free plan allows only 1 signature
      const existingSignatures = await this.getSignatures(dto.user_id);
      if (existingSignatures.length >= 1) {
        throw new ForbiddenException('Upgrade to Pro for multiple signatures');
      }
    }
      const query = `
        INSERT INTO email_signatures
        (user_id, name, designation, company, phone, email, website, logo_url, logo_base64, custom_html)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *;
      `;

      const values = [
        dto.user_id,
        dto.name,
        dto.designation,
        dto.company,
        dto.phone,
        dto.email,
        dto.website,
        dto.logo_url,
        dto.logo_base64,
        dto.custom_html,
      ];

      const [signature] = await this.dbService.executeQuery(query, values);

      return this.utilService.successResponse(
        signature,
        'Email signature created successfully',
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create email signature');
    }
  }

  // 📌 UPDATE SIGNATURE
  async update(id: number, dto: UpdateEmailSignatureDto) {
    await this.findById(id);

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        fields.push(`${key} = $${index++}`);
        values.push(value);
      }
    }

    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE email_signatures
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *;
    `;

    // console.log(query,'console.log query')

    values.push(id);

    const [updated] = await this.dbService.executeQuery(query, values);

    return this.utilService.successResponse(
      updated,
      'Email signature updated successfully',
    );
  }

  // 📌 GET BY ID
  async findById(id: number) {
    const query = `SELECT *,logo_base64 as logoBase64 FROM email_signatures WHERE id = $1`;
    const result = await this.dbService.executeQuery(query, [id]);

    if (!result.length) {
      throw new NotFoundException('Email signature not found');
    }

    return result;
  }

  // 📌 GET BY USER
  async findByUser(userId: number) {
    const query = `
      SELECT * FROM email_signatures
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `;
    return this.dbService.executeQuery(query, [userId]);
  }

  // 📌 DELETE
  async delete(id: number) {
    const query = `DELETE FROM email_signatures WHERE id = $1 RETURNING *`;
    const result = await this.dbService.executeQuery(query, [id]);

    if (!result.length) {
      throw new NotFoundException('Email signature not found');
    }

    return this.utilService.successResponse(
      null,
      'Email signature deleted successfully',
    );
  }

  
    async getSignatures(userId: number) {
    const query = `SELECT  * FROM email_signatures WHERE user_id = $1`;
    const result = await this.dbService.executeQuery(query, [userId]);
    if (!result.length) {
      throw new NotFoundException('No email signatures found for this user');
    }
    return result;
  }
}
