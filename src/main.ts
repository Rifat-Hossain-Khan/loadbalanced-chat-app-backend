import { randomUUID } from "crypto";
import dotenv from "dotenv";
import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyIO from "fastify-socket.io";
import Redis from "ioredis";
import closeWithGrace from "close-with-grace";

dotenv.config();

const PORT = parseInt(process.env.PORT ?? "3001", 10);
const HOST = process.env.HOST ?? "0.0.0.0";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;

const CONNECTION_COUNT_KEY = "chat:connection-count";
const CONNECTION_COUNT_UPDATED_CHANNEL = "chat:connection-count-updated";
const NEW_MSG_CHANNEL = "chat:new-message";

if (!UPSTASH_REDIS_REST_URL) {
  console.error("Missing UPSTASH_REDIS_REST_URL");
  process.exit(1);
}

const publisher = new Redis(UPSTASH_REDIS_REST_URL);
const subscriber = new Redis(UPSTASH_REDIS_REST_URL);

let connectedClients = 0;

const buildServer = async () => {
  const app = fastify();

  await app.register(fastifyCors, {
    origin: CORS_ORIGIN,
  });

  await app.register(fastifyIO);

  const currentCount = await publisher.get(CONNECTION_COUNT_KEY);

  if (!currentCount) {
    await publisher.set(CONNECTION_COUNT_KEY, 0);
  }

  app.io.on("connection", async (io) => {
    console.log("Client connected");

    const incResult = await publisher.incr(CONNECTION_COUNT_KEY);

    connectedClients++;

    await publisher.publish(
      CONNECTION_COUNT_UPDATED_CHANNEL,
      String(incResult)
    );

    io.on(NEW_MSG_CHANNEL, async (payload) => {
      const message = payload.message;
      if (!message) return;
      await publisher.publish(NEW_MSG_CHANNEL, message.toString());
    });

    io.on("disconnect", async () => {
      console.log("Client disconnected");
      const decrResult = await publisher.decr(CONNECTION_COUNT_KEY);

      connectedClients--;

      await publisher.publish(
        CONNECTION_COUNT_UPDATED_CHANNEL,
        String(decrResult)
      );
    });
  });

  subscriber.subscribe(CONNECTION_COUNT_UPDATED_CHANNEL, (err, count) => {
    if (err) {
      console.error(
        `Error subscribing to ${CONNECTION_COUNT_UPDATED_CHANNEL}`,
        err
      );

      return;
    }

    console.log(
      `${count} clients subscribes  to ${CONNECTION_COUNT_UPDATED_CHANNEL} channel`
    );
  });

  subscriber.subscribe(NEW_MSG_CHANNEL, (err, count) => {
    if (err) {
      console.error(`Error subscribing to ${NEW_MSG_CHANNEL}`, err);

      return;
    }

    console.log(`${count} clients subscribes to ${NEW_MSG_CHANNEL} channel`);
  });

  subscriber.on("message", (channel, text) => {
    if (channel === CONNECTION_COUNT_UPDATED_CHANNEL) {
      app.io.emit(CONNECTION_COUNT_UPDATED_CHANNEL, {
        count: text,
      });
      return;
    }
    if (channel === NEW_MSG_CHANNEL) {
      app.io.emit(NEW_MSG_CHANNEL, {
        message: text,
        id: randomUUID(),
        createdAt: new Date(),
        port: PORT,
      });
      return;
    }
  });

  app.get("/healthcheck", () => {
    return {
      status: "ok",
      port: PORT,
    };
  });

  return app;
};

const main = async () => {
  try {
    const app = await buildServer();
    await app.listen({ port: PORT, host: HOST });
    console.log(`Server started at http://${HOST}:${PORT}`);

    closeWithGrace({ delay: 500 }, async () => {
      if (connectedClients > 0) {
        const currentCount = parseInt(
          (await publisher.get(CONNECTION_COUNT_KEY)) || "0",
          10
        );
        const newCount = Math.max(currentCount - connectedClients, 0);

        await publisher.set(CONNECTION_COUNT_KEY, newCount);
      }
      await app.close();

      console.log("Shutdown complete. Goodbye");
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
