"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.setGlobalPrefix('api');
    app.enableCors();
    const port = process.env.PORT || 5999;
    await app.listen(port);
    console.log(`应用已启动，监听端口: ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map