"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContributionController = void 0;
const common_1 = require("@nestjs/common");
const contribution_service_1 = require("./contribution.service");
let ContributionController = class ContributionController {
    constructor(contributionService) {
        this.contributionService = contributionService;
    }
    async getUserContribution(address) {
        const contribution = await this.contributionService.getUserContribution(address);
        return {
            address,
            contribution,
        };
    }
    async refreshUserContribution(address) {
        const contribution = await this.contributionService.refreshUserContribution(address);
        return {
            address,
            contribution,
        };
    }
    async refreshAllUserContributions() {
        await this.contributionService.refreshAllUserContributions();
        return {
            success: true,
            message: '已开始刷新所有用户贡献度缓存',
        };
    }
};
exports.ContributionController = ContributionController;
__decorate([
    (0, common_1.Get)(':address'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContributionController.prototype, "getUserContribution", null);
__decorate([
    (0, common_1.Post)('refresh/:address'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContributionController.prototype, "refreshUserContribution", null);
__decorate([
    (0, common_1.Post)('refresh-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContributionController.prototype, "refreshAllUserContributions", null);
exports.ContributionController = ContributionController = __decorate([
    (0, common_1.Controller)('contribution'),
    __metadata("design:paramtypes", [contribution_service_1.ContributionService])
], ContributionController);
//# sourceMappingURL=contribution.controller.js.map