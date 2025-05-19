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
exports.Transaction = void 0;
const typeorm_1 = require("typeorm");
let Transaction = class Transaction {
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 66 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "hash", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint'),
    __metadata("design:type", Number)
], Transaction.prototype, "blockNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Transaction.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 42 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "fromAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 42 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "toAddress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 65, scale: 18 }),
    __metadata("design:type", Number)
], Transaction.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('bsc_transactions')
], Transaction);
//# sourceMappingURL=transaction.entity.js.map