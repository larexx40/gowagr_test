import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60000, // Cache expiration time in milliseconds
      max: 10, // Maximum number of items in cache
      isGlobal: true
    }),
    ConfigModule.forRoot({
      isGlobal: true, 
      // envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,   
      host: process.env.PG_HOST,
      port: parseInt(process.env.PG_PORT, 10),
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    TransactionsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
