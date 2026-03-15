const returnItemService = require('../services/returnItem.service');


const getReturnItems = async (req, res) => {
  try {

    const data = await returnItemService.getReturnItems(req.query);

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

const approveRestock = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user.id;

    const result = await returnItemService.approveRestock(id, staffId);

    res.json({
      success: true,
      message: "Restock approved",
      data: result
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

const rejectRestock = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user.id;

    
    const result = await returnItemService.rejectRestock(id, staffId);

    res.json({
      success: true,
      message: "Restock rejected",
      data: result
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
    getReturnItems,
    approveRestock,
    rejectRestock,
}