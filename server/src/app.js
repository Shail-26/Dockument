const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const blockchainRoutes = require("./routes/blockchain");
const ipfsRoutes = require("./routes/ipfs");
const fileRoutes = require("./routes/files");
const authRoutes = require("./routes/auth");
const limiter = require("./middleware/rateLimit");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(limiter);

app.get("/", (req, res) => res.send("Blockchain API is running..."));

app.use("/api", blockchainRoutes);
app.use("/api", fileRoutes);
app.use("/api", ipfsRoutes);
app.use("/api", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
