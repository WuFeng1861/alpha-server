import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { BscscanService } from './bscscan.service';
import { Transaction } from './entities/transaction.entity';

@Controller('bscscan')
export class BscscanController {
  constructor(private readonly bscscanService: BscscanService) {}

  @Get('transactions/:address')
  async getTransactions(@Param('address') address: string): Promise<Transaction[]> {
    return this.bscscanService.getReceivedTransactions(address);
  }

  @Get('total-bnb/:address')
  async getTotalBnb(@Param('address') address: string): Promise<{ address: string; totalBnb: number }> {
    const totalBnb = await this.bscscanService.getTotalReceivedBnb(address);
    return {
      address,
      totalBnb,
    };
  }
  
  // 扫描指定区块范围
  @Get('scan-block-range/:startBlock/:endBlock')
  async scanBlockRange(@Param('startBlock') startBlock: number, @Param('endBlock') endBlock: number, @Query("targetCount") targetCount: number): Promise<number> {
    return await this.bscscanService.scanBlockRange(startBlock, endBlock, targetCount);
  }
  
  @Get('get-range-count/:startBlock/:endBlock')
  async getRangeCount(@Param('startBlock') startBlock: number, @Param('endBlock') endBlock: number): Promise<number> {
    return await this.bscscanService.getTransactionCountInRange(startBlock, endBlock);
  }
  
  @Get('check-range-count-before10000')
  async checkRangeCount(): Promise<number> {
    return await this.bscscanService.scanBlockRange(49871530, 99999999, 10000);
  }
}
