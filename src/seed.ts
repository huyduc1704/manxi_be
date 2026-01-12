import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

    const catPackages = await categoryModel.create({
        name: 'Trọn Gói',
        description: 'Các gói dịch vụ tổng hợp',
        isActive: true,
        displayOrder: 1,
    });

    const catMassage = await categoryModel.create({
        name: 'Massage',
        description: 'Liệu pháp massage thư giãn',
        isActive: true,
        displayOrder: 2,
    });

    const catSkinCare = await categoryModel.create({
        name: 'Chăm Sóc Da',
        description: 'Chăm sóc da mặt chuyên sâu',
        isActive: true,
        displayOrder: 3,
    });

    const catHairCare = await categoryModel.create({
        name: 'Chăm Sóc Tóc',
        description: 'Gội đầu dưỡng sinh và chăm sóc tóc',
        isActive: true,
        displayOrder: 4,
    });

    console.log(`✅ Created Categories: ${catPackages.name}, ${catMassage.name}, ...`);

    // 2. Create Services
    console.log('Creating Services...');
    await serviceModel.deleteMany({});

    // --- Services for Category 'Trọn Gói' ---
    await serviceModel.create({
        name: 'Sả Signature - 3 tiếng 25 phút',
        description: 'Chăm sóc da thư giãn với mỹ phẩm hữu cơ 70 phút.\nMassage toàn thân kết hợp dầu, đá nóng và túi chườm 90 phút.\nGội sấy 45 phút với sản phẩm hữu cơ Oway.',
        category: catPackages._id,
        price: 1880000,
        duration: 205,
        status: 'active'
    });

    await serviceModel.create({
        name: 'Couple - 2 tiếng 25 phút',
        description: 'Gói dịch vụ dành cho cặp đôi bao gồm massage và chăm sóc da cơ bản.',
        category: catPackages._id,
        price: 2500000,
        duration: 145,
        status: 'active'
    });

    await serviceModel.create({
        name: 'Balance - 1 tiếng 45 phút',
        description: 'Liệu trình cân bằng năng lượng cơ thể.',
        category: catPackages._id,
        price: 950000,
        duration: 105,
        status: 'active'
    });

    await serviceModel.create({
        name: 'Recharge - 2 tiếng 15 phút',
        description: 'Tái tạo năng lượng sau tuần làm việc căng thẳng.',
        category: catPackages._id,
        price: 1200000,
        duration: 135,
        status: 'active'
    });

    await serviceModel.create({
        name: 'Anti Stress - 2 tiếng 15 phút',
        description: 'Giảm căng thẳng mệt mỏi với liệu pháp hương thơm.',
        category: catPackages._id,
        price: 1300000,
        duration: 135,
        status: 'active'
    });

    await serviceModel.create({
        name: 'Your Sa Ritual',
        description: 'Tự thiết kế quy trình thư giãn của riêng bạn.',
        category: catPackages._id,
        price: 2000000,
        duration: 180,
        status: 'active'
    });

    // --- Services for Category 'Massage' ---
    await serviceModel.create({
        name: 'Massage Thụy Điển',
        description: 'Massage nhẹ nhàng thư giãn.',
        category: catMassage._id,
        price: 500000,
        duration: 60,
        status: 'active'
    });

    // --- Services for Category 'Chăm Sóc Tóc' ---
    await serviceModel.create({
        name: 'Gội Đầu Dưỡng Sinh',
        description: 'Gội đầu thảo dược truyền thống.',
        category: catHairCare._id,
        price: 150000,
        duration: 45,
        status: 'active'
    });

    console.log(`✅ Created Sample Services`);

    // 3. Create Test Member (Optional)
    const existingUser = await userModel.findOne({ zaloId: 'TEST_USER_01' });
    if (!existingUser) {
        await userModel.create({
            fullName: 'Test Member',
            phone: '0909000111',
            zaloId: 'TEST_USER_01',
            authProvider: AuthProvider.ZALO,
            role: UserRole.CUSTOMER
        });
        console.log('✅ Created Test User: Test Member (ZaloID: TEST_USER_01)');
    }

    const existingAdmin = await userModel.findOne({ email: 'admin@manxi.com' });
    if (!existingAdmin) {
        await userModel.create({
            fullName: 'Admin User',
            email: 'admin@manxi.com',
            phone: '0909999888',
            password: '123456', // Trong thực tế cần hash
            zaloId: 'ADMIN_01',
            authProvider: AuthProvider.EMAIL,
            role: UserRole.ADMIN
        });
        console.log('✅ Created Admin User: admin@manxi.com');
    }

    const existingStaff = await userModel.findOne({ email: 'staff@manxi.com' });
    if (!existingStaff) {
        await userModel.create({
            fullName: 'Staff User',
            email: 'staff@manxi.com',
            phone: '0909777666',
            password: '123456',
            zaloId: 'STAFF_01',
            authProvider: AuthProvider.EMAIL,
            role: UserRole.EMPLOYEE
        });
        console.log('✅ Created Staff User: staff@manxi.com');
    }

    console.log('🎉 Seeding successfully completed!');
    await app.close();
    process.exit(0); // Ensure process exits
}

bootstrap();
