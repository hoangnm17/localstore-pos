const returnService = require("../services/return.service")


const getReturns = async (req, res) => {
  try {

    const { status, page, pageSize } = req.query;

    const data = await returnService.getReturns({
      status,
      page,
      pageSize
    });

    res.json({
      success: true,
      ...data
    });

  } catch (err) {

    res.status(400).json({
      success: false,
      message: err.message
    });

  }
};

const getReturnDetail = async (req, res) => {
  try {

    const data = await returnService.getReturnDetail(req.params.id);

    res.json({
      success: true,
      data
    });

  } catch (err) {

    res.status(400).json({
      success: false,
      message: err.message
    });

  }
};

const createReturn = async (req, res) => {
    
    
    try {
        const data = await returnService.createReturn(req.user, req.body);

        res.json({
            success: true,
            data
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

const approveReturn = async (req, res) => {
    try {
        const data = await returnService.approveReturn(req.user, req.params.id);
        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const rejectReturn = async (req, res) => {
    try {

        const data = await returnService.rejectReturn(
            req.user,
            req.params.id,
        );

        res.json({
            success: true,
            data
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }
};

const restockReturn = async (req, res) => {
    try {
        const data = await returnService.restockReturn(
            req.user,
            req.params.id,
            req.body.items || []
        );
        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

module.exports = {
    getReturns,
    getReturnDetail,
    createReturn,
    approveReturn,
    restockReturn,
    rejectReturn,
}