const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const routesApi = require("./routes/index.route")
const { initSocket } = require("./utils/socket");
const http = require("http");
const { connectDB } = require("./config/database");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// API Routes
routesApi(app);

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
