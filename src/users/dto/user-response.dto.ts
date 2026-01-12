// src/users/dto/user-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { UserRole, MembershipTier, UserGender } from './create-user.dto';

export class UserResponseDto {
    @Expose()
    id: string;

    @Expose()
    fullName: string;

    @Expose()
    phone: string;

    @Expose()
    email?: string;

    @Expose()
    avatar?: string;

    @Expose()
    gender?: UserGender;

    @Expose()
    @Transform(({ obj }) => obj.dateOfBirth ? obj.dateOfBirth.toISOString().split('T')[0] : null)
    dateOfBirth?: string; // 'YYYY-MM-DD' format

    @Expose()
    address?: string;

    @Expose()
    role: UserRole;

    @Expose()
    membershipTier: MembershipTier;

    @Expose()
    loyaltyPoints: number;

    @Expose()
    totalSpent: number;

    @Expose()
    totalBookings: number;

    @Expose()
    @Transform(({ obj }) => obj.lastBookingDate ? obj.lastBookingDate.toISOString() : null)
    lastBookingDate?: string;

    @Expose()
    isActive: boolean;

    @Expose()
    @Transform(({ obj }) => obj.createdAt?.toISOString())
    createdAt?: string;
}