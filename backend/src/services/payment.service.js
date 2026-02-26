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

  return runInTransaction(async (transaction) => {

    // 1. verify hash
    const isValid = vnpayUtil.verifyHash(
      invoiceId,
      amount,
      vnp_SecureHash
    );

    if (!isValid) {
      throw new Error("Invalid signature");
    }

    if (vnp_ResponseCode !== "00") {
      throw new Error("Payment failed");
    }

    // 2. update payment
    await invoiceModel.updatePaymentStatus(
      transaction,
      invoiceId,
      "SUCCESS"
    );

    // 3. load invoice items
    const invoiceItems =
      await invoiceModel.getInvoiceItems(transaction, invoiceId);

    // 4. deduct stock
    await inventoryService.deductStock(transaction, invoiceItems);

    // 5. update invoice status
    await invoiceModel.updateStatus(
      transaction,
      invoiceId,
      "PAID"
    );

    return { paid: true };
  });
};

  return {
    createPayment,
    handleReturn,
  };
};

module.exports = createPaymentService;
