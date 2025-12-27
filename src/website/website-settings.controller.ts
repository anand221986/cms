import {
  Controller,
  Get,
  Put,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WebsiteSettingsService } from './website-settings.service';
import { UpdateWebsiteSettingsDto } from './website-settings.dto';
import { ApiTags, ApiResponse, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Website Settings')
@Controller('website-settings')
export class WebsiteSettingsController {
  constructor(
    private readonly websiteSettingsService: WebsiteSettingsService,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Website settings fetched successfully' })
  async getSettings() {
    return this.websiteSettingsService.getSettings();
  }

  @Put()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiResponse({ status: 200, description: 'Website settings updated successfully' })
  async updateSettings(
    @UploadedFile() logo: Express.Multer.File,
    @Body() dto: UpdateWebsiteSettingsDto,
  ) {
    try {
      return await this.websiteSettingsService.updateSettings(dto, logo);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to update website settings', error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
