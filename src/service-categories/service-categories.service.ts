import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import { Model, isValidObjectId } from 'mongoose';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { ServiceCategory, ServiceCategoryDocument } from './schemas/service-category.schema';

@Injectable()
export class ServiceCategoriesService {
  constructor(
    @InjectModel(ServiceCategory.name)
    private serviceCategoryModel: Model<ServiceCategoryDocument>,
  ) { }

  async create(createServiceCategoryDto: CreateServiceCategoryDto): Promise<ServiceCategory> {
    const newCategory = new this.serviceCategoryModel(createServiceCategoryDto);
    return newCategory.save();
  }

  async findAll(): Promise<ServiceCategory[]> {
    return this.serviceCategoryModel
      .find()
      .populate('parentCategory', 'name slug')
      .sort({ displayOrder: 1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ServiceCategory> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const category = await this.serviceCategoryModel
      .findById(id)
      .populate('parentCategory', 'name slug')
      .exec();

    if (!category) {
      throw new NotFoundException(`Service category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateServiceCategoryDto: UpdateServiceCategoryDto): Promise<ServiceCategory> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const updateCategory = await this.serviceCategoryModel
      .findByIdAndUpdate(id, updateServiceCategoryDto, { new: true })
      .exec();

    if (!updateCategory) {
      throw new NotFoundException(`Service category with ID ${id} not found`);
    }
    return updateCategory;
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const deletedCategory = await this.serviceCategoryModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedCategory) {
      throw new NotFoundException(`Service category with ID ${id} not found`);
    }

    return deletedCategory;
  }
}
