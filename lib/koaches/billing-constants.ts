/** Platform payment channels shown to coaches when an invoice is due. */
export type PaymentChannelId = "gcash" | "maya" | "bpi" | "unionbank";

export type PaymentChannel = {
  id: PaymentChannelId;
  label: string;
  /** QR image under /public/payments */
  qrSrc: string;
  /** Brand logo under /public/payments */
  logoSrc: string;
  hint: string;
};

export const KOACHES_PAYMENT_CHANNELS: PaymentChannel[] = [
  {
    id: "gcash",
    label: "GCash",
    qrSrc: "/payments/gcash.png",
    logoSrc: "/payments/logo-gcash.png",
    hint: "Open GCash → Scan QR → pay, then upload your receipt.",
  },
  {
    id: "maya",
    label: "Maya",
    qrSrc: "/payments/maya.png",
    logoSrc: "/payments/logo-maya.png",
    hint: "Open Maya → Scan QR → pay, then upload your receipt.",
  },
  {
    id: "bpi",
    label: "BPI",
    qrSrc: "/payments/bpi.png",
    logoSrc: "/payments/logo-bpi.png",
    hint: "Open BPI → Scan QR / Instapay → pay, then upload your receipt.",
  },
  {
    id: "unionbank",
    label: "UnionBank",
    qrSrc: "/payments/unionbank.png",
    logoSrc: "/payments/logo-unionbank.png",
    hint: "Open UnionBank → Scan QR / Instapay → pay, then upload your receipt.",
  },
];

/** @deprecated Prefer KOACHES_PAYMENT_CHANNELS */
export const KOACHES_PAYMENT_DETAILS = {
  gcash: {
    label: "GCash",
    accountName: "PickleKoach",
    number: "See QR",
    note: "Scan the GCash QR on the billing page.",
  },
  bank: {
    label: "Bank / Instapay",
    accountName: "PickleKoach",
    accountNumber: "See QR",
    branch: "BPI or UnionBank",
    note: "Scan the BPI or UnionBank QR on the billing page.",
  },
} as const;

export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;

export const RECEIPT_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export const RECEIPT_BUCKET = "coach-receipts";

export function paymentMethodLabel(method: string): string {
  switch (method) {
    case "gcash":
      return "GCash";
    case "maya":
      return "Maya";
    case "bpi":
      return "BPI";
    case "unionbank":
      return "UnionBank";
    case "bank_transfer":
      return "Bank transfer";
    default:
      return method;
  }
}

export function isPaymentChannelId(value: string): value is PaymentChannelId {
  return KOACHES_PAYMENT_CHANNELS.some((c) => c.id === value);
}
