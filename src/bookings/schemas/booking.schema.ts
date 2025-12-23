import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

export enum BookingType {
    GUEST = 'guest',     // Khách không đăng nhập
    MEMBER = 'member',   // Khách đã đăng nhập
}

export enum BookingStatus {
    PENDING = 'pending',           // Chờ xác nhận (guest booking sau khi gửi OTP)
    CONFIRMED = 'confirmed',       // Đã xác nhận
    CHECKED_IN = 'checked_in',     // Đã check-in
    IN_PROGRESS = 'in_progress',   // Đang thực hiện
    COMPLETED = 'completed',       // Hoàn thành
    CANCELLED = 'cancelled',       // Đã hủy
    NO_SHOW = 'no_show',           // Không đến
    REFUNDED = 'refunded',         // Đã hoàn tiền
}

export enum PaymentStatus {
    UNPAID = 'unpaid',
    DEPOSIT = 'deposit',               // Đã đặt cọc
    PAID = 'paid',
    PARTIALLY_REFUNDED = 'partially_refunded',
    REFUNDED = 'refunded',
}

export enum PaymentMethod {
    CASH = 'cash',
    CARD = 'card',
    BANK_TRANSFER = 'bank_transfer',
    ZALOPAY = 'zalopay',
    MOMO = 'momo',
    VNPAY = 'vnpay',
}

@Schema({ timestamps: true })
export class Booking {
    // ===== Booking Code (Human-readable) =====
    @Prop({ required: true, unique: true, index: true })
    bookingCode: string; // "BK20250122001"

    // ===== Guest vs Member =====
    @Prop({ enum: BookingType, required: true, index: true })
    bookingType: BookingType;

    // Member booking:  có userId
    @Prop({ type: Types.ObjectId, ref: 'User', index: true })
    customer?: Types.ObjectId;

    // Guest booking: lưu thông tin trực tiếp
    @Prop({
        type: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            email: String,
        }
    })
    guestInfo?: {
        fullName: string;
        phone: string;
        email?: string;
    };

    // ===== OTP Verification (cho guest) =====
    @Prop({ select: false }) // Không trả về khi query
    otpCode?: string;

    @Prop()
    otpExpiredAt?: Date;

    @Prop({ default: false })
    isOtpVerified: boolean;

    @Prop()
    otpVerifiedAt?: Date;

    @Prop({ default: 0 })
    otpAttempts: number; // Số lần nhập OTP sai

    // ===== Services =====
    @Prop({
        type: [{ type: Types.ObjectId, ref: 'Service' }],
        required: true,
        validate: {
            validator: function (v: any[]) {
                return v && v.length > 0;
            },
            message: 'Phải chọn ít nhất 1 dịch vụ'
        }
    })
    services: Types.ObjectId[];

    // ===== Employee =====
    @Prop({ type: Types.ObjectId, ref: 'Employee' })
    employee?: Types.ObjectId;

    @Prop({ default: false })
    isRandomEmployee: boolean; // Khách không chọn nhân viên cụ thể

    // ===== Timing =====
    @Prop({ required: true, index: true })
    bookingDate: Date; // Ngày đặt

    @Prop({ required: true })
    bookingTime: string; // "14:30"

    @Prop({ required: true, min: 15 })
    estimatedDuration: number; // Tổng thời gian dự kiến (phút)

    @Prop()
    actualStartTime?: Date;

    @Prop()
    actualEndTime?: Date;

    // ===== Status =====
    @Prop({ enum: BookingStatus, default: BookingStatus.PENDING, index: true })
    status: BookingStatus;

    @Prop({
        type: [{
            status: { type: String, enum: Object.values(BookingStatus) },
            timestamp: { type: Date, default: Date.now },
            note: String,
            updatedBy: { type: Types.ObjectId, ref: 'User' }
        }],
        default: []
    })
    statusHistory: Array<{
        status: BookingStatus;
        timestamp: Date;
        note?: string;
        updatedBy?: Types.ObjectId;
    }>;

    // ===== Payment =====
    @Prop({ required: true, min: 0 })
    totalAmount: number;

    @Prop({ default: 0, min: 0 })
    discountAmount: number;

    @Prop({ required: true, min: 0 })
    finalAmount: number; // totalAmount - discountAmount

    @Prop({ enum: PaymentStatus, default: PaymentStatus.UNPAID, index: true })
    paymentStatus: PaymentStatus;

    @Prop({ enum: PaymentMethod })
    paymentMethod?: PaymentMethod;

    @Prop()
    paidAt?: Date;

    @Prop({ default: 0 })
    depositAmount?: number;

    @Prop()
    depositPaidAt?: Date;

    // ===== Voucher =====
    @Prop({ type: Types.ObjectId, ref: 'Voucher' })
    appliedVoucher?: Types.ObjectId;

    // ===== Loyalty Points =====
    @Prop({ default: 0 })
    pointsUsed: number; // Điểm đã dùng để giảm giá

    @Prop({ default: 0 })
    pointsEarned: number; // Điểm sẽ nhận khi completed

    @Prop({ default: false })
    pointsAwarded: boolean; // Đã cộng điểm chưa

    // ===== Notes =====
    @Prop()
    customerNote?: string;

    @Prop()
    internalNote?: string; // Ghi chú nội bộ

    // ===== Zalo Integration =====
    @Prop({ default: false })
    isZaloConfirmed: boolean;

    @Prop()
    zaloOaMessageId?: string;

    @Prop()
    zaloOaSentAt?: Date;

    // ===== Reminders =====
    @Prop({ default: false })
    reminderSent: boolean;

    @Prop()
    reminderSentAt?: Date;

    @Prop({ default: false })
    followUpSent: boolean; // Tin nhắn sau khi hoàn thành

    // ===== Cancellation =====
    @Prop()
    cancellationReason?: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    cancelledBy?: Types.ObjectId;

    @Prop()
    cancelledAt?: Date;

    @Prop({ default: 0 })
    cancellationFee?: number;

    // ===== Guest → Member Conversion =====
    @Prop({ default: false })
    convertedToMember: boolean;

    @Prop()
    convertedAt?: Date;

    // ===== QR Code Check-in =====
    @Prop()
    qrCode?: string;

    @Prop()
    checkedInAt?: Date;

    // ===== Source Tracking =====
    @Prop({ default: 'web' })
    bookingSource?: string; // "web", "mobile_app", "facebook", "zalo"

    @Prop()
    referralSource?: string; // UTM source

    @Prop()
    ipAddress?: string;

    @Prop()
    userAgent?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// ===== Indexes =====
