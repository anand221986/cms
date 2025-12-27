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
  Delete

} from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto, UpdateLeadDto,ContactLeadDto} from './lead.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { UtilService } from "../util/util.service";
@ApiTags('leads')
@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService, private readonly utilService: UtilService) { }
  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadService.createLead(dto);
  }
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadService.updateLead(id, dto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List of leads retrieved.' })
  async findAll() {
    try {
      let getAllBlogs = await this.leadService.getAllLeads();
      return this.utilService.successResponse(getAllBlogs, 'get All leads successfully.');
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch leads', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get(':id')
  getLead(@Param('id', ParseIntPipe) id: number) {
    return this.leadService.getLeadWithActivities(id);
  }
    @Delete(':id')
    @ApiResponse({ status: 200, description: 'Blog deleted successfully.' })
    @ApiResponse({ status: 404, description: 'Blog not found.' })
    async remove(@Param('id') id: string) {
      try {
        return await this.leadService.deleteleads(+id);
      } catch (error) {
        throw new HttpException(
          { message: 'Failed to delete blog', error: error.message },
          HttpStatus.NOT_FOUND,
        );
      }
    }
    

@Post('contact')
async captureContactLead(@Body() payload: ContactLeadDto) {
  try {
    const lead = await this.leadService.createContactLead(payload);
    return this.utilService.successResponse(
      lead,
      'Lead captured successfully.',
    );
  } catch (error) {
    throw new HttpException(
      {
        message: 'Failed to capture lead',
        error: error.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
}
