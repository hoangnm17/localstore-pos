const crypto = require("crypto");
const QRCode = require("qrcode");

const createVnpayUtil = ({ secretKey }) => {

  const generateHash = (invoiceId, amount) => {
    const raw = `invoiceId=${invoiceId}&amount=${amount}`;
    return crypto.createHmac("sha512", secretKey).update(raw).digest("hex");
  };

  const verifyHash = (invoiceId, amount, hash) => {
    return generateHash(invoiceId, amount) === hash;
  };

  const generatePayUrl = (invoiceId, amount) => {
    const hash = generateHash(invoiceId, amount);

    return `http://localhost:3000/api/payment/return?invoiceId=${invoiceId}&amount=${amount}&vnp_ResponseCode=00&vnp_SecureHash=${hash}`;
  };

  const generateQR = async (url) => {
    return await QRCode.toDataURL(url);
  };

  return {
    generateHash,
    verifyHash,
    generatePayUrl,
    generateQR,
  };
};

module.exports = createVnpayUtil;
