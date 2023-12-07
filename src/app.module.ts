import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FireblocksModule } from './fireblocks/fireblocks.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    FireblocksModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
