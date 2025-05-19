import { Module } from '@nestjs/common';
import { ContributionController } from './contribution.controller';
import { ContributionService } from './contribution.service';
import { BscscanModule } from '../bscscan/bscscan.module';

@Module({
  imports: [BscscanModule],
  controllers: [ContributionController],
  providers: [ContributionService],
  exports: [ContributionService],
})
export class ContributionModule {}