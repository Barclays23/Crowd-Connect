import crypto from 'crypto';

export function generateCryptoToken(
  byteLength: number = 16,
  expiryMinutes: number = 30
): {
  cryptoToken: string;
  expiryDate: Date;
  expiryMinutes: number;
} {
  
  const cryptoToken = crypto.randomBytes(byteLength).toString('hex');

  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);

  return {
    cryptoToken,
    expiryDate,
    expiryMinutes,
  };
}