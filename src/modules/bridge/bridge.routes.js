/**
 * bridge.routes.js
 *
 * Rotas "ponte" entre o frontend IronWall e a API IoT existente.
 * Agrupa dados de múltiplos módulos e os entrega no formato que o dashboard espera.
 *
 * Registrar no server.js:
 *   const bridgeRoutes = require('./modules/bridge/bridge.routes');
 *   app.use('/api', bridgeRoutes);
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../../shared/middleware/authMiddleware');

// Modelos (acesso direto para queries agregadas)
const { sequelize, Device, SensorReading, Anomaly, Notification } = require('../../shared/database/associations');
const { Op } = require('sequelize');

// ── Todas as rotas bridge exigem autenticação ──
router.use(authMiddleware);

// ════════════════════════════════════════════
//  GET /api/stats
//  Retorna contadores gerais do dashboard
// ════════════════════════════════════════════
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalDispositivos = await Device.count({ where: { userId } });

    const deviceIds = (await Device.findAll({
      where: { userId },
      attributes: ['id'],
      raw: true
    })).map(d => d.id);

    const totalAnalises = deviceIds.length
      ? await SensorReading.count({ where: { deviceId: { [Op.in]: deviceIds } } })
      : 0;

    const anomalias = deviceIds.length
      ? await Anomaly.findAll({
          where: { deviceId: { [Op.in]: deviceIds } },
          attributes: ['severity', 'anomalyScore'],
          raw: true
        })
      : [];

    const totalVulns = anomalias.length;

    const byseverity = { critical: 0, high: 0, medium: 0, low: 0 };
    let somaScores = 0;
    for (const a of anomalias) {
      const s = (a.severity || '').toLowerCase();
      if (byseverity[s] !== undefined) byseverity[s]++;
      somaScores += parseFloat(a.anomalyScore || 0);
    }
    const riscoMedio = totalVulns > 0 ? (somaScores / totalVulns).toFixed(4) : '0.0000';

    res.json({
      status: 'success',
      analises:        totalAnalises,
      vulnerabilidades: totalVulns,
      dispositivos:    totalDispositivos,
      riscoMedio,
      critica: byseverity.critical,
      alta:    byseverity.high,
      media:   byseverity.medium,
      baixa:   byseverity.low,
    });
  } catch (err) {
    next(err);
  }
});

// ════════════════════════════════════════════
//  GET /api/history?days=30
//  Histórico de anomalias por dia, separado por severidade
// ════════════════════════════════════════════
router.get('/history', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const days   = Math.min(parseInt(req.query.days) || 30, 90);
    const since  = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const deviceIds = (await Device.findAll({
      where: { userId },
      attributes: ['id'],
      raw: true
    })).map(d => d.id);

    if (!deviceIds.length) {
      return res.json({ status: 'success', labels: [], critica: [], alta: [], media: [], baixa: [] });
    }

    const anomalias = await Anomaly.findAll({
      where: {
        deviceId: { [Op.in]: deviceIds },
        detectedAt: { [Op.gte]: since }
      },
      attributes: ['severity', 'detectedAt'],
      raw: true
    });

    // Agrupa por data (DD/MM)
    const mapa = {};
    for (const a of anomalias) {
      const dia = new Date(a.detectedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!mapa[dia]) mapa[dia] = { critica: 0, alta: 0, media: 0, baixa: 0 };
      const s = (a.severity || '').toLowerCase();
      if (s === 'critical') mapa[dia].critica++;
      else if (s === 'high') mapa[dia].alta++;
      else if (s === 'medium') mapa[dia].media++;
      else mapa[dia].baixa++;
    }

    const labels  = Object.keys(mapa).sort();
    const critica = labels.map(l => mapa[l].critica);
    const alta    = labels.map(l => mapa[l].alta);
    const media   = labels.map(l => mapa[l].media);
    const baixa   = labels.map(l => mapa[l].baixa);

    res.json({ status: 'success', labels, critica, alta, media, baixa });
  } catch (err) {
    next(err);
  }
});

// ════════════════════════════════════════════
//  GET /api/analyses?limit=5
//  Últimas leituras com resultado de anomalia
// ════════════════════════════════════════════
router.get('/analyses', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit  = Math.min(parseInt(req.query.limit) || 5, 50);

    const deviceIds = (await Device.findAll({
      where: { userId },
      attributes: ['id'],
      raw: true
    })).map(d => d.id);

    if (!deviceIds.length) return res.json([]);

    // Pega as últimas anomalias com device incluído
    const anomalias = await Anomaly.findAll({
      where: { deviceId: { [Op.in]: deviceIds } },
      include: [{ model: Device, as: 'device', attributes: ['name'] }],
      order: [['detectedAt', 'DESC']],
      limit
    });

    const resultado = anomalias.map(a => ({
      arquivo:          a.device ? a.device.name : a.deviceId,
      risco:            mapSeverity(a.severity),
      vulnerabilidades: 1,
      data:             new Date(a.detectedAt).toLocaleDateString('pt-BR'),
      score:            a.anomalyScore
    }));

    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

// ════════════════════════════════════════════
//  POST /api/analyze
//  Recebe dados de sensor, cria leitura e dispara ML
// ════════════════════════════════════════════
router.post('/analyze', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { device_id, temperatura, pressao, frequencia } = req.body;

    if (!device_id) {
      return res.status(400).json({ status: 'error', message: 'device_id é obrigatório' });
    }

    // Verifica se o dispositivo pertence ao usuário (ou cria se não existir)
    let device = await Device.findOne({ where: { id: device_id, userId } });

    if (!device) {
      // Tenta buscar pelo nome
      device = await Device.findOne({ where: { name: device_id, userId } });
    }

    if (!device) {
      return res.status(404).json({
        status: 'error',
        message: 'Dispositivo não encontrado. Cadastre o dispositivo antes de enviar dados.'
      });
    }

    // Cria leitura de sensor
    const reading = await SensorReading.create({
      deviceId:    device.id,
      temperature: parseFloat(temperatura) || null,
      pressure:    parseFloat(pressao)     || null,
      vibration:   parseFloat(frequencia)  || null,
    });

    // Retorna resposta imediata; o ML roda assincronamente via eventBus
    // (AnalyticsService escuta o evento SENSOR_DATA_RECEIVED)
    const { EVENTS } = require('../../shared/config/constants');
    const eventBus   = require('../../shared/events/eventBus');
    eventBus.emit(EVENTS.SENSOR_DATA_RECEIVED, {
      reading: reading.toJSON(),
      device:  device.toJSON()
    });

    // Aguarda um momento para ver se uma anomalia foi detectada
    await new Promise(r => setTimeout(r, 500));

    const anomaly = await Anomaly.findOne({
      where: { deviceId: device.id },
      order: [['detectedAt', 'DESC']]
    });

    const score   = anomaly ? parseFloat(anomaly.anomalyScore) : 0;
    const anomalia = score > 0.6;
    const acao    = !anomalia ? 'normal' : score > 0.9 ? 'isolamento' : 'alerta';

    res.json({
      status:   'success',
      score,
      anomalia,
      acao,
      severity: anomaly ? anomaly.severity : null,
      readingId: reading.id
    });
  } catch (err) {
    next(err);
  }
});

// ════════════════════════════════════════════
//  POST /api/dashboard-update  (compatibilidade)
// ════════════════════════════════════════════
router.post('/dashboard-update', (req, res) => {
  // Endpoint de compatibilidade — os dados já foram salvos via /api/analyze
  res.json({ status: 'success', message: 'ok' });
});

// ── Helper ──
function mapSeverity(s) {
  const m = { critical: 'Crítico', high: 'Alto', medium: 'Médio', low: 'Baixo' };
  return m[(s || '').toLowerCase()] || 'Baixo';
}

module.exports = router;