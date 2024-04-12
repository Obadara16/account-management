const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const fundRoutes = require("./routes/fund");
const transactionRoutes = require("./routes/transaction");
const cors = require("cors");


const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.path);
  next();
});

app.use("/uploads", express.static("uploads"));

app.use(cors({
  origin: '*',
}));



mongoose.set("strictQuery", true);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server Running and Database Connected");
    });
  })
  .catch((err) => {
    console.log(err);
  });


app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/fund", fundRoutes);
app.use("/api/transaction", transactionRoutes);
