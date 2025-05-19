import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { BlockScanState } from './entities/block-scan.entity';
import { UserBnbBalance } from './entities/user-balance.entity';
export declare class BscscanService {
    private transactionRepository;
    private userBnbBalanceRepository;
    private blockScanStateRepository;
    private readonly logger;
    private contractAddress;
    private apiKey;
    private apiUrl;
    private maxBlocksPerScan;
    private isScanning;
    private latestBlock;
    constructor(transactionRepository: Repository<Transaction>, userBnbBalanceRepository: Repository<UserBnbBalance>, blockScanStateRepository: Repository<BlockScanState>);
    private initializeScanState;
    scanNewBlocks(): Promise<void>;
    private getLatestBlockNumber;
    private fetchTransactions;
    private filterOutgoingBnbTransactions;
    private saveTransactions;
    getReceivedTransactions(address: string): Promise<Transaction[]>;
    getTotalReceivedBnb(address: string): Promise<number>;
}
