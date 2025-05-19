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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBnbBalance = void 0;
const typeorm_1 = require("typeorm");
let UserBnbBalance = class UserBnbBalance {
};
exports.UserBnbBalance = UserBnbBalance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserBnbBalance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 42 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserBnbBalance.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 65, scale: 18 }),
    __metadata("design:type", Number)
], UserBnbBalance.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], UserBnbBalance.prototype, "blockNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], UserBnbBalance.prototype, "updatedAt", void 0);
exports.UserBnbBalance = UserBnbBalance = __decorate([
    (0, typeorm_1.Entity)('user_bnb_balances')
], UserBnbBalance);
//# sourceMappingURL=user-balance.entity.js.map