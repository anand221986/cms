import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  
} from '@nestjs/common';
import { EmailService } from './email.service';
import { MailService } from './mail.service';
import { SendMailMergeDto, UpdateEmailTemplateDto,CreateEmailTemplateDto,CreateMailMergeJobDto } from './mail-merge.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { UtilService } from "../util/util.service";
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@ApiTags('Email') // Group in Swagger
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService, private readonly mailService: MailService, private readonly utilService: UtilService) { }
  @Post('merge')
  sendMailMerge(@Body() dto: SendMailMergeDto) {
    return this.mailService.sendMailMerge(dto);
  }

  @Post('upload')
 @UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/email';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName =
          Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueName}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(csv)$/)) {
        return cb(new Error('Only CSV files are allowed'), false);
      }
      cb(null, true);
    },
  }),
)
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body('templateId') templateId: number,
  ) {
    return this.mailService.processCsvFile(file, templateId);
  }

  @Get("templates")
  async getAllTemplates() {
    let result = this.mailService.getTemplate();
    return result;
  }

  /**
   * GET /templates/:id
   * Fetch template by ID
   */
  @Get('templates/:id')
  async getTemplateById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    let result = this.mailService.getTemplate(id);
    return this.utilService.successResponse(
      result,
      'Get Templates Id successfully.',
    );
  }

  @Delete('templates/:id')
  @ApiResponse({ status: 200, description: 'templates deleted successfully.' })
  @ApiResponse({ status: 404, description: 'templates not found.' })
  async remove(@Param('id') id: string) {
    try {
      return await this.mailService.deleteTemplates(+id);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete blog', error: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('templates/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmailTemplateDto
  ) {
    return this.mailService.updateTemplate(id, dto);
  }

  @Post('templates')
create(@Body() dto: CreateEmailTemplateDto) {
  return this.mailService.createTemplate(dto);
}

@Post('merge-jobs')
  async createJob(@Body() dto: CreateMailMergeJobDto) {
    return {
      status: true,
      message: 'Mail merge job created',
      result: await this.mailService.createJob(dto),
    };
  }

  // /** ✅ Fetch All Jobs */
  // @Get('merge-jobs')
  // async getJobs() {
  //   return {
  //     status: true,
  //     result: await this.mailService.getJobs(),
  //   };
  // }

  // /** ✅ Delete Job */
  // @Delete('merge-jobs/:id')
  // async deleteJob(@Param('id') id: number) {
  //   await this.mailService.deleteJob(id);
  //   return {
  //     status: true,
  //     message: 'Job deleted',
  //   };
  // }

 
    // /** ✅ Fetch All Jobs */
  @Get('merge-jobs')
  async getJobs() {
    return {
      status: true,
      result: await this.mailService.getAllJobs(),
    };
  }
    // /** ✅ Fetch   Jobs by id */
  @Get('merge-jobs/:jobId')
  async getJobsbyId( @Param('jobId', ParseIntPipe) jobId: number) {
    return {
      status: true,
      result: await this.mailService.getAllJobs(jobId),
    };
  }

  
    @Get('mail-templates')
  async getMailTemplates() {
    return {
      status: true,
      result: await this.mailService.getTemplate(),
    };
  }

 
  @Delete('merge-jobs/:id')
  @ApiResponse({ status: 200, description: 'Merge Jobs deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Jobs not found.' })
  async removeJob(@Param('id') id: string) {
    try {
      return await this.mailService.deleteJobs(+id);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete blog', error: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

}
