const { verifyToken } = require("./auth.middleware");
const { authorize } = require("./permission.middleware");

const protect = (permission) => [
  verifyToken,
  authorize(permission)
];

module.exports = { protect };
