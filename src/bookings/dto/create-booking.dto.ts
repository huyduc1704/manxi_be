import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEmail,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested
} from 'class-validator'

import { BookingType, PaymentMethod } from '../schemas/booking.schema';

class GuestInfoDto {
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    email?: string;
}

export class CreateBookingDto {
    @IsEnum(BookingType)
    bookingType: BookingType;

    @IsOptional()
    @ValidateNested()
    @Type(() => GuestInfoDto)
    guestInfo?: GuestInfoDto;

    @IsArray()
    @IsMongoId({ each: true })
    serviceIds: string[];

    @IsOptional()
    @IsMongoId()
    employeeId?: string;

    @IsOptional()
    @IsBoolean()
    isRandomEmployee?: boolean;

    @IsDateString()
    bookingDate: string;

    @IsString()
    bookingTime: string;

    @IsOptional()
    @IsString()
    customerNote?: string;

    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod;
}
