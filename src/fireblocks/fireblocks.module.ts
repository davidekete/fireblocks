import { Module } from '@nestjs/common';
import { FireblocksService } from './fireblocks.service';
import { FireblocksController } from './fireblocks.controller';

@Module({
  controllers: [FireblocksController],
  providers: [FireblocksService],
})
export class FireblocksModule {}
