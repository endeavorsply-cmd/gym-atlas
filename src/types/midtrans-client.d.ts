declare module "midtrans-client" {
  export interface MidtransClientOptions {
    isProduction?: boolean;
    serverKey?: string;
    clientKey?: string;
  }

  export interface TransactionResult {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(options: MidtransClientOptions);
    createTransaction(
      parameter: Record<string, unknown>,
    ): Promise<TransactionResult>;
    createTransactionToken(parameter: Record<string, unknown>): Promise<string>;
    createTransactionRedirectUrl(
      parameter: Record<string, unknown>,
    ): Promise<string>;
  }

  export class CoreApi {
    constructor(options: MidtransClientOptions);
    charge(
      parameter: Record<string, unknown>,
    ): Promise<Record<string, unknown>>;
    transaction: {
      notification(body: unknown): Promise<Record<string, unknown>>;
      status(orderId: string): Promise<Record<string, unknown>>;
    };
  }

  const _default: { Snap: typeof Snap; CoreApi: typeof CoreApi };
  export default _default;
}
