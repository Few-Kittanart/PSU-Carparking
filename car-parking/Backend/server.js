const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const settingRoutes = require('./routes/setting.routes');
const priceRoutes = require('./routes/price.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
connectDB();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/customers', require('./routes/customer.routes'));
app.use('/api/settings', settingRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/price', priceRoutes);
app.use('/api/cars', require('./routes/car.routes'));
app.use('/api/serviceHistories', require('./routes/serviceHistory.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/', require('./routes/transaction.routes'));

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});