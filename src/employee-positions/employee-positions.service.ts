import { Injectable } from '@nestjs/common';
import { CreateEmployeePositionDto } from './dto/create-employee-position.dto';
import { UpdateEmployeePositionDto } from './dto/update-employee-position.dto';

@Injectable()
export class EmployeePositionsService {
  create(createEmployeePositionDto: CreateEmployeePositionDto) {
    return 'This action adds a new employeePosition';
  }

  findAll() {
    return `This action returns all employeePositions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} employeePosition`;
  }

  update(id: number, updateEmployeePositionDto: UpdateEmployeePositionDto) {
    return `This action updates a #${id} employeePosition`;
  }

  remove(id: number) {
    return `This action removes a #${id} employeePosition`;
  }
}
