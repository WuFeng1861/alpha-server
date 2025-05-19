import { BscscanService } from '../bscscan/bscscan.service';
import { Cache } from 'cache-manager';
export declare class ContributionService {
    private readonly bscscanService;
    private cacheManager;
    private readonly logger;
    private readonly contributionFactor;
    private readonly cacheTtl;
    constructor(bscscanService: BscscanService, cacheManager: Cache);
    private calculateContribution;
    getUserContribution(address: string): Promise<number>;
    refreshAllUserContributions(): Promise<void>;
    refreshUserContribution(address: string): Promise<number>;
    private getAllUniqueRecipientAddresses;
}
