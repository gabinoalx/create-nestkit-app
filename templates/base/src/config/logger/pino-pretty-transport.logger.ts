import { Transform } from 'node:stream';
import { LEVELS_LOGGER } from '.';

export default (opts: { [key: string]: unknown }) => {
  try {
    const formattedTime = (time: number): string => {
      const date = new Date(time);
      const pad = (n: number) => n.toString().padStart(2, '0');

      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1);
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());

      const isPM = hours >= 12;
      const hour12 = hours % 12 || 12;
      const ampm = isPM ? 'p. m.' : 'a. m.';

      const formattedTime = `${day}/${month}/${year}, ${hour12}:${minutes}:${seconds} ${ampm}`;

      return formattedTime;
    };

    const utf8Transform = new Transform({
      decodeStrings: false,
      encoding: 'utf8',
      transform(
        chunk: Buffer | string,
        encoding: BufferEncoding,
        callback: (error?: Error | null) => void,
      ) {
        try {
          if (!chunk || chunk.length === 0) {
            callback();
            return;
          }
          let output: string;
          if (Buffer.isBuffer(chunk)) output = chunk.toString('utf8');
          else if (typeof chunk === 'string') {
            if (encoding === 'utf8' || encoding === 'utf-8') output = chunk;
            else output = Buffer.from(chunk, encoding).toString('utf8');
          } else output = String(chunk);

          const canContinue = process.stdout.write(output, 'utf8');

          if (canContinue) callback();
          else
            process.stdout.once('drain', () => {
              callback();
            });
        } catch (err) {
          const error =
            err instanceof Error
              ? err
              : new Error(`Transform error: ${String(err)}`);
          callback(error);
        }
      },
      final(callback: (error?: Error | null) => void) {
        try {
          if (process.stdout.writableNeedDrain)
            process.stdout.once('drain', callback);
          else callback();
        } catch (err) {
          const error =
            err instanceof Error
              ? err
              : new Error(`Final error: ${String(err)}`);
          callback(error);
        }
      },
      destroy(error: Error | null, callback: (error: Error | null) => void) {
        process.stdout.removeAllListeners('drain');
        callback(error);
      },
    });
    utf8Transform.on('error', (err) => {
      console.error('[Logger] UTF-8 Transform error:', err);
    });

    return require('pino-pretty')({
      ...opts,
      colorize: true,
      colorizeObjects: true,
      errorLikeObjectKeys: ['err', 'error'],
      ignore: 'time,level,hostname,name,context,pid',
      destination: utf8Transform,
      messageFormat: (
        log: { [key: string]: unknown },
        messageKey: string,
        _: string,
        {
          colors,
        }: Record<string, { [key: string]: (value: string) => string }>,
      ) => {
        const levelNumber = log.level as keyof typeof LEVELS_LOGGER;
        const name: string = (log.name as string) || 'Nest';
        const pid: number = (log.pid as number) || 0;
        const colorFn = colors[LEVELS_LOGGER[levelNumber]?.color || 'red'];
        const context = colors.yellow(`[${log.context || 'UNKNOWN'}]`);
        const message = (log[messageKey] as string) || '';
        const time = colors.white(formattedTime(log.time as number));
        const level = colorFn(LEVELS_LOGGER[levelNumber]?.name || 'UNKNOWN');
        const lineLog = `[${name}] ${pid}  - ${time}   ${level} ${context} ${message}`;
        return colorFn(lineLog);
      },
    });
  } catch (error: unknown) {
    console.error('Error initializing custom logger transport:', error);
    return require('pino-pretty')({
      colorize: true,
    });
  }
};
