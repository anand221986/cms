import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Delete,
  Res,
  InternalServerErrorException
} from "@nestjs/common";
import { Response } from "express";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from "@nestjs/swagger";
import { PageService } from "./pages.service";

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
}
