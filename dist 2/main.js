"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT') || 3000;
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Phsycue Pro ' + (configService.get('SERVICE_NAME') || 'DefaultServiceName') + ' API')
        .setDescription('API description')
        .setVersion('1.0')
        .addBearerAuth({
        description: 'Default JWT Authorization',
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    })
        .addTag(configService.get('SERVICE_NAME') || 'physicue-pro')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(port, '0.0.0.0');
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();
//# sourceMappingURL=main.js.map