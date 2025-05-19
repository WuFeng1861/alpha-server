"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BscscanModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bscscan_service_1 = require("./bscscan.service");
const bscscan_controller_1 = require("./bscscan.controller");
const transaction_entity_1 = require("./entities/transaction.entity");
const block_scan_entity_1 = require("./entities/block-scan.entity");
const user_balance_entity_1 = require("./entities/user-balance.entity");
let BscscanModule = class BscscanModule {
};
exports.BscscanModule = BscscanModule;
exports.BscscanModule = BscscanModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([transaction_entity_1.Transaction, block_scan_entity_1.BlockScanState, user_balance_entity_1.UserBnbBalance])
        ],
        providers: [bscscan_service_1.BscscanService],
        controllers: [bscscan_controller_1.BscscanController],
        exports: [bscscan_service_1.BscscanService],
    })
], BscscanModule);
//# sourceMappingURL=bscscan.module.js.map