const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const routesApi = require("./routes/index.route")

const { connectDB } = require("./config/database");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

connectDB();

// API Routes
routesApi(app);

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
