import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    MinLength,
    IsDateString,
    Min,
    IsPhoneNumber,
} from 'class-validator';

export enum UserRole {
    ADMIN = 'admin',
    STAFF = 'staff',
    CUSTOMER = 'customer',
}

export enum MembershipTier {
    BRONZE = 'bronze',
    SILVER = 'silver',
    GOLD = 'gold',
    PLATINUM = 'platinum',
}

export enum UserGender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

export class CreateUserDto {
    @IsString()
    @MinLength(2)
    fullName: string;

    @IsPhoneNumber('VN')
    phone: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsEnum(UserGender)
    gender?: UserGender;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsString()
    zaloId?: string;

    @IsOptional()
    @IsString()
    provider?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsEnum(MembershipTier)
    membershipTier?: MembershipTier;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean; //default true
}