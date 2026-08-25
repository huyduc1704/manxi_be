import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Booking, BookingDocument, BookingType, PaymentStatus } from './schemas/booking.schema';
import { Service, ServiceDocument } from 'src/services/schemas/service.schema';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    private telegramService: TelegramService,
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
      bookingCode: `BK${Date.now()}${Math.floor(Math.random() * 1000)}`,
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
    const savedBooking = await newBooking.save();

    // Gửi thông báo Telegram
    const serviceNames = services.map(s => s.name).join(', ');
    this.telegramService.sendBookingNotification({
      customerName: createBookingDto.guestInfo?.fullName || 'Member',
      phone: createBookingDto.guestInfo?.phone || 'N/A',
      date: createBookingDto.bookingDate,
      time: createBookingDto.bookingTime,
      serviceName: serviceNames,
      note: createBookingDto.customerNote,
    });

    return savedBooking;
  }


  async findAll() {
    return this.bookingModel.find().populate('service').exec();
  }

  async findByUser(userId: string) {
    return this.bookingModel.find({ user: userId })
      .populate('service', 'name duration price') // Populate tên dịch vụ để hiện lên UI
      .sort({ date: -1, time: -1 }) // Mới nhất lên đầu
      .exec();
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
