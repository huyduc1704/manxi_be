import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmployeePositionDocument = EmployeePosition & Document;

export enum PositionLevel {
    ENTRY = 'entry',           // Mới vào
    JUNIOR = 'junior',         // Sơ cấp
    SENIOR = 'senior',         // Cao cấp
    LEAD = 'lead',             // Trưởng nhóm
    MANAGER = 'manager',       // Quản lý
}

@Schema({ timestamps: true })
export class EmployeePosition {
    @Prop({ required: true, trim: true, unique: true })
    name: string; // "Chuyên viên massage", "Lễ tân"

    @Prop({ unique: true, sparse: true })
    slug?: string;

    @Prop()
    description?: string;

    @Prop({ enum: PositionLevel, default: PositionLevel.JUNIOR })
    level: PositionLevel;

    @Prop()
    icon?: string;

    @Prop()
    color?: string;

    @Prop({ default: 0 })
    displayOrder: number;

    @Prop({ default: true })
    isActive: boolean;

    // ===== Salary & Commission =====
    @Prop({ default: 0 })
    baseSalary?: number; // Lương cơ bản mặc định

    @Prop({ default: 0, min: 0, max: 100 })
    defaultCommissionRate?: number; // % hoa hồng mặc định

    // ===== Requirements =====
    @Prop({ type: [String], default: [] })
    requiredSkills: string[]; // Kỹ năng cần có

    @Prop({ type: [String], default: [] })
    requiredCertifications: string[]; // Chứng chỉ cần có

    @Prop({ default: 0 })
    minExperienceYears?: number; // Số năm kinh nghiệm tối thiểu

    // ===== Permissions (nếu cần) =====
    @Prop({ type: [String], default: [] })
    permissions: string[]; // ["view_bookings", "manage_services", "view_reports"]

    // ===== Statistics =====
    @Prop({ default: 0 })
    totalEmployees: number; // Số nhân viên ở vị trí này

    @Prop({ default: 0 })
    averageSalary?: number;

    // ===== Benefits =====
    @Prop({ type: [String], default: [] })
    benefits: string[]; // Phúc lợi:  "Bảo hiểm", "Thưởng KPI"
}

export const EmployeePositionSchema = SchemaFactory.createForClass(EmployeePosition);

// ===== Indexes =====
EmployeePositionSchema.index({ slug: 1 });
EmployeePositionSchema.index({ isActive: 1, displayOrder: 1 });
EmployeePositionSchema.index({ level: 1 });

// ===== Pre-save:  Generate slug =====
EmployeePositionSchema.pre('save', async function () {
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

        while (await this.model('EmployeePosition').findOne({
            slug: uniqueSlug,
            _id: { $ne: this._id }
        })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        this.slug = uniqueSlug;
    }
});
