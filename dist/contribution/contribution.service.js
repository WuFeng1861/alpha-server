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
var ContributionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContributionService = void 0;
const common_1 = require("@nestjs/common");
const bscscan_service_1 = require("../bscscan/bscscan.service");
const common_2 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const bignumber_js_1 = require("bignumber.js");
const app_config_1 = require("../config/app.config");
let ContributionService = ContributionService_1 = class ContributionService {
    constructor(bscscanService, cacheManager) {
        this.bscscanService = bscscanService;
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(ContributionService_1.name);
        let configData1 = (0, app_config_1.default)();
        this.contributionFactor = configData1.bsc.contributionFactor || 0.000024;
        this.cacheTtl = configData1.cache.ttl || 300;
    }
    calculateContribution(bnbAmount) {
        return new bignumber_js_1.default(bnbAmount)
            .dividedBy(new bignumber_js_1.default(this.contributionFactor))
            .toNumber();
    }
    async getUserContribution(address) {
        const cacheKey = `user_contribution:${address}`;
        let contribution = await this.cacheManager.get(cacheKey);
        if (contribution === undefined) {
            const totalBnb = await this.bscscanService.getTotalReceivedBnb(address);
            contribution = this.calculateContribution(totalBnb);
            await this.cacheManager.set(cacheKey, contribution, this.cacheTtl * 1000);
        }
        return contribution;
    }
    async refreshAllUserContributions() {
        try {
            this.logger.log('开始刷新所有用户贡献度缓存');
            const uniqueAddresses = await this.getAllUniqueRecipientAddresses();
            for (const address of uniqueAddresses) {
                await this.refreshUserContribution(address);
            }
            this.logger.log(`完成刷新 ${uniqueAddresses.length} 个用户的贡献度缓存`);
        }
        catch (error) {
            this.logger.error(`刷新用户贡献度缓存出错: ${error.message}`);
        }
    }
    async refreshUserContribution(address) {
        try {
            await this.cacheManager.del(`user_contribution:${address}`);
            return await this.getUserContribution(address);
        }
        catch (error) {
            this.logger.error(`刷新用户 ${address} 贡献度缓存出错: ${error.message}`);
            throw error;
        }
    }
    async getAllUniqueRecipientAddresses() {
        const addresses = await this.bscscanService['transactionRepository']
            .createQueryBuilder('tx')
            .select('DISTINCT tx.toAddress', 'address')
            .getRawMany();
        return addresses.map(item => item.address);
    }
};
exports.ContributionService = ContributionService;
exports.ContributionService = ContributionService = ContributionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [bscscan_service_1.BscscanService, Object])
], ContributionService);
//# sourceMappingURL=contribution.service.js.map