/** Platform payment details shown to coaches (mock until live accounts). */
export const KOACHES_PAYMENT_DETAILS = {
  gcash: {
    label: "GCash",
    accountName: "PickleKoach",
    number: "0917 800 1234",
    note: "Send as Send Money. Use your invoice number as reference.",
  },
  bank: {
    label: "BDO Unibank",
    accountName: "PickleKoach Inc.",
    accountNumber: "0123 4567 8901",
    branch: "BGC High Street",
    note: "Include invoice number in transfer notes.",
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
