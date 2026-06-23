const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sequelize } = require('./shared/database/associations'); // Inicializa conexão e associações
const app = require('./server');
const logger = require('./shared/logger/logger');

// Importar serviços para registrar listeners de eventos
const analyticsService = require('./modules/analytics/services/analytics.service');
const notificationService = require('./modules/notification/services/notification.service');
const securityAuditService = require('./shared/services/securityAudit.service');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // 1. Connect to Database
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');

    // 2. Sync Models
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
      logger.info('Database models synced.');
    }

    // 3. Register Event Listeners
    securityAuditService.registerListeners();
    analyticsService.registerListeners();
    notificationService.registerListeners();
    logger.info('Event listeners registered.');

    // 4. Start Server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });

  } catch (error) {
    logger.error('Failed to start the application:', error);
    process.exit(1);
  }
}

bootstrap();