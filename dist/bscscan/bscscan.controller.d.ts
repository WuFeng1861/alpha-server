import { BscscanService } from './bscscan.service';
import { Transaction } from './entities/transaction.entity';
export declare class BscscanController {
    private readonly bscscanService;
    constructor(bscscanService: BscscanService);
    getTransactions(address: string): Promise<Transaction[]>;
    getTotalBnb(address: string): Promise<{
        address: string;
        totalBnb: number;
    }>;
    scanBlockRange(startBlock: number, endBlock: number, targetCount: number): Promise<number>;
    getRangeCount(startBlock: number, endBlock: number): Promise<number>;
    checkRangeCount(): Promise<number>;
}
