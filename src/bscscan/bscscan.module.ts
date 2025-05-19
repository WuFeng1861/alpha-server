import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BscscanService } from './bscscan.service';
import { BscscanController } from './bscscan.controller';
import { Transaction } from './entities/transaction.entity';
import { BlockScanState } from './entities/block-scan.entity';
import { UserBnbBalance } from './entities/user-balance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, BlockScanState, UserBnbBalance])
  ],
  providers: [BscscanService],
  controllers: [BscscanController],
  exports: [BscscanService],
})
export class BscscanModule {}
