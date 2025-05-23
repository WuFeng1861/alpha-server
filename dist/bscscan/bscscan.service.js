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
const cache_manager_1 = require("@nestjs/cache-manager");
let BscscanService = BscscanService_1 = class BscscanService {
    constructor(transactionRepository, userBnbBalanceRepository, blockScanStateRepository, cacheManager) {
        this.transactionRepository = transactionRepository;
        this.userBnbBalanceRepository = userBnbBalanceRepository;
        this.blockScanStateRepository = blockScanStateRepository;
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(BscscanService_1.name);
        this.isScanning = false;
        this.isScanningOld = false;
        let configData1 = (0, app_config_1.default)();
        this.contractAddress = configData1.bsc.contractAddress;
        this.apiKey = configData1.bsc.apiKey;
        this.apiUrl = configData1.bsc.apiUrl;
        this.maxBlocksPerScan = configData1.bsc.maxBlocksPerScan;
        this.cacheTtl = configData1.cache.ttl || 300;
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
                    lastScannedBlock: 49871530,
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
    async scanOldBlocks() {
        if (this.isScanningOld) {
            return;
        }
        try {
            this.isScanningOld = true;
            const scanState = await this.blockScanStateRepository.findOne({
                where: { id: 1 }
            });
            if (!scanState) {
                this.logger.error('未找到扫描状态记录');
                this.isScanningOld = false;
                return;
            }
            const startBlock = scanState.lastScannedBlock - 200;
            if (!this.latestBlock || startBlock > this.latestBlock - 20) {
                this.latestBlock = await this.getLatestBlockNumber();
            }
            const endBlock = Math.min(startBlock + this.maxBlocksPerScan - 1, this.latestBlock - 10);
            if (startBlock > endBlock) {
                this.isScanningOld = false;
                return;
            }
            this.logger.log(`开始二次扫描区块: ${startBlock} 到 ${endBlock}`);
            const transactions = await this.fetchTransactions(startBlock, endBlock);
            const outgoingBnbTransactions = this.filterOutgoingBnbTransactions(transactions);
            if (outgoingBnbTransactions.length > 0) {
                await this.saveTransactions(outgoingBnbTransactions);
                this.logger.log(`保存了 ${outgoingBnbTransactions.length} 条交易记录`);
            }
            this.logger.log(`完成二次扫描到区块 ${endBlock}`);
        }
        catch (error) {
            this.logger.error(`扫描二次区块出错: ${error.message}`);
        }
        finally {
            this.isScanningOld = false;
        }
    }
    async scanBlockRange(startBlock, endBlock, targetCount) {
        try {
            let count = await this.transactionRepository.count({
                where: {
                    blockNumber: (0, typeorm_2.Between)(startBlock, endBlock),
                },
            });
            if (count >= targetCount) {
                return count;
            }
            if (!this.latestBlock || startBlock > this.latestBlock - 20) {
                this.latestBlock = await this.getLatestBlockNumber();
            }
            if (startBlock > endBlock) {
                return;
            }
            let newEndBlock = Math.min(endBlock, this.latestBlock - 10);
            this.logger.log(`开始指定范围扫描区块: ${startBlock} 到 ${newEndBlock}`);
            const transactions = await this.fetchTransactions(startBlock, newEndBlock);
            const outgoingBnbTransactions = this.filterOutgoingBnbTransactions(transactions);
            if (outgoingBnbTransactions.length > 0) {
                await this.saveTransactions(outgoingBnbTransactions);
                this.logger.log(`保存了 ${outgoingBnbTransactions.length} 条交易记录`);
            }
            this.logger.log(`完成指定扫描区块${startBlock}-${newEndBlock}`);
            return outgoingBnbTransactions.length;
        }
        catch (error) {
            this.logger.error(`扫描指定区块出错: ${error.message}`);
            return 0;
        }
    }
    async getTransactionCountInRange(startBlock, endBlock) {
        try {
            const count = await this.transactionRepository.count({
                where: {
                    blockNumber: (0, typeorm_2.Between)(startBlock, endBlock),
                },
            });
            return count;
        }
        catch (error) {
            this.logger.error(`获取指定区块范围的交易数量出错: ${error.message}`);
            throw error;
        }
    }
    async getLatestBlockNumber() {
        try {
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
                const cacheKey = `user_contribution:${tx.to}`;
                await this.cacheManager.del(cacheKey);
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
__decorate([
    (0, schedule_1.Interval)(3 * 60 * 1000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BscscanService.prototype, "scanOldBlocks", null);
exports.BscscanService = BscscanService = BscscanService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(user_balance_entity_1.UserBnbBalance)),
    __param(2, (0, typeorm_1.InjectRepository)(block_scan_entity_1.BlockScanState)),
    __param(3, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], BscscanService);
//# sourceMappingURL=bscscan.service.js.map