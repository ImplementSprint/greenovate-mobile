export const toMoney = (value: number) =>
  `PHP ${Number.isFinite(value) ? value.toFixed(2) : '0.00'}`;
