const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const settingRoutes = require('./routes/setting.routes');

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

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});