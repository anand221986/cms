import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailSignatureService } from './email-signature.service';
import {
  CreateEmailSignatureDto,
  UpdateEmailSignatureDto,
} from './email-signature.dto';

@ApiTags('email-signature')
@Controller('email-signature')
export class EmailSignatureController {
  constructor(private readonly service: EmailSignatureService) {}

  @Post()
  create(@Body() dto: CreateEmailSignatureDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmailSignatureDto,
  ) {
    return this.service.update(id, dto);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByUser(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.findByUser(userId);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
