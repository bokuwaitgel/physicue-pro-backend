"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const prisma_module_1 = require("./prisma/prisma.module");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const users_module_1 = require("./users/users.module");
const groups_module_1 = require("./groups/groups.module");
const cources_service_1 = require("./cources/cources.service");
const cources_module_1 = require("./cources/cources.module");
const config_2 = require("./config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.auth.env',
                load: [config_2.default],
            }),
            users_module_1.UsersModule,
            prisma_module_1.PrismaModule,
            groups_module_1.GroupsModule,
            cources_module_1.CourcesModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, cources_service_1.CourcesService,],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map