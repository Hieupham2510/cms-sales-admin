export function generateProductSku() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `LC${random}`;
}

export function generateCustomerCode() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `KH${random}`;
}
