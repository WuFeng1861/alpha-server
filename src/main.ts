import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 创建 NestJS 应用实例
  const app = await NestFactory.create(AppModule);
  
  // 启用全局验证管道
  app.useGlobalPipes(new ValidationPipe());
  
  // 配置全局前缀
  app.setGlobalPrefix('api');
  
  // 启用 CORS
  app.enableCors();
  
  // 从环境变量获取端口，默认为5999
  const port = process.env.PORT || 5999;
  
  // 启动应用
  await app.listen(port);
  console.log(`应用已启动，监听端口: ${port}`);
}
bootstrap();