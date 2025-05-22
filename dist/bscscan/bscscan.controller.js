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
exports.BscscanController = void 0;
const common_1 = require("@nestjs/common");
const bscscan_service_1 = require("./bscscan.service");
let BscscanController = class BscscanController {
    constructor(bscscanService) {
        this.bscscanService = bscscanService;
    }
    async getTransactions(address) {
        return this.bscscanService.getReceivedTransactions(address);
    }
    async getTotalBnb(address) {
        const totalBnb = await this.bscscanService.getTotalReceivedBnb(address);
        return {
            address,
            totalBnb,
        };
    }
    async scanBlockRange(startBlock, endBlock, targetCount) {
        return await this.bscscanService.scanBlockRange(startBlock, endBlock, targetCount);
    }
    async getRangeCount(startBlock, endBlock) {
        return await this.bscscanService.getTransactionCountInRange(startBlock, endBlock);
    }
    async checkRangeCount() {
        return await this.bscscanService.scanBlockRange(49871530, 99999999, 10000);
    }
};
exports.BscscanController = BscscanController;
__decorate([
    (0, common_1.Get)('transactions/:address'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BscscanController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('total-bnb/:address'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BscscanController.prototype, "getTotalBnb", null);
__decorate([
    (0, common_1.Get)('scan-block-range/:startBlock/:endBlock'),
    __param(0, (0, common_1.Param)('startBlock')),
    __param(1, (0, common_1.Param)('endBlock')),
    __param(2, (0, common_1.Query)("targetCount")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], BscscanController.prototype, "scanBlockRange", null);
__decorate([
    (0, common_1.Get)('get-range-count/:startBlock/:endBlock'),
    __param(0, (0, common_1.Param)('startBlock')),
    __param(1, (0, common_1.Param)('endBlock')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], BscscanController.prototype, "getRangeCount", null);
__decorate([
    (0, common_1.Get)('check-range-count-before10000'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BscscanController.prototype, "checkRangeCount", null);
exports.BscscanController = BscscanController = __decorate([
    (0, common_1.Controller)('bscscan'),
    __metadata("design:paramtypes", [bscscan_service_1.BscscanService])
], BscscanController);
//# sourceMappingURL=bscscan.controller.js.map