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
    const { page = 1, pageSize = 10 } = req.query;

    const result = await invoiceService.getAllInvoice({
      page: Number(page),
      pageSize: Number(pageSize),
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
    const counterId = req.counterId;

    if (!staffId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
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

module.exports = {
  getAllInvoice,
  createInvoice,
  updateInvoice,
  getDrafts,
  getDetail,
};