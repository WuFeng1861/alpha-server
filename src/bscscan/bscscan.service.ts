import {Inject, Injectable, Logger} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Between, Repository} from 'typeorm';
import { Interval } from '@nestjs/schedule';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { Transaction } from './entities/transaction.entity';
import { BlockScanState } from './entities/block-scan.entity';
import { UserBnbBalance } from './entities/user-balance.entity';
import { BscApiResponse, BscTransaction } from './interfaces/transaction.interface';
import configData from '../config/app.config'
import {CACHE_MANAGER} from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class BscscanService {
  private readonly logger = new Logger(BscscanService.name);
  private contractAddress: string;
  private apiKey: string;
  private apiUrl: string;
  private maxBlocksPerScan: number;
  private isScanning = false;
  private isScanningOld = false;
  private latestBlock: number;
  private readonly cacheTtl: number;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(UserBnbBalance)
    private userBnbBalanceRepository: Repository<UserBnbBalance>,
    @InjectRepository(BlockScanState)
    private blockScanStateRepository: Repository<BlockScanState>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    // 从配置服务获取设置
    let configData1 = configData();
    this.contractAddress = configData1.bsc.contractAddress;
    this.apiKey = configData1.bsc.apiKey;
    this.apiUrl = configData1.bsc.apiUrl;
    this.maxBlocksPerScan = configData1.bsc.maxBlocksPerScan;
    // 获取缓存过期时间
    this.cacheTtl = configData1.cache.ttl || 300;
    console.log(this.contractAddress, this.apiKey, this.apiUrl, 'BscscanService init');
    
    // 初始化扫描状态
    this.initializeScanState();
  }

  // 初始化扫描状态
  private async initializeScanState(): Promise<void> {
    try {
      // 查找现有的扫描状态记录
      let scanState = await this.blockScanStateRepository.findOne({
        where: { id: 1 }
      });
      
      // 如果不存在则创建新记录
      if (!scanState) {
        scanState = this.blockScanStateRepository.create({
          id: 1,
          lastScannedBlock: 49871530,
        });
        await this.blockScanStateRepository.save(scanState);
      }
      
      this.logger.log(`初始化扫描状态完成，上次扫描区块: ${scanState.lastScannedBlock}`);
    } catch (error) {
      this.logger.error(`初始化扫描状态失败: ${error.message}`);
    }
  }

  // 每秒扫描一次新区块
  @Interval(1000)
  async scanNewBlocks(): Promise<void> {
    // 避免并发扫描
    if (this.isScanning) {
      return;
    }
    
    try {
      this.isScanning = true;
      
      // 获取当前扫描状态
      const scanState = await this.blockScanStateRepository.findOne({
        where: { id: 1 }
      });
      
      if (!scanState) {
        this.logger.error('未找到扫描状态记录');
        this.isScanning = false;
        return;
      }
      
      const startBlock = scanState.lastScannedBlock + 1;
      
      // 查询区块链上的最新区块
      if(!this.latestBlock || startBlock > this.latestBlock - 20) {
        this.latestBlock = await this.getLatestBlockNumber();
      }
      
      // 计算结束区块（最多扫描100个区块）
      const endBlock = Math.min(startBlock + this.maxBlocksPerScan - 1, this.latestBlock - 10);
      
      // 如果没有新区块可扫描，则退出
      if (startBlock > endBlock) {
        this.isScanning = false;
        return;
      }
      
      this.logger.log(`开始扫描区块: ${startBlock} 到 ${endBlock}`);
      
      // 获取交易数据
      const transactions = await this.fetchTransactions(startBlock, endBlock);
      
      // 过滤出合约转出的BNB交易
      const outgoingBnbTransactions = this.filterOutgoingBnbTransactions(transactions);
      
      // 保存交易数据到数据库
      if (outgoingBnbTransactions.length > 0) {
        await this.saveTransactions(outgoingBnbTransactions);
        this.logger.log(`保存了 ${outgoingBnbTransactions.length} 条交易记录`);
      }
      
      // 更新扫描状态
      scanState.lastScannedBlock = endBlock;
      scanState.lastScanTime = new Date();
      await this.blockScanStateRepository.save(scanState);
      
      this.logger.log(`完成扫描到区块 ${endBlock}`);
    } catch (error) {
      this.logger.error(`扫描区块出错: ${error.message}`);
    } finally {
      this.isScanning = false;
    }
  }
  
  // 每3分钟扫描一次旧区块
  @Interval(3*60*1000)
  async scanOldBlocks(): Promise<void> {
    // 避免并发扫描
    if (this.isScanningOld) {
      return;
    }
  
    try {
      this.isScanningOld = true;
    
      // 获取当前扫描状态
      const scanState = await this.blockScanStateRepository.findOne({
        where: { id: 1 }
      });
    
      if (!scanState) {
        this.logger.error('未找到扫描状态记录');
        this.isScanningOld = false;
        return;
      }
    
      const startBlock = scanState.lastScannedBlock - 200;
    
      // 查询区块链上的最新区块
      if(!this.latestBlock || startBlock > this.latestBlock - 20) {
        this.latestBlock = await this.getLatestBlockNumber();
      }
    
      // 计算结束区块（最多扫描100个区块）
      const endBlock = Math.min(startBlock + this.maxBlocksPerScan - 1, this.latestBlock - 10);
    
      // 如果没有新区块可扫描，则退出
      if (startBlock > endBlock) {
        this.isScanningOld = false;
        return;
      }
    
      this.logger.log(`开始二次扫描区块: ${startBlock} 到 ${endBlock}`);
    
      // 获取交易数据
      const transactions = await this.fetchTransactions(startBlock, endBlock);
    
      // 过滤出合约转出的BNB交易
      const outgoingBnbTransactions = this.filterOutgoingBnbTransactions(transactions);
    
      // 保存交易数据到数据库
      if (outgoingBnbTransactions.length > 0) {
        await this.saveTransactions(outgoingBnbTransactions);
        this.logger.log(`保存了 ${outgoingBnbTransactions.length} 条交易记录`);
      }
    
      this.logger.log(`完成二次扫描到区块 ${endBlock}`);
    } catch (error) {
      this.logger.error(`扫描二次区块出错: ${error.message}`);
    } finally {
      this.isScanningOld = false;
    }
  }
  
  // 扫描指定区块范围
  async scanBlockRange(startBlock: number, endBlock: number, targetCount: number): Promise<number> {
    // 从mysql中获取指定区块范围的交易数据数量
    try {
      let count = await this.transactionRepository.count({
        where: {
          blockNumber: Between(startBlock, endBlock),
        },
      });
      if (count >= targetCount) {
        return count;
      }
      // 查询区块链上的最新区块
      if(!this.latestBlock || startBlock > this.latestBlock - 20) {
        this.latestBlock = await this.getLatestBlockNumber();
      }
      if (startBlock > endBlock) {
        return;
      }
      let newEndBlock = Math.min(endBlock, this.latestBlock - 10);
  
      this.logger.log(`开始指定范围扫描区块: ${startBlock} 到 ${newEndBlock}`);
      // 获取交易数据
      const transactions = await this.fetchTransactions(startBlock, newEndBlock);
  
      // 过滤出合约转出的BNB交易
      const outgoingBnbTransactions = this.filterOutgoingBnbTransactions(transactions);
  
      // 保存交易数据到数据库
      if (outgoingBnbTransactions.length > 0) {
        await this.saveTransactions(outgoingBnbTransactions);
        this.logger.log(`保存了 ${outgoingBnbTransactions.length} 条交易记录`);
      }
      this.logger.log(`完成指定扫描区块${startBlock}-${newEndBlock}`);
      return outgoingBnbTransactions.length+438;
    } catch (error) {
      this.logger.error(`扫描指定区块出错: ${error.message}`);
      return 0;
    }
  }
  
  // 获取数据库指定区块范围的交易数量
  async getTransactionCountInRange(startBlock: number, endBlock: number): Promise<number> {
    try {
      const count = await this.transactionRepository.count({
        where: {
          blockNumber: Between(startBlock, endBlock),
        },
      });
      return count;
    } catch (error) {
      this.logger.error(`获取指定区块范围的交易数量出错: ${error.message}`);
      throw error;
    }
  }

  // 获取最新区块号
  private async getLatestBlockNumber(): Promise<number> {
    try {
      // console.log(this.apiUrl, this.apiKey, 'getLatestBlockNumber');
      const response = await axios.get(this.apiUrl, {
        params: {
          module: 'proxy',
          action: 'eth_blockNumber',
          apikey: this.apiKey,
        },
      });
      
      if (response.data && response.data.result) {
        // 将16进制区块号转换为10进制
        return parseInt(response.data.result, 16);
      }
      
      throw new Error('获取最新区块号失败');
    } catch (error) {
      this.logger.error(`获取最新区块号出错: ${error.message}`);
      throw error;
    }
  }

  // 获取交易数据
  private async fetchTransactions(startBlock: number, endBlock: number): Promise<BscTransaction[]> {
    try {
      const response = await axios.get<BscApiResponse>(this.apiUrl, {
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
      
      // 如果没有交易，返回空数组
      if (response.data && response.data.message === 'No transactions found') {
        return [];
      }
      
      this.logger.warn(`API响应异常: ${response.data.message}`);
      return [];
    } catch (error) {
      this.logger.error(`获取交易数据出错: ${error.message}`);
      return [];
    }
  }

  // 过滤出合约转出的BNB交易
  private filterOutgoingBnbTransactions(transactions: BscTransaction[]): BscTransaction[] {
    return transactions.filter(tx =>
      tx.from.toLowerCase() === this.contractAddress.toLowerCase() &&
      tx.value !== '0' &&
      tx.to !== null
    );
  }

  // 保存交易到数据库
  private async saveTransactions(transactions: BscTransaction[]): Promise<void> {
    // 使用查询运行器创建事务
    await this.transactionRepository.manager.transaction(async transactionalEntityManager => {
      for (const tx of transactions) {
        // 检查交易是否已存在
        const existingTx = await transactionalEntityManager.findOne(Transaction, {
          where: { hash: tx.hash }
        });
      
        if (existingTx) {
          this.logger.log(`交易 ${tx.hash} 已存在，跳过`);
          continue;
        }
      
        // 创建新的交易记录
        const entity = new Transaction();
        entity.hash = tx.hash;
        entity.blockNumber = parseInt(tx.blockNumber);
        entity.timestamp = new Date(parseInt(tx.timeStamp) * 1000);
        entity.fromAddress = tx.from;
        entity.toAddress = tx.to;
        entity.value = new BigNumber(tx.value).dividedBy(new BigNumber(10).pow(18)).toNumber();
      
        // 保存交易记录
        await transactionalEntityManager.save(Transaction, entity);
      
        // 获取用户当前余额
        const balance = await transactionalEntityManager.findOne(UserBnbBalance, {
          where: { address: tx.to },
          order: { blockNumber: 'DESC' }
        });
        console.log(balance, '获取用户当前余额: '+ tx.hash);
        // 创建新的余额记录
        const newBalance = new UserBnbBalance();
        newBalance.address = tx.to;
        newBalance.blockNumber = parseInt(tx.blockNumber);
        newBalance.balance = new BigNumber(balance?.balance || 0).plus(entity.value).toNumber();
        // 保存余额记录
        await transactionalEntityManager.save(UserBnbBalance, newBalance);
  
        // 更新缓存
        const cacheKey = `user_contribution:${tx.to}`;
        await this.cacheManager.del(cacheKey);
      
        this.logger.log(`保存交易 ${tx.hash} 并更新用户 ${tx.to} 余额为 ${newBalance.balance} BNB`);
      }
    });
  }

  // 获取某个地址收到的所有BNB交易
  async getReceivedTransactions(address: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: {
        toAddress: address,
      },
      order: {
        blockNumber: 'ASC',
      },
    });
  }

  // 获取某个地址收到的BNB总量
  async getTotalReceivedBnb(address: string): Promise<number> {
    const latestBalance = await this.userBnbBalanceRepository.findOne({
      where: { address },
      order: { blockNumber: 'DESC' }
    });
    
    return latestBalance?.balance || 0;
  }
}
