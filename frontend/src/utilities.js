// src/utils.js

export const STATUS_LABELS = {
  payee: "Payée",
  non_payee: "Non payée"
};

export const STATUS_CLASS = {
  payee: "badge badge-paid",
  non_payee: "badge badge-unpaid"
};

export const formatCurrency = (amount) => {
  return Number(amount).toFixed(2) + " MAD";
};