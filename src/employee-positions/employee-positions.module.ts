import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeePositionsService } from './employee-positions.service';
import { EmployeePositionsController } from './employee-positions.controller';
import { EmployeePosition, EmployeePositionSchema } from './schemas/employee-position.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmployeePosition.name, schema: EmployeePositionSchema }
    ])
  ],
  controllers: [EmployeePositionsController],
  providers: [EmployeePositionsService],
  exports: [EmployeePositionsService, MongooseModule],
})
export class EmployeePositionsModule { }