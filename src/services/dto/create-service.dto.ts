import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    Max
} from 'class-validator'
import { ServiceStatus } from '../schemas/service.schema';

export class CreateServiceDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    shortDescription?: string;

    @IsNotEmpty()
    @IsMongoId()
    category: string;

    @IsOptional()
    @IsMongoId()
    subcategory?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    originalPrice?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    @Type(() => Number)
    discountPercent?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    discountPrice?: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(15)
    @Type(() => Number)
    duration: number; // in minutes

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    preparationTime?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsString()
    thumbnail?: string;

    @IsOptional()
    @IsString()
    videoUrl?: string;

    @IsOptional()
    @IsEnum(ServiceStatus)
    status?: ServiceStatus;

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @IsOptional()
    @IsBoolean()
    isPopular?: boolean;

    @IsOptional()
    @IsBoolean()
    isNewArrival?: boolean;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    displayOrder?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    pointsReward?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    pointsRequired?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    requirements?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    benefits?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    includes?: string[];

    @IsOptional()
    @IsBoolean()
    allowOnlineBooking?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    maxBookingsPerDay?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    advanceBookingDays?: number;

    @IsOptional()
    @IsString()
    metaTitle?: string;

    @IsOptional()
    @IsString()
    metaDescription?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    metaKeywords?: string[];
}
