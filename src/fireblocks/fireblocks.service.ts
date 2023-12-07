import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createVerify } from 'crypto';
import Decimal from 'decimal.js';
import {
  DestinationTransferPeerPath,
  FireblocksSDK,
  TransactionOperation,
  TransferPeerPath,
  VaultAssetResponse,
} from 'fireblocks-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FireblocksService {
  private readonly FIREBLOCKS_API_KEY =
    this.configService.get<string>('FIREBLOCKS_API_KEY');

  private static FIREBLOCKS_API_SECRET: string;

  private static webhookPublicKey: string;

  private readonly fireBlocksSDK: FireblocksSDK;

  constructor(private configService: ConfigService) {
    FireblocksService.FIREBLOCKS_API_SECRET = this.configService.get<string>(
      'FIREBLOCKS_API_SECRET',
    );

    FireblocksService.webhookPublicKey = this.configService.get<string>(
      'FIREBLOCKS_WEBHOOK_PUBLIC_KEY',
    );

    this.fireBlocksSDK = new FireblocksSDK(
      this.FIREBLOCKS_API_KEY,
      FireblocksService.FIREBLOCKS_API_SECRET,
    );
  }

  async getVaultWalletAccountBalance(data: {
    vaultAccountId: string;
    assetId: string;
  }) {
    try {
      const txnFee = await this.fireBlocksSDK.getVaultAccountAsset(
        data.vaultAccountId,
        data.assetId,
      );
      return txnFee;
    } catch (err: any) {
      console.log(err);

      throw new InternalServerErrorException({
        message: err.response?.data?.message ?? err.message,
      });
    }
  }

  async getVaultAccountWallets(data: { vaultAccountId: string }) {
    try {
      const vaultAccount = await this.fireBlocksSDK.getVaultAccountById(
        data.vaultAccountId,
      );
      return vaultAccount;
    } catch (err: any) {
      console.log(err);

      throw new InternalServerErrorException({
        message: err.response?.data?.message ?? err.message,
      });
    }
  }

  async getVaultAccountWalletAddresses(data: {
    vaultAccountId: string;
    assetId: string;
  }) {
    try {
      const depositAddresses = await this.fireBlocksSDK.getDepositAddresses(
        data.vaultAccountId,
        data.assetId,
      );
      return depositAddresses;
    } catch (err: any) {
      console.log(err);

      throw new InternalServerErrorException({
        message: err.response?.data?.message ?? err.message,
      });
    }
  }

  async validateWalletAddress(data: { address: string; assetId: string }) {
    try {
      const resp = await this.fireBlocksSDK.validateAddress(
        data.assetId,
        data.address,
      );
      return resp;
    } catch (err: any) {
      console.log(err);

      throw new InternalServerErrorException({
        message: err.response?.data?.message ?? err.message,
      });
    }
  }

  async getTransactionGasFee_(data: {
    txnAmount: Decimal;
    assetId: string;
    source: TransferPeerPath;
    destination: DestinationTransferPeerPath;
  }) {
    try {
      const txnFee = await this.fireBlocksSDK.estimateFeeForTransaction({
        amount: data.txnAmount.toNumber(),
        assetId: data.assetId,
        source: data.source,
        destination: data.destination,
      });
      return txnFee;
    } catch (err: any) {
      console.log(err);
      throw new InternalServerErrorException({
        message: err.response?.data?.message ?? err.message,
      });
    }
  }

  async createTransaction(data: {
    txnAmount: Decimal;
    assetId: string;
    source: TransferPeerPath;
    destination: DestinationTransferPeerPath;
    customerRefId: string;
    operation: TransactionOperation;
  }) {
    try {
      const txn = await this.fireBlocksSDK.createTransaction({
        amount: data.txnAmount.toNumber(),
        assetId: data.assetId,
        source: data.source,
        destination: data.destination,
        customerRefId: data.customerRefId,
        operation: data.operation,
      });

      return txn;
    } catch (err: any) {
      console.log(err);
      throw new InternalServerErrorException({
        message: err.response?.data?.message ?? err.message,
      });
    }
  }

  async createNewAssetAddress(data: {
    assetId: string;
    providerAccountId: string;
    description: string;
    customerRefId: string;
  }) {
    try {
      const newAddress = await this.fireBlocksSDK.generateNewAddress(
        data.providerAccountId,
        data.assetId,
        data.description,
        data.customerRefId,
      );

      return newAddress;
    } catch (err: any) {
      console.log(err);
      throw new InternalServerErrorException({
        message: err.response?.data?.message ?? err.message,
      });
    }
  }

  async createVaultAccount(data: {
    userUid: string;
    autoFuel: boolean;
    hiddenOnUi: boolean;
  }) {
    try {
      const newVaultAccount = await this.fireBlocksSDK.createVaultAccount(
        data.userUid,
        data.hiddenOnUi,
        data.userUid,
        true,
      );

      return newVaultAccount;
    } catch (err: any) {
      console.log(err);
      throw new InternalServerErrorException({
        message: err.response?.data?.message ?? err.message,
      });
    }
  }

  async getVaultAccount(data: { providerAccountId: string }) {
    try {
      const vaultAccount = await this.fireBlocksSDK.getVaultAccountById(
        data.providerAccountId,
      );

      return vaultAccount;
    } catch (err: any) {
      console.log(err);
      throw new InternalServerErrorException({
        message: err.response?.data?.message ?? err.message,
      });
    }
  }

  async createVaultAccountWallet(data: {
    assetId: string;
    vaultAccountId: string;
  }): Promise<VaultAssetResponse> {
    try {
      const newVaultAccountWallet = await this.fireBlocksSDK.createVaultAsset(
        data.vaultAccountId,
        data.assetId,
      );

      return newVaultAccountWallet;
    } catch (err: any) {
      console.log(err);
      throw new InternalServerErrorException({
        message: err.response?.data?.message ?? err.message,
      });
    }
  }

  async getUserVaultWallets(filter: { userProviderVaultId: string }) {
    //const userVaultWallets = await this.fireblocks.get
  }

  async getSupportedAssets() {
    const supportedAssets = await this.fireBlocksSDK.getSupportedAssets();

    return supportedAssets;
  }

  async getVaultWalletBalance() {
    // const walletbalance = await this.fireblocks.getVaultAssetsBalance({
    //     //
    // })
  }

  static validateWebhookMessage(
    webhookPayload: string,
    headerSignature: string,
  ) {
    //const headerSignature = req.headers("Fireblocks-Signature");

    //console.log(webhookPayload, headerSignature);
    const verifier = createVerify('RSA-SHA512');
    verifier.write(webhookPayload);
    verifier.end();

    // FireblocksService.webhookPublicKey; //this line does nothing
    const isVerified = verifier.verify(
      FireblocksService.webhookPublicKey,
      headerSignature,
      'base64',
    );
    return isVerified;
  }
}
