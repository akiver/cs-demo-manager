import path from 'node:path';
import type { ChildProcess } from 'node:child_process';
import { fork } from 'node:child_process';
import { app } from 'electron';

export function createWebSocketServerProcess() {
  const serverFilePath = path.join(app.getAppPath(), 'server.js');
  const serverProcess: ChildProcess = fork(serverFilePath, {
    silent: true, // pipe back all outputs to the main process to log possible fork() errors
    env: process.env, // Inject all variables created from the main Electron process to make them accessible from the server process.
  });
  let isProcessStarted = false;

  serverProcess.stderr?.on('data', (data) => {
    if (isProcessStarted) {
      return;
    }

    // If we reach this path, it means that the fork() failed :/
    logger.error(data.toString());
  });

  serverProcess.on('exit', (code, signal) => {
    logger.log(`server process exited with code ${code} and signal ${signal}`);
  });

  serverProcess.on('message', (message) => {
    logger.log('server process received message', message);
    if (message === 'pong') {
      isProcessStarted = true;
    }
  });

  serverProcess.on('error', (error) => {
    logger.log('server process error', error);
  });

  serverProcess.on('close', (code, signal) => {
    logger.log(`server process closed with code ${code} and signal ${signal}`);
  });

  app.on('quit', () => {
    serverProcess.kill();
  });

  // Used to check if the fork() call succeed and so the server process is alive.
  serverProcess.send('ping');
}
