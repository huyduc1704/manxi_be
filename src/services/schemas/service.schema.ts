import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ServiceDocument = Service & Document;

export enum ServiceStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    COMING_SOON = 'coming_soon',
    OUT_OF_STOCK = 'out_of_stock',
}

@Schema({ timestamps: true })
export class Service {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ type: String })
    shortDescription?: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'ServiceCategory',
        required: true,
        index: true
    })
    category: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ServiceCategory' })
    subcategory?: Types.ObjectId;

    @Prop({ type: [String], default: [], index: true })
    tags: string[];

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop({ min: 0 })
    originalPrice?: number;

    @Prop({ min: 0, max: 100 })
    discountPercent?: number;

    @Prop({ min: 0 })
    discountPrice?: number;

    @Prop({ required: true, min: 15 })
    duration: number;

    @Prop({ min: 0 })
    preparationTime?: number;

    @Prop({ type: [String], default: [] })
    images: string[];

    @Prop()
    thumbnail?: string;

    @Prop()
    videoUrl?: string;

    @Prop({ enum: ServiceStatus, default: ServiceStatus.ACTIVE, index: true })
    status: ServiceStatus;

    @Prop({ default: false })
    isFeatured: boolean;

    @Prop({ default: false })
    isPopular: boolean;

    @Prop({ default: false })
    isNewArrival: boolean;

    @Prop({ default: 0 })
    displayOrder: number;

    @Prop({ unique: true, sparse: true })
    slug?: string;

    @Prop({ default: 0, min: 0 })
    pointsReward: number;

    @Prop({ default: 0, min: 0 })
    pointsRequired?: number;

    @Prop({ type: [String], default: [] })
    requirements: string[];

    @Prop({ type: [String], default: [] })
    benefits: string[];

    @Prop({ type: [String], default: [] })
    includes: string[];

    @Prop({ default: true })
    allowOnlineBooking: boolean;

    @Prop({ default: 1, min: 1 })
    maxBookingsPerDay?: number;

    @Prop({ default: 0 })
    advanceBookingDays?: number;

    @Prop({ default: 0 })
    totalBookings: number;

    @Prop({ default: 0 })
    completedBookings: number;

    @Prop({ default: 0 })
    viewCount: number;

    @Prop({ default: 0, min: 0, max: 5 })
    averageRating: number;

    @Prop({ default: 0 })
    totalReviews: number;

    @Prop()
    metaTitle?: string;

    @Prop()
    metaDescription?: string;

    @Prop({ type: [String], default: [] })
    metaKeywords: string[];
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

// Indexes
ServiceSchema.index({ category: 1, status: 1 });
ServiceSchema.index({ subcategory: 1 });
ServiceSchema.index({ tags: 1 });
ServiceSchema.index({ slug: 1 });
ServiceSchema.index({ isFeatured: -1, displayOrder: 1 });
ServiceSchema.index({ isPopular: -1, totalBookings: -1 });
ServiceSchema.index({ averageRating: -1 });
ServiceSchema.index({ price: 1 });
ServiceSchema.index({ name: 'text', description: 'text' });

// Pre-save:  Generate slug & calculate prices
ServiceSchema.pre('save', async function () {
    if (!this.slug && this.name) {
        let slug = this.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        let counter = 1;
        let uniqueSlug = slug;

        while (await this.model('Service').findOne({
            slug: uniqueSlug,
            _id: { $ne: this._id }
        })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        this.slug = uniqueSlug;
    }

    if (this.discountPercent && this.price) {
        this.discountPrice = Math.round(this.price * (1 - this.discountPercent / 100));
    } else if (this.originalPrice && this.price) {
        this.discountPercent = Math.round(
            ((this.originalPrice - this.price) / this.originalPrice) * 100
        );
    }
});

// Methods
ServiceSchema.methods.incrementView = async function () {
    this.viewCount += 1;
    return this.save();
};

ServiceSchema.methods.updateRating = async function (newRating: number) {
    const totalRatings = this.averageRating * this.totalReviews;
    this.totalReviews += 1;
    this.averageRating = (totalRatings + newRating) / this.totalReviews;
    return this.save();
};

ServiceSchema.methods.incrementBooking = async function (completed: boolean = false) {
    this.totalBookings += 1;
    if (completed) {
        this.completedBookings += 1;
    }
    return this.save();
};