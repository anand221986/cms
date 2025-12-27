import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { Createtenants, UpdateTenants } from './tenants.dto';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UtilService } from '../util/util.service';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly utilService: UtilService,
  ) {}

  // 📌 CREATE TENANT
  @Post()
  @ApiBody({
    schema: {
      example: {
        name: 'Acme Corporation',
        domain: 'acme.com',
        is_active: true,
      },
    },
  })
  create(@Body() dto: Createtenants) {
    return this.tenantsService.createTenant(dto);
  }

  // 📌 UPDATE TENANT
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTenants,
  ) {
    return this.tenantsService.updateTenant(id, dto);
  }

  // 📌 GET ALL TENANTS
  @Get()
  @ApiResponse({ status: 200, description: 'List of tenants retrieved.' })
  async findAll() {
    try {
      const tenants = await this.tenantsService.getAllTenants();
      return this.utilService.successResponse(
        tenants,
        'Tenants fetched successfully.',
      );
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch tenants', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 📌 DELETE TENANT
  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Tenant not found.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.tenantsService.deleteTenant(id);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete tenant', error: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
