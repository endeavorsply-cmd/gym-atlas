import midtransClient from "midtrans-client";

/**
 * Membuat instance Midtrans Snap. Mengembalikan null bila server key belum
 * diisi agar aplikasi tetap bisa berjalan di mode demo.
 */
export function createSnapClient() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

  if (!serverKey) {
    return null;
  }

  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey,
    clientKey,
  });
}

export type CheckoutParams = {
  orderId: string;
  amount: number;
  planName: string;
  customer: {
    name: string;
    email: string;
  };
};

export function buildTransactionParameter(params: CheckoutParams) {
  return {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount,
    },
    item_details: [
      {
        id: params.planName.toLowerCase(),
        price: params.amount,
        quantity: 1,
        name: `Membership ${params.planName}`,
      },
    ],
    customer_details: {
      first_name: params.customer.name,
      email: params.customer.email,
    },
  };
}
