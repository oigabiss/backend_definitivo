const analyticsRoutes = require('./modules/analytics/routes/analytics.routes');
const iotRoutes = require('./modules/iot/routes/iot.routes');
const notificationRoutes = require('./modules/notification/routes/notification.routes');
const authRoutes = require('./modules/auth/routes/auth.routes');
const userRoutes = require('./modules/user/routes/user.routes');

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'IoT Monitoring API running'
  });
});

app.get('/health', async (req, res) => {
  try {
    const sequelize = require('./shared/database/connection');
    await sequelize.authenticate();
    res.status(200).json({
      status: 'health',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    api: 'iot-monitoring',
    ml: 'isolation-forest',
    auth: 'online',
    bridge: 'online',
    timestamp: new Date().toISOString(),
  });
});

// ... [Outras rotas e middlewares] ...