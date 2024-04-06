export function generateSalt() {
  const bytes = new Uint8Array(32); // 32 bytes = 256 bits
  window.crypto.getRandomValues(bytes);
  const hexString = Array.from(bytes, (byte) => byte.toString(16)).join("");
  const bigInt = BigInt(`0x${hexString}`);
  return bigInt;
}
