import { Injectable, Logger } from '@nestjs/common';
import { BscscanService } from '../bscscan/bscscan.service';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import BigNumber from 'bignumber.js';
import configData from '../config/app.config';

@Injectable()
export class ContributionService {
  private readonly logger = new Logger(ContributionService.name);
  private readonly contributionFactor: number;
  private readonly cacheTtl: number;

  constructor(
    private readonly bscscanService: BscscanService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    let configData1 = configData();
    // 获取贡献度计算系数
    this.contributionFactor = configData1.bsc.contributionFactor || 0.000024;
    // 获取缓存过期时间
    this.cacheTtl = configData1.cache.ttl || 300;
  }

  // 计算用户贡献度
  private calculateContribution(bnbAmount: number): number {
    // 使用 BigNumber 计算贡献度，避免浮点数精度问题
    return new BigNumber(bnbAmount)
      .dividedBy(new BigNumber(this.contributionFactor))
      .toNumber();
  }

  // 获取用户已领取贡献度
  async getUserContribution(address: string): Promise<number> {
    // 尝试从缓存获取
    const cacheKey = `user_contribution:${address}`;
    let contribution = await this.cacheManager.get<number>(cacheKey);
    
    // 如果缓存不存在，则计算贡献度
    if (contribution === undefined) {
      // 获取用户收到的BNB总量
      const totalBnb = await this.bscscanService.getTotalReceivedBnb(address);
      // 计算贡献度
      contribution = this.calculateContribution(totalBnb);
      // 存入缓存
      await this.cacheManager.set(cacheKey, contribution, this.cacheTtl * 1000);
    }
    
    return contribution;
  }

  // 刷新所有用户贡献度缓存
  async refreshAllUserContributions(): Promise<void> {
    try {
      this.logger.log('开始刷新所有用户贡献度缓存');
      
      // 此处可以从数据库中获取所有收到过BNB的地址
      // 为简化演示，我们假设有一个查询可以获取所有不同的收款地址
      const uniqueAddresses = await this.getAllUniqueRecipientAddresses();
      
      // 更新每个地址的贡献度缓存
      for (const address of uniqueAddresses) {
        await this.refreshUserContribution(address);
      }
      
      this.logger.log(`完成刷新 ${uniqueAddresses.length} 个用户的贡献度缓存`);
    } catch (error) {
      this.logger.error(`刷新用户贡献度缓存出错: ${error.message}`);
    }
  }

  // 刷新单个用户的贡献度缓存
  async refreshUserContribution(address: string): Promise<number> {
    try {
      // 删除缓存
      await this.cacheManager.del(`user_contribution:${address}`);
      // 获取新的
      return await this.getUserContribution(address);
    } catch (error) {
      this.logger.error(`刷新用户 ${address} 贡献度缓存出错: ${error.message}`);
      throw error;
    }
  }

  // 获取所有不同的收款地址
  private async getAllUniqueRecipientAddresses(): Promise<string[]> {
    // 实际项目中，这里应该是一个数据库查询
    // 示例代码，需要根据实际数据库设计进行调整
    const addresses = await this.bscscanService['transactionRepository']
      .createQueryBuilder('tx')
      .select('DISTINCT tx.toAddress', 'address')
      .getRawMany();
    
    return addresses.map(item => item.address);
  }
}
