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
import { ApiTags, ApiResponse } from '@nestjs/swagger';

import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto,ReorderMenuDto } from './menu.dto';
import { UtilService } from '../util/util.service';

@ApiTags('menus')
@Controller('menus')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly utilService: UtilService,
  ) {}

  // 📌 CREATE MENU
  @Post()
  @ApiResponse({ status: 201, description: 'Menu created successfully' })
  async create(@Body() dto: CreateMenuDto) {
    try {
      return await this.menuService.createMenu(dto);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to create menu', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 📌 UPDATE MENU
  @Put(':id')
  @ApiResponse({ status: 200, description: 'Menu updated successfully' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuDto,
  ) {
    try {
      return await this.menuService.updateMenu(id, dto);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to update menu', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 📌 GET ALL MENUS
  @Get()
  @ApiResponse({ status: 200, description: 'Menus retrieved successfully' })
  async findAll() {
    try {
      const menus = await this.menuService.getAllMenu();
      return this.utilService.successResponse(
        menus,
        'Menus fetched successfully',
      );
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch menus', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //get All Wbsite Menu

    @Get('/findAllWebsiteMenu')
  @ApiResponse({ status: 200, description: 'website Menus retrieved successfully' })
  async findAllWebsiteMenu() {
    try {
      const menus = await this.menuService.getAllWbsiteMenu();
      return this.utilService.successResponse(
        menus,
        'Menus fetched successfully',
      );
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to fetch menus', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 📌 GET MENU BY ID
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Menu retrieved successfully' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const menu = await this.menuService.getMenuById(id);
      return this.utilService.successResponse(
        menu,
        'Menu fetched successfully',
      );
    } catch (error) {
      throw new HttpException(
        { message: 'Menu not found', error: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // 📌 DELETE MENU
  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Menu deleted successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.menuService.deleteMenu(id);
    } catch (error) {
      throw new HttpException(
        { message: 'Failed to delete menu', error: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }
   @Post('reorder')
  async reorder(@Body() body: ReorderMenuDto) {
    return this.menuService.reorderMenus(body.orders);
  }
}
