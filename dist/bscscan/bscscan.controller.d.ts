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
}
