import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
    CUSTOMER = 'customer',
    ADMIN = 'admin',
    EMPLOYEE = 'employee',
}


export enum MembershipTier {
    BRONZE = 'bronze',
    SILVER = 'silver',
    GOLD = 'gold',
    PLATINUM = 'platinum',
}

export enum AuthProvider {
    ZALO = 'zalo',
    PHONE = 'phone',
    EMAIL = 'email',
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, trim: true })
    fullName: string;

    @Prop({ unique: true, sparse: true, lowercase: true, trim: true })
    email?: string;

    @Prop({ required: true, unique: true })
    phone: string;

    @Prop({ select: false })
    password: string;

    @Prop()
    avatar?: string;

    @Prop({ enum: UserRole, default: UserRole.CUSTOMER })
    role: UserRole;

    @Prop({ enum: AuthProvider, default: AuthProvider.ZALO })
    authProvider: AuthProvider;

    // === Thông tin Zalo ===
    @Prop({ unique: true, sparse: true })
    zaloId?: string;

    @Prop()
    zaloAccessToken?: string;

    @Prop()
    zaloRefreshToken?: string;

    @Prop()
    zaloTokenExpiresAt?: Date;

    //=== Điểm tích lũy ===
    @Prop({ default: 0, min: 0 })
    loyaltyPoints: number;

    @Prop({ enum: MembershipTier, default: MembershipTier.BRONZE })
    membershipTier: MembershipTier;

    //=== Thông tin bổ sung ===
    @Prop()
    dateOfBirth?: Date;

    @Prop({ enum: ['male', 'female', 'other'] })
    gender?: string;

    @Prop()
    address?: string;

    // Ghi chú đặc biệt (dị ứng, da nhạy cảm,...)
    @Prop({ type: [String], default: [] })
    specialNotes: string[];

    //=== Status of Account ===
    @Prop({ default: true })
    isActive: boolean;

    @Prop()
    lastLogin?: Date;

    @Prop({ default: false })
    isPhoneVerified: boolean;

    @Prop()
    phoneVerifiedAt?: Date;

    //=== Referral Program ===
    @Prop({ type: Types.ObjectId, ref: 'User' })
    referredBy?: Types.ObjectId;

    @Prop({ default: 0 })
    totalReferrals: number;

    //=== Guest Conversion Tracking ===
    @Prop({ default: false })
    isConvertedFromGuest: boolean; // user da tung la guest hay khong

    @Prop()
    convertedAt?: Date;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Booking' }], default: [] })
    guestBookingsBeforeConversion: Types.ObjectId[]; // ✨ Các booking khi còn là guest

    // ===== Statistics =====
    @Prop({ default: 0 })
    totalBookings: number; // ✨ Tổng số lần đặt lịch

    @Prop({ default: 0 })
    totalSpent: number; // ✨ Tổng tiền đã chi tiêu

    @Prop()
    lastBookingDate?: Date; // ✨ Lần đặt lịch gần nhất

    @Prop()
    firstBookingDate?: Date; // ✨ Lần đặt lịch đầu tiên
}

export const UserSchema = SchemaFactory.createForClass(User);

//=== Indexes ===
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 }); // ✨ Main identifier
UserSchema.index({ zaloId: 1 });
UserSchema.index({ membershipTier: 1 });
UserSchema.index({ authProvider: 1 });
UserSchema.index({ isConvertedFromGuest: 1 }); // ✨ Track conversions
UserSchema.index({ totalSpent: -1 }); // ✨ Sort by spending

// ===== Methods =====

// Check if user can upgrade tier
UserSchema.methods.checkTierUpgrade = function () {
    const tiers = [
        { tier: MembershipTier.BRONZE, minPoints: 0 },
        { tier: MembershipTier.SILVER, minPoints: 5000 },
        { tier: MembershipTier.GOLD, minPoints: 15000 },
        { tier: MembershipTier.PLATINUM, minPoints: 30000 },
    ];

    for (const t of tiers.reverse()) {
        if (this.loyaltyPoints >= t.minPoints && this.membershipTier !== t.tier) {
            return t.tier;
        }
    }

    return null;
};

// Add loyalty points
UserSchema.methods.addPoints = async function (points: number) {
    this.loyaltyPoints += points;

    // Auto upgrade tier
    const newTier = this.checkTierUpgrade();
    if (newTier) {
        this.membershipTier = newTier;
    }

    return this.save();
};

// Use loyalty points
UserSchema.methods.usePoints = async function (points: number) {
    if (this.loyaltyPoints < points) {
        throw new Error('Insufficient points');
    }

    this.loyaltyPoints -= points;
    return this.save();
};
