import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

export enum ReviewStatus {
    PENDING = 'pending',     // Chờ duyệt
    APPROVED = 'approved',   // Đã duyệt
    REJECTED = 'rejected',   // Từ chối
    HIDDEN = 'hidden',       // Ẩn
}

@Schema({ timestamps: true })
export class Review {
    // ===== Khách hàng =====
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    customer: Types.ObjectId;

    // ===== Booking liên quan =====
    @Prop({ type: Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true })
    booking: Types.ObjectId;

    // ===== Đánh giá dịch vụ =====
    @Prop({ type: Types.ObjectId, ref: 'Service', required: true, index: true })
    service: Types.ObjectId;

    // ===== Đánh giá nhân viên =====
    @Prop({ type: Types.ObjectId, ref: 'Employee', index: true })
    employee?: Types.ObjectId;

    // ===== Điểm đánh giá (1-5 sao) =====
    @Prop({ required: true, min: 1, max: 5 })
    rating: number;

    // ===== Đánh giá chi tiết =====
    @Prop({ min: 1, max: 5 })
    serviceQuality?: number;

    @Prop({ min: 1, max: 5 })
    staffAttitude?: number;

    @Prop({ min: 1, max: 5 })
    cleanliness?: number;

    @Prop({ min: 1, max: 5 })
    valueForMoney?: number;

    @Prop({ min: 1, max: 5 })
    ambiance?: number;

    // ===== Nội dung =====
    @Prop()
    title?: string;

    @Prop()
    comment?: string;

    // ===== Hình ảnh đính kèm =====
    @Prop({ type: [String], default: [] })
    images: string[];

    // ===== Trạng thái =====
    @Prop({ enum: ReviewStatus, default: ReviewStatus.PENDING, index: true })
    status: ReviewStatus;

    @Prop({ default: false })
    isFeatured: boolean;

    @Prop({ default: false })
    isVerifiedPurchase: boolean;

    // ===== Phản hồi từ Spa =====
    @Prop()
    replyContent?: string;

    @Prop()
    repliedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    repliedBy?: Types.ObjectId;

    // ===== Hữu ích =====
    @Prop({ default: 0 })
    helpfulCount: number;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    helpfulBy: Types.ObjectId[];

    @Prop({ default: 0 })
    reportCount: number;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    reportedBy: Types.ObjectId[];

    // ===== Admin actions =====
    @Prop()
    rejectionReason?: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    reviewedBy?: Types.ObjectId;

    @Prop()
    reviewedAt?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// ===== Indexes =====
ReviewSchema.index({ service: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ employee: 1, rating: -1 });
ReviewSchema.index({ customer: 1 });
ReviewSchema.index({ booking: 1 }, { unique: true });
ReviewSchema.index({ isFeatured: -1, helpfulCount: -1 });
ReviewSchema.index({ rating: -1 });

// ===== Methods (chỉ thao tác với review document) =====
ReviewSchema.methods.approve = async function (adminId: Types.ObjectId) {
    this.status = ReviewStatus.APPROVED;
    this.reviewedBy = adminId;
    this.reviewedAt = new Date();
    this.isVerifiedPurchase = true;
    return this.save();
};

ReviewSchema.methods.reject = async function (adminId: Types.ObjectId, reason: string) {
    this.status = ReviewStatus.REJECTED;
    this.rejectionReason = reason;
    this.reviewedBy = adminId;
    this.reviewedAt = new Date();
    return this.save();
};

ReviewSchema.methods.addReply = async function (content: string, adminId: Types.ObjectId) {
    this.replyContent = content;
    this.repliedBy = adminId;
    this.repliedAt = new Date();
    return this.save();
};

ReviewSchema.methods.markHelpful = async function (userId: Types.ObjectId) {
    if (!this.helpfulBy.includes(userId)) {
        this.helpfulBy.push(userId);
        this.helpfulCount += 1;
    }
    return this.save();
};

ReviewSchema.methods.report = async function (userId: Types.ObjectId) {
    if (!this.reportedBy.includes(userId)) {
        this.reportedBy.push(userId);
        this.reportCount += 1;
    }
    return this.save();
};
