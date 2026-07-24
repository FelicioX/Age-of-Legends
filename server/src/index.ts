import Fastify from 'fastify';
import { WebSocketServer, type WebSocket } from 'ws';
import { PROTOCOL_VERSION, parseClientMessage } from '@aol/shared';
import { loadConfig } from './config.js';
import { WorldRuntime } from './world/runtime.js';

/**
 * Server entry point.
 *
 * Composes the HTTP API (health/meta), the authoritative WebSocket gateway and
 * the world simulation runtime. This is the process boundary; game rules live
 * in `@aol/game` and are executed by the runtime.
 */
async function main(): Promise<void> {
  const config = loadConfig();
  const runtime = new WorldRuntime(config);
  runtime.start();

  // --- HTTP API ------------------------------------------------------------
  const app = Fastify({ logger: true });

  app.get('/health', () => ({
    status: 'ok',
    protocolVersion: PROTOCOL_VERSION,
    shardId: config.shardId,
    tick: runtime.tick,
  }));

  await app.listen({ host: config.apiHost, port: config.apiPort });

  // --- Realtime gateway ----------------------------------------------------
  const wss = new WebSocketServer({ host: config.wsHost, port: config.wsPort });

  wss.on('connection', (socket: WebSocket) => {
    socket.on('message', (data: Buffer) => {
      const result = parseClientMessage(data.toString('utf8'));
      if (!result.ok) {
        socket.send(JSON.stringify({ type: 'error', code: 'bad_message', message: result.error }));
        return;
      }
      // Intent handling and authoritative validation are implemented in the
      // networking milestone; the message has been validated at the boundary.
      if (result.value.type === 'handshake') {
        socket.send(
          JSON.stringify({
            type: 'handshakeAck',
            protocolVersion: PROTOCOL_VERSION,
            playerId: 'pending',
            shardId: config.shardId,
            serverTick: runtime.tick,
          }),
        );
      }
    });
  });

  const shutdown = (): void => {
    runtime.stop();
    wss.close();
    void app.close();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  app.log.info(`Realtime gateway listening on ws://${config.wsHost}:${config.wsPort}`);
}

main().catch((error: unknown) => {
  console.error('Fatal server error:', error);
  process.exit(1);
});
