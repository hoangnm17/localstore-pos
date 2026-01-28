const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const routesApi = require("./routes/index.route")

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log(app)
// API Routes
routesApi(app);

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
