const createPaymentService = ({
  invoiceModel,
  invoiceItemModel,
  paymentModel,
  vnpayModel,
  vnpayUtil,
}) => {

  const createPayment = async (data) => {
    const invoiceCode = "INV" + Date.now();

    const invoiceId = await invoiceModel.createInvoice({
      invoiceCode,
      staffId: data.staffId,
      counterId: data.counterId,
      customerId: data.customerId,
      total: data.total,
    });

    for (const item of data.items) {
      await invoiceItemModel.createItem({
        ...item,
        invoiceId,
      });
    }

    await paymentModel.createPayment({
      invoiceId,
      amount: data.total,
    });

    const payUrl = vnpayUtil.generatePayUrl(invoiceId, data.total);

    await vnpayModel.createVnPayTransaction({
      invoiceId,
      txnRef: invoiceCode,
      payUrl,
    });

    const qrCode = await vnpayUtil.generateQR(payUrl);

    return {
      invoiceId,
      invoiceCode,
      qrCode,
      payUrl,
    };
  };

  const handleReturn = async (query) => {
    const { invoiceId, amount, vnp_ResponseCode, vnp_SecureHash } = query;

    if (!vnpayUtil.verifyHash(invoiceId, amount, vnp_SecureHash)) {
      throw new Error("Invalid signature");
    }

    const paymentStatus =
      vnp_ResponseCode === "00" ? "SUCCESS" : "FAILED";

    const invoiceStatus =
      vnp_ResponseCode === "00" ? "PAID" : "CANCELLED";

    await paymentModel.updateStatus(invoiceId, paymentStatus);
    await invoiceModel.updateStatus(invoiceId, invoiceStatus);
    await vnpayModel.updateStatus(
      invoiceId,
      paymentStatus,
      vnp_ResponseCode
    );

    return {
      invoiceId,
      invoiceStatus,
    };
  };

  return {
    createPayment,
    handleReturn,
  };
};

module.exports = createPaymentService;
