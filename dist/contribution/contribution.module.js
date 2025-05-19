"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContributionModule = void 0;
const common_1 = require("@nestjs/common");
const contribution_controller_1 = require("./contribution.controller");
const contribution_service_1 = require("./contribution.service");
const bscscan_module_1 = require("../bscscan/bscscan.module");
let ContributionModule = class ContributionModule {
};
exports.ContributionModule = ContributionModule;
exports.ContributionModule = ContributionModule = __decorate([
    (0, common_1.Module)({
        imports: [bscscan_module_1.BscscanModule],
        controllers: [contribution_controller_1.ContributionController],
        providers: [contribution_service_1.ContributionService],
        exports: [contribution_service_1.ContributionService],
    })
], ContributionModule);
//# sourceMappingURL=contribution.module.js.map