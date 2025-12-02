// utils/generateOTP.util.js
export const generateOTP = (length = 6, expiryMinutes = 5) => {
  // generate numeric OTP of specified length (leading zeros allowed)
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  // when length == 1, min should be 0
  const otpNumber = (length === 1)
    ? Math.floor(Math.random() * 10).toString()
    : (Math.floor(Math.random() * (max - min + 1)) + min).toString();

  const expiryDate = new Date(Date.now() + expiryMinutes * 60 * 1000);

  return {
    otpNumber,               // string
    expiryDate,       // Date object
    expiryMinutes                  // number
  };
};
