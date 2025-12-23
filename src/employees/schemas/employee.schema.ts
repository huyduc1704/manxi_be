import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmployeeDocument = Employee & Document;

export enum EmployeeStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ON_LEAVE = 'on_leave',
    BUSY = 'busy',
}

@Schema({ timestamps: true })
export class Employee {
    // ===== Basic Info =====
    @Prop({ required: true, trim: true })
    fullName: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true, unique: true })
    phone: string;

    @Prop()
    avatar?: string;

    // ===== Position (Reference thay vì Enum) =====
    @Prop({
        type: Types.ObjectId,
        ref: 'EmployeePosition',
        required: true,
        index: true
    })
    position: Types.ObjectId;

    @Prop({ enum: EmployeeStatus, default: EmployeeStatus.ACTIVE, index: true })
    status: EmployeeStatus;

    // ===== Professional Info =====
    @Prop({ type: [{ type: Types.ObjectId, ref: 'Service' }], default: [] })
    specializedServices: Types.ObjectId[];

    @Prop()
    bio?: string;

    @Prop({ default: 0, min: 0 })
    experienceYears: number;

    @Prop({ type: [String], default: [] })
    certifications: string[];

    @Prop({ type: [String], default: [] })
    skills: string[];

    @Prop({ type: [String], default: [] })
    languages: string[];

    // ===== Working Schedule =====
    @Prop({
        type: {
            monday: { type: Boolean, default: true },
            tuesday: { type: Boolean, default: true },
            wednesday: { type: Boolean, default: true },
            thursday: { type: Boolean, default: true },
            friday: { type: Boolean, default: true },
            saturday: { type: Boolean, default: true },
            sunday: { type: Boolean, default: false },
        },
        default: {},
    })
    workingDays: {
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
        sunday: boolean;
    };

    @Prop({ default: '08:00' })
    workingHoursStart: string;

    @Prop({ default: '18:00' })
    workingHoursEnd: string;

    @Prop({ type: [String], default: [] })
    breakTimes: string[];

    // ===== Rating & Reviews =====
    @Prop({ default: 5, min: 0, max: 5 })
    averageRating: number;

    @Prop({ default: 0 })
    totalReviews: number;

    @Prop({
        type: {
            serviceQuality: { type: Number, default: 5 },
            attitude: { type: Number, default: 5 },
            professionalism: { type: Number, default: 5 },
            communication: { type: Number, default: 5 },
        },
        default: {},
    })
    ratingBreakdown: {
        serviceQuality: number;
        attitude: number;
        professionalism: number;
        communication: number;
    };

    // ===== Statistics =====
    @Prop({ default: 0 })
    totalBookings: number;

    @Prop({ default: 0 })
    completedBookings: number;

    @Prop({ default: 0 })
    cancelledBookings: number;

    @Prop({ default: 0 })
    totalRevenue: number;

    @Prop()
    lastBookingDate?: Date;

    // ===== Commission & Salary =====
    @Prop({ default: 0, min: 0, max: 100 })
    commissionRate?: number;

    @Prop({ default: 0 })
    monthlySalary?: number;

    // ===== Display =====
    @Prop({ default: 0 })
    displayOrder: number;

    @Prop({ default: false })
    isFeatured: boolean;

    @Prop({ unique: true, sparse: true })
    slug?: string;

    // ===== Link to User Account =====
    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId?: Types.ObjectId;

    // ===== Leave Management =====
    @Prop({ type: [Date], default: [] })
    leaveDates: Date[];

    @Prop()
    leaveNote?: string;

    // ===== Employment Info =====
    @Prop()
    hireDate?: Date;

    @Prop()
    contractEndDate?: Date;

    @Prop()
    emergencyContact?: string;

    @Prop()
    address?: string;

    @Prop()
    idCardNumber?: string;

    @Prop()
    taxCode?: string;

    @Prop()
    bankAccount?: string;

    @Prop()
    bankName?: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// ===== Indexes =====
