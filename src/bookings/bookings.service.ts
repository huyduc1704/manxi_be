import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Booking, BookingDocument, BookingStatus, BookingType, PaymentStatus } from './schemas/booking.schema';
import { Service, ServiceDocument } from '../services/schemas/service.schema';
import { TelegramService } from '../telegram/telegram.service';
import { ConflictException } from '@nestjs/common';


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

    const bookingDateObj = new Date(createBookingDto.bookingDate);
    bookingDateObj.setUTCHours(0, 0, 0, 0);

    if (createBookingDto.employeeId) {
      const existingBooking = await this.bookingModel.findOne({
        employee: createBookingDto.employeeId,
        bookingDate: bookingDateObj,
        bookingTime: createBookingDto.bookingTime,
        status: { $ne: BookingStatus.CANCELLED },
      });

      if (existingBooking) {
        throw new ConflictException('Khung giờ này của nhân viên đã có người đặt, vui lòng chọn giờ khác.');
      }
    }

    const totalAmount = services.reduce((sum, service) => sum + (service.price || 0), 0);

    const discountAmount = services.reduce((sum, service) =>
      sum + (service.discountPrice ? (service.price - service.discountPrice) : 0), 0
    );

    const finalAmount = totalAmount - discountAmount;

    const estimatedDuration = services.reduce((sum, service) => sum + (service.duration || 0), 0);

    const bookingData: any = {
      ...createBookingDto,
      bookingDate: bookingDateObj,
      employee: createBookingDto.employeeId,
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

    try {
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
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException("Khung giờ này vừa có người nhanh tay đặt trước mất rồi!");
      }
      throw error;
    }
  }


  async findAll() {
    return this.bookingModel.find()
      .populate('services', 'name duration price')
      .populate('employee', 'fullName avatar')
      .populate('customer', 'fullName phone email')
      .sort({ bookingDate: -1, bookingTime: -1 })
      .exec();
  }

  async findByUser(userId: string) {
    return this.bookingModel.find({ customer: userId })
      .populate('services', 'name duration price')
      .populate('employee', 'fullName avatar')
      .sort({ bookingDate: -1, bookingTime: -1 })
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
