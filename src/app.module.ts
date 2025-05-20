import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BscscanModule } from './bscscan/bscscan.module';
import { ContributionModule } from './contribution/contribution.module';
import { CacheModule } from '@nestjs/cache-manager';
import {SystemModule} from './system/system.module';
import {ProjectReportingModule} from './project-reporting/project-reporting.module';

@Module({
  imports: [
    // 配置模块，用于加载环境变量
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // 缓存模块
    CacheModule.register({
      isGlobal: true,
    }),
    
    // 定时任务模块
    ScheduleModule.forRoot(),
    
    // 数据库连接模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // 生产环境建议设为 false
      }),
    }),
    
    // 业务模块
    BscscanModule,
    ContributionModule,
    SystemModule,
    ProjectReportingModule,
  ],
})
export class AppModule {}