EmployeeSchema.index({ position: 1, status: 1 });
EmployeeSchema.index({ averageRating: -1 });
EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ phone: 1 });
EmployeeSchema.index({ isFeatured: -1, displayOrder: 1 });
EmployeeSchema.index({ slug: 1 });

// ===== Pre-save: Generate slug =====
EmployeeSchema.pre('save', async function () {
    if (!this.slug && this.fullName) {
        let slug = this.fullName
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

        while (await this.model('Employee').findOne({
            slug: uniqueSlug,
            _id: { $ne: this._id }
        })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        this.slug = uniqueSlug;
    }
});

// ===== Methods =====
EmployeeSchema.methods.isAvailableOn = function (date: Date): boolean {
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];

    if (!this.workingDays[dayName]) {
        return false;
    }

    const dateStr = date.toISOString().split('T')[0];
    const isOnLeave = this.leaveDates.some(
        d => d.toISOString().split('T')[0] === dateStr
    );

    return !isOnLeave && this.status === EmployeeStatus.ACTIVE;
};

EmployeeSchema.methods.updateRating = async function (ratings: {
    overall: number;
    serviceQuality?: number;
    attitude?: number;
    professionalism?: number;
    communication?: number;
}) {
    const totalRatings = this.averageRating * this.totalReviews;
    this.totalReviews += 1;
    this.averageRating = (totalRatings + ratings.overall) / this.totalReviews;

    if (ratings.serviceQuality) {
        this.ratingBreakdown.serviceQuality =
            (this.ratingBreakdown.serviceQuality * (this.totalReviews - 1) + ratings.serviceQuality) / this.totalReviews;
    }
    if (ratings.attitude) {
        this.ratingBreakdown.attitude =
            (this.ratingBreakdown.attitude * (this.totalReviews - 1) + ratings.attitude) / this.totalReviews;
    }
    if (ratings.professionalism) {
        this.ratingBreakdown.professionalism =
            (this.ratingBreakdown.professionalism * (this.totalReviews - 1) + ratings.professionalism) / this.totalReviews;
    }
    if (ratings.communication) {
        this.ratingBreakdown.communication =
            (this.ratingBreakdown.communication * (this.totalReviews - 1) + ratings.communication) / this.totalReviews;
    }

    return this.save();
};

EmployeeSchema.methods.incrementBooking = async function (completed: boolean = false, revenue: number = 0) {
    this.totalBookings += 1;
    if (completed) {
        this.completedBookings += 1;
        this.totalRevenue += revenue;
        this.lastBookingDate = new Date();
    }
    return this.save();
};

EmployeeSchema.methods.addLeaveDate = async function (date: Date, note?: string) {
    this.leaveDates.push(date);
    if (note) {
        this.leaveNote = note;
    }
    return this.save();
};

EmployeeSchema.methods.removeLeaveDate = async function (date: Date) {
    this.leaveDates = this.leaveDates.filter(
        d => d.toISOString().split('T')[0] !== date.toISOString().split('T')[0]
    );
    return this.save();
};

// ===== Post-save: Update position statistics =====
EmployeeSchema.post('save', async function () {
    if (this.isNew) {
        await this.model('EmployeePosition').updateOne(
            { _id: this.position },
            { $inc: { totalEmployees: 1 } }
        );
    }
});

// ✅ Sửa:  Dùng deleteOne thay vì remove
EmployeeSchema.post('deleteOne', { document: true, query: false }, async function () {
    await this.model('EmployeePosition').updateOne(
        { _id: this.position },
        { $inc: { totalEmployees: -1 } }
    );
});

// ✅ Thêm:  Xử lý cho findOneAndDelete
EmployeeSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await this.model.db.model('EmployeePosition').updateOne(
            { _id: doc.position },
            { $inc: { totalEmployees: -1 } }
        );
    }
});