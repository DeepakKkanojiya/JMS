import app from './app';
import { config, printStartupSummary } from './config';

const PORT = config.server.port || 5000;

export const server = app.listen(PORT, () => {
  printStartupSummary();
  console.log(`[SERVER] Jewellery ERP REST API is running on http://localhost:${PORT}`);
  console.log(`[SERVER] API Prefix: ${config.server.apiPrefix}`);
  console.log(`[SERVER] Swagger Docs: http://localhost:${PORT}/docs`);
  console.log(`[SERVER] Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received. Closing HTTP server cleanly...');
  server.close(() => {
    console.log('[SERVER] HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[SERVER] SIGINT received. Closing HTTP server cleanly...');
  server.close(() => {
    console.log('[SERVER] HTTP server closed.');
    process.exit(0);
  });
});

export default server;
