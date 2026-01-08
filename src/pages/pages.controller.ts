import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Patch,
  Delete,
  Res,
  InternalServerErrorException,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
   ValidationPipe
} from "@nestjs/common";
import { Response } from "express";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from "@nestjs/swagger";
import { PageService } from "./pages.service";
import {CreatePageSectionDto,AddSectionDto } from './page.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags("pages")
@Controller("pages")
export class PagesController {
  constructor(
    public pagesService: PageService,
  ) {}
  @Get("getAllPages")
  @ApiOperation({ summary: "Get all pages" })
  async getAllUsers(@Res() res: Response) {
    const users = await this.pagesService.getAllPages();
    res.status(HttpStatus.OK).json(users);
  }

 @Post()
  @ApiOperation({ summary: 'Create a new page' })
  async createPage(@Body() payload: any, @Res() res: Response) {
    try {
      const page = await this.pagesService.createPage(payload);
      res.status(HttpStatus.CREATED).json(page);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to create page');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a page by ID' })
  async updatePage(@Param('id') id: number, @Body() payload: any, @Res() res: Response) {
    try {
      const updatedPage = await this.pagesService.updatePage(id, payload);
      res.status(HttpStatus.OK).json(updatedPage);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to update page');
    }
  }
   @Delete(':id')
  @ApiOperation({ summary: 'Delete a page by ID' })
  async deletePage(@Param('id') id: number, @Res() res: Response) {
    try {
      await this.pagesService.deletePage(id);
      res.status(HttpStatus.OK).json({ message: 'Page deleted successfully' });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to delete page');
    }
  }

    @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete pages' })
  async bulkDelete(@Body() body: { ids: number[] }, @Res() res: Response) {
    try {
      // await this.pagesService.bulkDelete(body.ids);
      res.status(HttpStatus.OK).json({ message: 'Pages deleted successfully' });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to bulk delete pages');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get The page content by Id' })
  async getPageById(@Param('id') id: number, @Body() payload: any, @Res() res: Response) {
    try {
      console.log(id);
      const getPage = await this.pagesService.getPageById(id);
      res.status(HttpStatus.OK).json(getPage);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to get page by id');
    }
  }

  

  @Get('slug/:slug')
  async getPage(@Param('slug') slug: string) {
    const page = await this.pagesService.getPageBySlug(slug);

    return {
      status: true,
      data: page,
    };
  }
//get section wise  by page Id
 @Get(':pageId/sections')
async getPageSections(@Param('pageId') pageId: number) {
  const sections = await this.pagesService.getSectionsByPageId(pageId);
  return {
    status: true,
    data: sections,
  };
}

 @Post('pages/:pageId/sections')
  async addSection(@Param('pageId') pageId: number, @Body() payload: any) {
    const section = await this.pagesService.addSection(pageId, payload);
    return { status: true, data: section };
  }
// PATCH /page-sections/:id
  // Use this for partial updates (status, title, etc.)
  @Patch('page-sections/:id')
  async updateSection(
    @Param('id') id: number,
    @Body() payload: any
  ) {
    const updatedSection = await this.pagesService.updateSection(0,id, payload);
    if (!updatedSection) {
      return { status: false, message: 'No fields to update or section not found' };
    }
    return { status: true, data: updatedSection };
  }

  // PUT /page-sections/pages/:pageId/sections
  // Use this for creating a new section
  @Put('/:pageId/sections/:sectionId')
  async createOrReplaceSection(
    @Param('pageId') pageId: number,
    @Param('sectionId') sectionId: number,
    @Body() payload: any
  ) {
    const section = await this.pagesService.updateSection(pageId,sectionId, payload);
    return { status: true, data: section };
  }
  //   @Post('/:pageId/sections')
  //  async createPageSection(
  //    @Param('pageId') pageId: number,
  //   @Body() body: CreatePageSectionDto,
  // ) {
  //   // return this.pagesService.createSection(pageId, body);
  //      const updatedSection = await this.pagesService.addSection(pageId, body);
  //   if (!updatedSection) {
  //     return { status: false, message: 'No fields to update or section not found' };
  //   }
  //   return { status: true, data: updatedSection };
  // }

  @Post('/:pageId/sections')
@UseInterceptors(FileInterceptor('image', {
  storage: diskStorage({
    destination: './uploads/sections',
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueName + extname(file.originalname));
    },
  }),
}))
async createPageSection(
  @Param('pageId') pageId: number,
  @UploadedFile() image: Express.Multer.File,
  @Body(new ValidationPipe({ transform: true })) payload: AddSectionDto,
) {
  // parse meta manually if string
  const meta = typeof payload.meta === 'string' ? JSON.parse(payload.meta) : payload.meta;

  return this.pagesService.addSection(pageId, {
    ...payload,
    meta,
    imagePath: image?.filename || null,
  });
}


   @Delete('page-sections/:id')
  async deleteSection(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.pagesService.deletePageSection(id);
  }

}

