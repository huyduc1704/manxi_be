import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ServiceCategoryDocument = ServiceCategory & Document;

@Schema({ timestamps: true })
export class ServiceCategory {
    @Prop({ required: true, trim: true, unique: true })
    name: string;

    @Prop({ unique: true })
    slug: string;

    @Prop()
    description?: string;

    @Prop()
    icon?: string; //url hoac icon name

    @Prop()
    thumbnail?: string;

    @Prop()
    color?: string;

    @Prop({ default: 0 })
    displayOrder: number;

    @Prop({ default: true })
    isActive: boolean;

    // ===== Parent Category (nếu có subcategory) =====
    @Prop({ type: Types.ObjectId, ref: 'ServiceCategory' })
    parentCategory?: Types.ObjectId;

    // ===== Statistics =====
    @Prop({ default: 0 })
    totalServices: number; // Số dịch vụ trong category

    @Prop({ default: 0 })
    totalBookings: number;

    // ===== SEO =====
    @Prop()
    metaTitle?: string;

    @Prop()
    metaDescription?: string;
}

export const ServiceCategorySchema = SchemaFactory.createForClass(ServiceCategory);

// ===== Indexes =====
ServiceCategorySchema.index({ slug: 1 });
ServiceCategorySchema.index({ isActive: 1, displayOrder: 1 });
ServiceCategorySchema.index({ parentCategory: 1 });

// ===== Pre-save:   Generate slug =====
ServiceCategorySchema.pre('save', async function () {
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

        // Check duplicate & add suffix
        let counter = 1;
        let uniqueSlug = slug;

        while (await this.model('ServiceCategory').findOne({
            slug: uniqueSlug,
            _id: { $ne: this._id } // Exclude current document
        })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        this.slug = uniqueSlug;
    }
});
