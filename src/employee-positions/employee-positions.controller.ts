import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmployeePositionsService } from './employee-positions.service';
import { CreateEmployeePositionDto } from './dto/create-employee-position.dto';
import { UpdateEmployeePositionDto } from './dto/update-employee-position.dto';

@Controller('employee-positions')
export class EmployeePositionsController {
  constructor(private readonly employeePositionsService: EmployeePositionsService) {}

  @Post()
  create(@Body() createEmployeePositionDto: CreateEmployeePositionDto) {
    return this.employeePositionsService.create(createEmployeePositionDto);
  }

  @Get()
  findAll() {
    return this.employeePositionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeePositionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeePositionDto: UpdateEmployeePositionDto) {
    return this.employeePositionsService.update(+id, updateEmployeePositionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeePositionsService.remove(+id);
  }
}
