import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service } from './services/schemas/service.schema';
import { ServiceCategory } from './service-categories/schemas/service-category.schema';
import { User, UserRole, AuthProvider } from './users/schemas/user.schema';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const serviceModel = app.get<Model<Service>>(getModelToken(Service.name));
    const categoryModel = app.get<Model<ServiceCategory>>(getModelToken(ServiceCategory.name));
    const userModel = app.get<Model<User>>(getModelToken(User.name));

    console.log('🌱 Seeding data...');

    // 1. Create Categories
    console.log('Creating Categories...');
    await categoryModel.deleteMany({}); // Clean old data
    await serviceModel.deleteMany({});  // Clean old services

    // Category 1: Chăm sóc tóc & Da đầu
    const catHairCare = await categoryModel.create({
        name: 'Chăm sóc tóc & Da đầu',
        slug: 'cham-soc-toc-da-dau',
        description: 'Các gói gội đầu thảo dược thư giãn, làm sạch sâu và massage nhẹ nhàng vùng đầu cổ.',
        icon: 'feather',
        thumbnail: '/images/categories/hair-care.jpg',
        color: '#A8C5B5',
        displayOrder: 1,
        isActive: true,
        totalServices: 5,
        metaTitle: 'Dịch vụ gội đầu dưỡng sinh thảo dược - Manxi Spa',
        metaDescription: 'Gội đầu thư giãn, trị liệu da đầu với thảo dược thiên nhiên tại Manxi Spa.'
    });

    // Category 2: Thư giãn toàn thân
    const catBodyRelax = await categoryModel.create({
        name: 'Thư giãn toàn thân',
        slug: 'thu-gian-toan-than',
        description: 'Kết hợp giữa gội dưỡng sinh và massage trị liệu body chuyên sâu, đả thông kinh lạc.',
        icon: 'leaf',
        thumbnail: '/images/categories/body-relax.jpg',
        color: '#E6CBA8',
        displayOrder: 2,
        isActive: true,
        totalServices: 2,
        metaTitle: 'Massage body và dưỡng sinh toàn thân - Manxi Spa',
        metaDescription: 'Liệu trình thư giãn toàn thân, giảm đau mỏi vai gáy và thắt lưng.'
    });

    // Category 3: Trọn gói (Combo Trị Liệu)
    const catCombo = await categoryModel.create({
        name: 'Trọn gói (Combo Trị Liệu)',
        slug: 'tron-goi-combo-tri-lieu',
        description: 'Các gói Signature độc quyền kết hợp công nghệ cao (Giường AI) và y học cổ truyền.',
        icon: 'sparkles',
        thumbnail: '/images/categories/full-package.jpg',
        color: '#D4A373',
        displayOrder: 3,
        isActive: true,
        totalServices: 3,
        metaTitle: 'Combo trị liệu chuyên sâu Manxi Spa - Giường AI & Đá nóng',
        metaDescription: 'Trải nghiệm các gói combo Hoàng Gia, Quý Tộc với dịch vụ chăm sóc sức khỏe toàn diện.'
    });

    console.log(`✅ Created Categories`);

    // 2. Create Services
    console.log('Creating Services...');

    // --- Services for Category 'Chăm sóc tóc & Da đầu' ---
    await serviceModel.create([
        {
            name: 'Gội đầu thư giãn',
            description: 'Tẩy trang, rửa mặt, massage mặt.',
            category: catHairCare._id,
            price: 99000,
            duration: 30, // Estimated
            status: 'active'
        },
        {
            name: 'Gội đầu dưỡng sinh vai - cổ - gáy',
            description: 'Gội đầu thảo dược kết hợp massage vai cổ gáy giảm đau mỏi.',
            category: catHairCare._id,
            price: 199000,
            duration: 60,
            status: 'active'
        },
        {
            name: 'Gội đầu dưỡng sinh body - vai, cổ, gáy',
            description: 'Liệu trình gội đầu kết hợp massage trị liệu vùng vai, cổ, gáy.',
            category: catHairCare._id,
            price: 249000,
            duration: 75,
            status: 'active'
        },
        {
            name: 'Gội đầu dưỡng sinh body chân - tay - lưng chuyên sâu (120p)',
            description: 'Chăm sóc toàn diện từ đầu đến chân, tập trung vùng lưng và chân tay.',
            category: catHairCare._id,
            price: 399000,
            duration: 120,
            status: 'active'
        },
        {
            name: 'Gội đầu dưỡng sinh body chân - tay - lưng chuyên sâu (150p)',
            description: 'Gói chăm sóc cao cấp nhất với thời gian kéo dài để thư giãn sâu.',
            category: catHairCare._id,
            price: 499000,
            duration: 150,
            status: 'active'
        }
    ]);

    // --- Services for Category 'Thư giãn toàn thân' ---
    await serviceModel.create([
        {
            name: 'Gói DƯỠNG SINH MAXI',
            description: `1. Tìm bì mặt tai, làm sạch tai, massage huyệt tai
2. Massage tai bằng đá nóng
3. Thảo dược ấm bụng
4. Liệu pháp âm thanh thiên thần sâu năng lượng
5. Massage mặt
6. Chườm nóng mắt
7. Massage đầu bằng đá ngọc
8. Massage vai cổ tay
9. Gội đầu dưỡng sinh
10. Massage đầu, dưỡng tóc, xông hơi thảo dược
11. SPA vai cổ đầu
12. Sấy khô tóc`,
            category: catBodyRelax._id,
            price: 280000,
            duration: 90,
            status: 'active'
        },
        {
            name: 'Gói Giảm STRESS MAXI',
            description: `1-1. Tìm bì mặt tai, làm sạch tai, massage huyệt tai (hoặc chọn Massage mặt)
2. Massage tai bằng đá nóng
3. Thảo dược ấm bụng
4. Liệu pháp âm thanh thiên thần sâu năng lượng
5. Chườm nóng mắt
6. Massage đầu bằng đá ngọc
7. Massage vai cổ tay
8. Gội đầu dưỡng sinh
9. Massage đầu, dưỡng tóc, xông hơi thảo dược
10. SPA vai cổ đầu
11. Sấy khô tóc`,
            category: catBodyRelax._id,
            price: 220000,
            duration: 70,
            status: 'active'
        }
    ]);

    // --- Services for Category 'Trọn gói (Combo Trị Liệu)' ---
    await serviceModel.create([
        {
            name: 'Gói CHÚA TỂ MANXI',
            description: `1. Ngâm chân bằng thảo dược, massage chân, cắt móng tay chân
2. Thảo dược ấm bụng
3. Liệu pháp âm thanh thiên thần sâu năng lượng
4. Tìm bì mặt tai, làm sạch tai, massage huyệt tai
5. Massage tai bằng đá nóng
6. Trẻ hóa và căng da mặt
7. Đắp mặt nạ nóng
8. Massage đầu bằng đá ngọc
9. Massage vai cổ tay
10. Gội đầu dưỡng sinh
11. Massage đầu, dưỡng tóc, xông hơi thảo dược
12. SPA vai, cổ và đầu
13. Sấy khô tóc`,
            category: catCombo._id,
            price: 480000,
            duration: 120,
            status: 'active'
        },
        {
            name: 'Gói QUÝ TỘC MANXI',
            description: `1. Giường AI massage toàn thân
2. Ngâm chân bằng thảo dược, massage chân, cắt móng tay chân
3. Thảo dược ấm bụng
4. Liệu pháp âm thanh thiên thần sâu năng lượng
5. Tìm bì mặt tai, làm sạch tai, massage huyệt tai
6. Massage mặt...
... (và các bước chăm sóc chuyên sâu khác)`,
            category: catCombo._id,
            price: 360000,
            duration: 120,
            status: 'active'
        },
        {
            name: 'Gói HOÀNG GIA MANXI',
            description: `1. Ngâm chân bằng thảo dược, massage chân...
2. Liệu pháp tinh dầu bảy luân xa Ayurveda
3. Liệu pháp nhiệt đá đen năng lượng núi lửa
4. Thảo dược ấm bụng
... (Gói cao cấp nhất với 14 bước chăm sóc toàn diện)`,
            category: catCombo._id,
            price: 900000,
            duration: 150,
            status: 'active'
        }
    ]);

    console.log(`✅ Created Services from Menu`);

    // 3. Create Test Users (Preserve if needed)
    const existingAdmin = await userModel.findOne({ email: 'admin@manxi.com' });
    if (!existingAdmin) {
        await userModel.create({
            fullName: 'Admin User',
            email: 'admin@manxi.com',
            phone: '0909999888',
            password: '123456',
            zaloId: 'ADMIN_01',
            authProvider: AuthProvider.EMAIL,
            role: UserRole.ADMIN
        });
        console.log('✅ Created Admin User');
    }

    console.log('🎉 Seeding successfully completed!');
    await app.close();
    process.exit(0);
}

bootstrap();
