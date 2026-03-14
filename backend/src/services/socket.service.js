const { getIO } = require("../utils/socket");

const emitInventoryUpdate = (items) => {

  const io = getIO();

  io.emit("inventory:update", {
    items
  });

};

module.exports = {
  emitInventoryUpdate
};