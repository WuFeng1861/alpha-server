import { ContributionService } from './contribution.service';
export declare class ContributionController {
    private readonly contributionService;
    constructor(contributionService: ContributionService);
    getUserContribution(address: string): Promise<{
        address: string;
        contribution: number;
    }>;
    refreshUserContribution(address: string): Promise<{
        address: string;
        contribution: number;
    }>;
    refreshAllUserContributions(): Promise<{
        success: boolean;
        message: string;
    }>;
}
