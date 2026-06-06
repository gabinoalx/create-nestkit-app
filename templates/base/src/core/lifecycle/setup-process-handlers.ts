export function setupProcessHandlers(): void {
  const MAX_AWAIT_TIMEOUT = 10000;
  const PROCESS_SIGNALS: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  let TIMEOUT_STARTED: boolean = false;

  process.on('uncaughtException', () => process.exit(1));
  process.on('unhandledRejection', () => process.exit(1));
  process.on('multipleResolves', () =>
    console.warn('MULTIPLE RESOLVES DETECTED'),
  );
  process.on('warning', () => console.warn('PROCESS WARNING'));

  PROCESS_SIGNALS.forEach((signal) => {
    process.once(signal, () => {
      if (TIMEOUT_STARTED) return;
      TIMEOUT_STARTED = true;
      const shutdownTimeout = setTimeout(
        () => process.exit(1),
        MAX_AWAIT_TIMEOUT,
      );
      shutdownTimeout.unref();
    });
  });
}
