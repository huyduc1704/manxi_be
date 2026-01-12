import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service, ServiceDocument } from './schemas/service.schema';

@Injectable()
export class ServicesService {

  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) { }

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const newService = new this.serviceModel(createServiceDto);
    return newService.save();
  }

  async findAll(): Promise<Service[]> {
    return this.serviceModel
      .find()
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Service> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID');

    const service = await this.serviceModel
      .findById(id)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .exec();

    if (!service) throw new NotFoundException(`Service with ID ${id} not found`);
    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID');

    const updateService = await this.serviceModel
      .findByIdAndUpdate(id, updateServiceDto, { new: true })
      .exec();

    if (!updateService) throw new NotFoundException(`Service with ID ${id} not found`);
    return updateService;
  }

  async remove(id: string): Promise<Service> {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid ID');

    const deleteService = await this.serviceModel.findByIdAndDelete(id).exec();

    if (!deleteService) throw new NotFoundException(`Service with ID ${id} not found`);
    return deleteService;
  }
}
