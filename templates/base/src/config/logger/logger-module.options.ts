import { type Params } from 'nestjs-pino';
import { resolve } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@config/envs';

export const loggerModuleOptions = (
  configService: ConfigService<EnvConfig, true>,
): Params => {
  const appName = configService.get('APP_NAME', { infer: true });
  const level = configService.get('MIN_LOG_LEVEL', { infer: true });

  return {
    pinoHttp: {
      level,
      name: appName,
      autoLogging: false,
      // useLevel: 'error',
      // customProps: (req, res) => ({
      //   context: 'HTTP',
      //   reqId: req?.id,
      // }),
      // genReqId: (req, res) => {
      //   return randomUUID();
      // },
      // customSuccessMessage: (req, res) => {
      //   return `${req.method} ${req.url} ${res.statusCode}`;
      // },
      transport: {
        targets: [
          {
            target: require.resolve(
              resolve(__dirname, 'pino-pretty-transport.logger'),
            ),
          },
          // {
          //   target: 'pino/file',
          //   level: 'info',
          //   options: {
          //     colorize: false,
          //     destination: './logs/info.log',
          //     mkdir: true,
          //   },
          // },
        ],
      },
      serializers: {
        req: (req) => undefined,
        res: (res) => undefined,
      },
      redact: ['password'],
      formatters: {
        log: (object) => {
          if ('name' in object) {
            const { name, ...rest } = object;
            return {
              'name ': name,
              ...rest,
            };
          }
          return object;
        },
      },
    },
  };
};
