export function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const sequence = Math.floor(Math.random() * 900000) + 100000;
  return `CT-${datePart}-${sequence}`;
}
