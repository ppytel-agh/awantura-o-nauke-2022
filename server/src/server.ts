import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import mongoose from 'mongoose';
import SocketIO from 'socket.io';

import * as room from './sockets/room.socket';
import * as question from './sockets/question.socket';
import { UserSocket } from './utils/socket.utils';
import { Incoming } from './utils/event.constants';
import { AddressInfo } from 'net';

export { ClashServer };

dotenv.config();

class ClashServer {
  private app: express.Application;
  private server: http.Server;
  private io: SocketIO.Server;
  private port: number;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = SocketIO(this.server, { serveClient: false });
  }

  start(port?: number) {
    this.configure();
    if (port) {
      this.server.listen(port, () => console.log(`[INFO] Server listening at port ${port}`));
      this.port = port;
    } else {
      this.server.listen(0, () => {
        this.port = (this.server.address() as AddressInfo).port;
        console.log(`[INFO] Server listening at port ${this.port}`);
      });
    }
  }

  stop() {
    this.server.close(() => console.log(`[INFO] Server stopped`));
  }

  async connectMongo(uri: string) {
    await mongoose.connect(uri, {
      useUnifiedTopology: true,
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false
    });
  }

  async disconnectMongo() {
    await mongoose.disconnect();
  }

  getPort() {
    return this.port;
  }

  private configure() {
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.json());
    this.app.use(cors());

    this.io.on(Incoming.CONNECT, (socket: UserSocket) => {
      console.log(`New user connected: ${socket.id}`);

      question.listen(this.io, socket);
      room.listen(this.io, socket);
    });

    this.app.use((_req: Request, res: Response, _next: NextFunction) => {
      res.status(404).sendFile(path.join(__dirname, '/../public/index.html'));
    });
  }
}

if (require.main === module) {
  const server = new ClashServer();
  const port = parseInt(process.env.SERVER_PORT);
  const mongoUri = process.env.MONGODB_URI;

  server
    .connectMongo(mongoUri)
    .then(() => server.start(port))
    .catch((err: Error) => {
      console.log(err);
    });
}