BookingSchema.index({ bookingCode: 1 });
BookingSchema.index({ bookingType: 1 });
BookingSchema.index({ customer: 1, bookingDate: -1 });
BookingSchema.index({ 'guestInfo.phone': 1 });
BookingSchema.index({ employee: 1, bookingDate: 1 });
BookingSchema.index({ status: 1, bookingDate: 1 });
BookingSchema.index({ paymentStatus: 1 });
BookingSchema.index({ bookingDate: 1, bookingTime: 1 });
BookingSchema.index({ createdAt: -1 });

// ===== Pre-save Hook:  Generate booking code =====
BookingSchema.pre('save', async function () {
    // Generate booking code
    if (!this.bookingCode) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.bookingCode = `BK${dateStr}${random}`;
    }

    // Add status to history if changed
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
        });
    }

    // Generate OTP if guest booking and not verified
    if (this.bookingType === BookingType.GUEST && !this.isOtpVerified && !this.otpCode) {
        this.otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        this.otpExpiredAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    }
});

// ===== Methods =====
BookingSchema.methods.canCancel = function (): { allowed: boolean; reason?: string } {
    if (this.status === BookingStatus.COMPLETED) {
        return { allowed: false, reason: 'Booking đã hoàn thành' };
    }

    if (this.status === BookingStatus.CANCELLED) {
        return { allowed: false, reason: 'Booking đã bị hủy' };
    }

    if (this.status === BookingStatus.IN_PROGRESS) {
        return { allowed: false, reason: 'Booking đang thực hiện' };
    }

    // Check deadline (VD: phải hủy trước 24h)
    const bookingDateTime = new Date(`${this.bookingDate.toISOString().split('T')[0]} ${this.bookingTime}`);
    const hoursUntilBooking = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilBooking < 24) {
        return { allowed: false, reason: 'Phải hủy trước 24 giờ' };
    }

    return { allowed: true };
};

BookingSchema.methods.calculateCancellationFee = function (): number {
    const bookingDateTime = new Date(`${this.bookingDate.toISOString().split('T')[0]} ${this.bookingTime}`);
    const hoursUntilBooking = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    // Hủy trước > 48h:  free
    if (hoursUntilBooking > 48) {
        return 0;
    }

    // Hủy 24-48h: 30% phí
    if (hoursUntilBooking > 24) {
        return Math.round(this.finalAmount * 0.3);
    }

    // Hủy < 24h: 50% phí
    return Math.round(this.finalAmount * 0.5);
};

BookingSchema.methods.getCustomerPhone = function (): string {
    return this.guestInfo?.phone || '';
};

BookingSchema.methods.getCustomerName = function (): string {
    return this.guestInfo?.fullName || '';
};

BookingSchema.methods.verifyOtp = function (inputOtp: string): boolean {
    if (!this.otpCode) return false;
    if (new Date() > this.otpExpiredAt!) return false;

    this.otpAttempts += 1;

    if (this.otpCode === inputOtp) {
        this.isOtpVerified = true;
        this.otpVerifiedAt = new Date();
        this.status = BookingStatus.CONFIRMED;
        return true;
    }

    return false;
};