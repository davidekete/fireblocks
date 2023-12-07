import { Controller, UseGuards, Post, Req, Body } from '@nestjs/common';
import { FireblocksService } from './fireblocks.service';
import { AuthGuard } from 'src/users/guards/auth.guard';

@Controller()
export class FireblocksController {
  constructor(private readonly fireblocksService: FireblocksService) {}

  @UseGuards(AuthGuard)
  @Post('/create-vault-wallet')
  async createVaultWallet(@Body() payload, @Req() request) {}
}
