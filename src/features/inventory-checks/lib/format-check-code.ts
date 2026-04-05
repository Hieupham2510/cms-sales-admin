export function formatInventoryCheckCode(codeNo: number) {
  return `KK${String(codeNo).padStart(6, "0")}`;
}
