import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesModule } from './services/services.module';
import { ServiceCategoriesModule } from './service-categories/service-categories.module';
import { EmployeesModule } from './employees/employees.module';
import { EmployeePositionsModule } from './employee-positions/employee-positions.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { VouchersModule } from './vouchers/vouchers.module';

@Module({
  imports: [
    // 1. Config Environment
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 2. Database Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const username = configService.get<string>('MONGO_INITDB_ROOT_USERNAME');
        const password = configService.get<string>('MONGO_INITDB_ROOT_PASSWORD');
        const dbName = configService.get<string>('MONGO_DB_NAME');
        const port = configService.get<string>('MONGO_PORT');

        const host = configService.get<string>('MONGO_HOST') || 'localhost';

        const uri = `mongodb://${username}:${password}@${host}:${port}/${dbName}?authSource=admin`;

        return {
          uri,
        };
      },
      inject: [ConfigService],
    }),

    UsersModule,
    ServicesModule,
    ServiceCategoriesModule,
    EmployeesModule,
    EmployeePositionsModule,
    BookingsModule,
    ReviewsModule,
    VouchersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
