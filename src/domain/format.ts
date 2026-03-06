export const ccy = (n: number) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );

export const pct = (n: number) => `${(n * 100).toFixed(2)}%`;
