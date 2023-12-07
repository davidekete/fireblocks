import { Controller } from '@nestjs/common';
import { FireblocksService } from './fireblocks.service';

@Controller('fireblocks')
export class FireblocksController {
  constructor(private readonly fireblocksService: FireblocksService) {}
}
