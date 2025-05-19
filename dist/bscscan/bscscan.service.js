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
var BscscanService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BscscanService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = require("axios");
const bignumber_js_1 = require("bignumber.js");
const transaction_entity_1 = require("./entities/transaction.entity");
const block_scan_entity_1 = require("./entities/block-scan.entity");
const user_balance_entity_1 = require("./entities/user-balance.entity");
const app_config_1 = require("../config/app.config");
let BscscanService = BscscanService_1 = class BscscanService {
    constructor(transactionRepository, userBnbBalanceRepository, blockScanStateRepository) {
        this.transactionRepository = transactionRepository;
        this.userBnbBalanceRepository = userBnbBalanceRepository;
        this.blockScanStateRepository = blockScanStateRepository;
        this.logger = new common_1.Logger(BscscanService_1.name);
        this.isScanning = false;
        let configData1 = (0, app_config_1.default)();
        this.contractAddress = configData1.bsc.contractAddress;
        this.apiKey = configData1.bsc.apiKey;
        this.apiUrl = configData1.bsc.apiUrl;
        this.maxBlocksPerScan = configData1.bsc.maxBlocksPerScan;
        console.log(this.contractAddress, this.apiKey, this.apiUrl, 'BscscanService init');
        this.initializeScanState();
    }
    async initializeScanState() {
        try {
            let scanState = await this.blockScanStateRepository.findOne({
                where: { id: 1 }
            });
            if (!scanState) {
                scanState = this.blockScanStateRepository.create({
                    id: 1,
                    lastScannedBlock: 49864805,
                });
                await this.blockScanStateRepository.save(scanState);
            }
            this.logger.log(`初始化扫描状态完成，上次扫描区块: ${scanState.lastScannedBlock}`);
        }
        catch (error) {
            this.logger.error(`初始化扫描状态失败: ${error.message}`);
        }
    }
    async scanNewBlocks() {
        if (this.isScanning) {
            return;
        }
        try {
            this.isScanning = true;
            const scanState = await this.blockScanStateRepository.findOne({
                where: { id: 1 }
            });
            if (!scanState) {
                this.logger.error('未找到扫描状态记录');
                this.isScanning = false;
                return;
            }
            const startBlock = scanState.lastScannedBlock + 1;
            if (!this.latestBlock || startBlock > this.latestBlock - 20) {
                this.latestBlock = await this.getLatestBlockNumber();
            }
            const endBlock = Math.min(startBlock + this.maxBlocksPerScan - 1, this.latestBlock - 10);
            if (startBlock > endBlock) {
                this.isScanning = false;
                return;
            }
            this.logger.log(`开始扫描区块: ${startBlock} 到 ${endBlock}`);
            const transactions = await this.fetchTransactions(startBlock, endBlock);
            const outgoingBnbTransactions = this.filterOutgoingBnbTransactions(transactions);
            if (outgoingBnbTransactions.length > 0) {
                await this.saveTransactions(outgoingBnbTransactions);
                this.logger.log(`保存了 ${outgoingBnbTransactions.length} 条交易记录`);
            }
            scanState.lastScannedBlock = endBlock;
            scanState.lastScanTime = new Date();
            await this.blockScanStateRepository.save(scanState);
            this.logger.log(`完成扫描到区块 ${endBlock}`);
        }
        catch (error) {
            this.logger.error(`扫描区块出错: ${error.message}`);
        }
        finally {
            this.isScanning = false;
        }
    }
    async getLatestBlockNumber() {
        try {
            console.log(this.apiUrl, this.apiKey, 'getLatestBlockNumber');
            const response = await axios_1.default.get(this.apiUrl, {
                params: {
                    module: 'proxy',
                    action: 'eth_blockNumber',
                    apikey: this.apiKey,
                },
            });
            if (response.data && response.data.result) {
                return parseInt(response.data.result, 16);
            }
            throw new Error('获取最新区块号失败');
        }
        catch (error) {
            this.logger.error(`获取最新区块号出错: ${error.message}`);
            throw error;
        }
    }
    async fetchTransactions(startBlock, endBlock) {
        try {
            const response = await axios_1.default.get(this.apiUrl, {
                params: {
                    module: 'account',
                    action: 'txlistinternal',
                    address: this.contractAddress,
                    startblock: startBlock,
                    endblock: endBlock,
                    sort: 'asc',
                    apikey: this.apiKey,
                },
            });
            console.log(response.data.result);
            if (response.data && response.data.status === '1') {
                return response.data.result;
            }
            if (response.data && response.data.message === 'No transactions found') {
                return [];
            }
            this.logger.warn(`API响应异常: ${response.data.message}`);
            return [];
        }
        catch (error) {
            this.logger.error(`获取交易数据出错: ${error.message}`);
            return [];
        }
    }
    filterOutgoingBnbTransactions(transactions) {
        return transactions.filter(tx => tx.from.toLowerCase() === this.contractAddress.toLowerCase() &&
            tx.value !== '0' &&
            tx.to !== null);
    }
    async saveTransactions(transactions) {
        await this.transactionRepository.manager.transaction(async (transactionalEntityManager) => {
            for (const tx of transactions) {
                const existingTx = await transactionalEntityManager.findOne(transaction_entity_1.Transaction, {
                    where: { hash: tx.hash }
                });
                if (existingTx) {
                    this.logger.log(`交易 ${tx.hash} 已存在，跳过`);
                    continue;
                }
                const entity = new transaction_entity_1.Transaction();
                entity.hash = tx.hash;
                entity.blockNumber = parseInt(tx.blockNumber);
                entity.timestamp = new Date(parseInt(tx.timeStamp) * 1000);
                entity.fromAddress = tx.from;
                entity.toAddress = tx.to;
                entity.value = new bignumber_js_1.default(tx.value).dividedBy(new bignumber_js_1.default(10).pow(18)).toNumber();
                await transactionalEntityManager.save(transaction_entity_1.Transaction, entity);
                const balance = await transactionalEntityManager.findOne(user_balance_entity_1.UserBnbBalance, {
                    where: { address: tx.to },
                    order: { blockNumber: 'DESC' }
                });
                console.log(balance, '获取用户当前余额: ' + tx.hash);
                const newBalance = new user_balance_entity_1.UserBnbBalance();
                newBalance.address = tx.to;
                newBalance.blockNumber = parseInt(tx.blockNumber);
                newBalance.balance = new bignumber_js_1.default(balance?.balance || 0).plus(entity.value).toNumber();
                await transactionalEntityManager.save(user_balance_entity_1.UserBnbBalance, newBalance);
                this.logger.log(`保存交易 ${tx.hash} 并更新用户 ${tx.to} 余额为 ${newBalance.balance} BNB`);
            }
        });
    }
    async getReceivedTransactions(address) {
        return this.transactionRepository.find({
            where: {
                toAddress: address,
            },
            order: {
                blockNumber: 'ASC',
            },
        });
    }
    async getTotalReceivedBnb(address) {
        const latestBalance = await this.userBnbBalanceRepository.findOne({
            where: { address },
            order: { blockNumber: 'DESC' }
        });
        return latestBalance?.balance || 0;
    }
};
exports.BscscanService = BscscanService;
__decorate([
    (0, schedule_1.Interval)(1000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BscscanService.prototype, "scanNewBlocks", null);
exports.BscscanService = BscscanService = BscscanService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(user_balance_entity_1.UserBnbBalance)),
    __param(2, (0, typeorm_1.InjectRepository)(block_scan_entity_1.BlockScanState)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BscscanService);
//# sourceMappingURL=bscscan.service.js.map