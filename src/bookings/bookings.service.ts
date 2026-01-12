import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Booking, BookingDocument, BookingType, PaymentStatus } from './schemas/booking.schema';
import { Service, ServiceDocument } from 'src/services/schemas/service.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) { }

  async create(createBookingDto: CreateBookingDto, userId?: string) {
    const services = await this.serviceModel.find({
      _id: { $in: createBookingDto.serviceIds },
    });

    if (services.length !== createBookingDto.serviceIds.length) {
      throw new NotFoundException('Some services not found');
    }

    const totalAmount = services.reduce((sum, service) => sum + (service.price || 0), 0);

    const discountAmount = services.reduce((sum, service) =>
      sum + (service.discountPrice ? (service.price - service.discountPrice) : 0), 0
    );

    const finalAmount = totalAmount - discountAmount;

    const estimatedDuration = services.reduce((sum, service) => sum + (service.duration || 0), 0);

    const bookingData: any = {
      ...createBookingDto,
      services: createBookingDto.serviceIds,
      totalAmount,
      discountAmount,
      finalAmount,
      estimatedDuration,
      paymentStatus: PaymentStatus.UNPAID,
    };

    if (userId) {
      bookingData.customer = userId;
      bookingData.bookingType = BookingType.MEMBER;
    } else {
      if (!createBookingDto.guestInfo) {
        throw new BadRequestException('Guest info is required for guest booking');
      }
      bookingData.bookingType = BookingType.GUEST
    }

    const newBooking = new this.bookingModel(bookingData);
    return newBooking.save();
  }


  findAll() {
    return this.bookingModel.find();
  }

  findOne(id: string) {
    return this.bookingModel.findById(id);
  }

  update(id: string, updateBookingDto: UpdateBookingDto) {
    return this.bookingModel.findByIdAndUpdate(id, updateBookingDto);
  }

  remove(id: string) {
    return this.bookingModel.findByIdAndDelete(id);
  }
}
