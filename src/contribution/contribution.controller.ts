import { Controller, Get, Param, Post } from '@nestjs/common';
import { ContributionService } from './contribution.service';

@Controller('contribution')
export class ContributionController {
  constructor(private readonly contributionService: ContributionService) {}

  // 获取用户已领取贡献度
  @Get(':address')
  async getUserContribution(
    @Param('address') address: string,
  ): Promise<{ address: string; contribution: number }> {
    const contribution = await this.contributionService.getUserContribution(address);
    return {
      address,
      contribution,
    };
  }

  // 刷新用户贡献度
  @Post('refresh/:address')
  async refreshUserContribution(
    @Param('address') address: string,
  ): Promise<{ address: string; contribution: number }> {
    const contribution = await this.contributionService.refreshUserContribution(address);
    return {
      address,
      contribution,
    };
  }

  // 刷新所有用户贡献度
  @Post('refresh-all')
  async refreshAllUserContributions(): Promise<{ success: boolean; message: string }> {
    await this.contributionService.refreshAllUserContributions();
    return {
      success: true,
      message: '已开始刷新所有用户贡献度缓存',
    };
  }
}