const invoiceService = require("../services/invoice.service");

/* =====================================================
   HELPER: HANDLE ERROR
===================================================== */
const handleError = (res, err) => {
  console.error(err);

  // Ưu tiên statusCode nếu sau này service có thêm
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

/* =====================================================
   GET ALL (Pagination)
===================================================== */
const getAllInvoice = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      invoiceCode // Lấy từ query string (?invoiceCode=INV001)
    } = req.query;
    console.log(req.query);
    
    // Clean & validate
    const currentPage = Number(page) > 0 ? Number(page) : 1;
    const limit = Number(pageSize) > 0 ? Number(pageSize) : 10;
    const cleanInvoiceCode = invoiceCode?.trim(); // Xóa khoảng trắng thừa

    // Validate status enum
    const allowedStatus = ["UNPAID", "PAID", "CANCELLED"];
    const cleanStatus = status?.trim();

    if (cleanStatus && !allowedStatus.includes(cleanStatus)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái hóa đơn không hợp lệ"
      });
    }

    // Gọi service với đầy đủ các filter
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

/* =====================================================
   CREATE INVOICE
===================================================== */
const createInvoice = async (req, res) => {
  try {
    const staffId = req.user?.id;
    const counterId = req.user?.counterId;

    if (!staffId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!counterId) {
      return res.status(500).json({
        success: false,
        message: "Missing Counter",
      })
    }

    const result = await invoiceService.createInvoice({
      ...req.body,
      staffId,
      counterId,
    });

    return res.status(201).json({
      success: true,
      data: result,
    });

  } catch (err) {
    return handleError(res, err);
  }
};

const payCash = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await invoiceService.payCash(id, req.body);

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (err) {
    return handleError(res, err);
  }
};

const payBank = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await invoiceService.payBank(id, req.body);

    return res.status(200).json({
      success: true,
      ...result,
    });

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

/* =====================================================
   UPDATE INVOICE
===================================================== */
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

/* =====================================================
   GET DRAFTS
===================================================== */
const getDrafts = async (req, res) => {
  try {
    const data = await invoiceService.getDraftInvoices();

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (err) {
    return handleError(res, err);
  }
};

/* =====================================================
   GET DETAIL
===================================================== */
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
  payBank,
  payCash,
  cancelInvoice,
  updateInvoiceItems,
};