const express = require("express");
const router = express.Router();
const sseService = require("../services/sse.service");

router.get("/", (req, res) => {

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  /* keep connection alive */

  const keepAlive = setInterval(() => {
    res.write(":keepalive\n\n");
  }, 20000);

  /* send connected event */

  res.write(`data: ${JSON.stringify({ type: "CONNECTED" })}\n\n`);

  sseService.addClient(res);

  req.on("close", () => {
    clearInterval(keepAlive);
    sseService.removeClient(res);
  });

});

module.exports = router;