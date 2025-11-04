const express = require("express");
const cors = require("cors");
const parkingRoutes = require("./routes/parking");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/parking", parkingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
