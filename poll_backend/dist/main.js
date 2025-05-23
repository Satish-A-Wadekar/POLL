"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const os_1 = require("os");
const http_exception_filter_1 = require("./http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    const nets = (0, os_1.networkInterfaces)();
    const ipv4 = Object.values(nets)
        .flat()
        .find((net) => net?.family === 'IPv4' && !net?.internal)?.address;
    console.log(`Application is running on: http://${ipv4}:${port}`);
    console.log(`Local: http://localhost:${port}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map