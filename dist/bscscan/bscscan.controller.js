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
exports.BscscanController = BscscanController = __decorate([
    (0, common_1.Controller)('bscscan'),
    __metadata("design:paramtypes", [bscscan_service_1.BscscanService])
], BscscanController);
//# sourceMappingURL=bscscan.controller.js.map