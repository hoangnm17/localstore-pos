const invoiceService = require("../services/invoice.service");
const { COUNTER_ID } = require("../config/pos.config")

const handleError = (res, err) => {
  console.error(err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Chuẩn hóa not found
  if (err.message?.toLowerCase().includes("not found")) {
    return res.status(404).json({
      success: false,
      message: err.message,
    });
  }

  // Business error mặc định
  return res.status(400).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

const getAllInvoice = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      invoiceCode 
    } = req.query;
    
    const currentPage = Number(page) > 0 ? Number(page) : 1;
    const limit = Number(pageSize) > 0 ? Number(pageSize) : 10;
    const cleanInvoiceCode = invoiceCode?.trim();

    const allowedStatus = ["UNPAID", "PAID", "CANCELLED", "PENDING"];
    const cleanStatus = status?.trim();

    if (cleanStatus && !allowedStatus.includes(cleanStatus)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái hóa đơn không hợp lệ"
      });
    }

    const result = await invoiceService.getAllInvoice({
      page: currentPage,
      pageSize: limit,
      status: cleanStatus,
      invoiceCode: cleanInvoiceCode
    });

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (err) {
    return handleError(res, err);
  }
};

const createInvoice = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) 
      return res.status(401).json({ 
    success: false, 
    message: "Unauthorized" 
  });

    const { staffId } = await invoiceService.syncCounter(userId, COUNTER_ID);

    const result = await invoiceService.createInvoice({
      ...req.body,
      staffId,
      counterId: COUNTER_ID,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return handleError(res, err);
  }
};


const cancelInvoice = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await invoiceService.cancelInvoice(id);

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (err) {
    return handleError(res, err);
  }
};

const updateInvoiceItems = async (req, res) => {
  try {

    const id = Number(req.params.id);

    const result = await invoiceService.updateInvoiceItems(
      id,
      req.body
    );

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    return handleError(res, err);
  }
};

const updateInvoice = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice id",
      });
    }

    await invoiceService.updateInvoice(id, req.body);

    return res.status(200).json({
      success: true,
    });

  } catch (err) {
    return handleError(res, err);
  }
};

const getDrafts = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    await invoiceService.syncCounter(userId, COUNTER_ID);

    const data = await invoiceService.getDraftInvoices();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return handleError(res, err);
  }
};

const getDetail = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice id",
      });
    }

    const data = await invoiceService.getInvoiceDetail(id);

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (err) {
    return handleError(res, err);
  }
};

const updateInvoiceCustomer = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    const result = await invoiceService.updateInvoiceCustomer(
      invoiceId,
      req.body
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllInvoice,
  createInvoice,
  updateInvoice,
  getDrafts,
  getDetail,
  updateInvoiceCustomer,
  cancelInvoice,
  updateInvoiceItems,
};