# create-nestkit-app

> Genera proyectos NestJS sin pelearte con el setup.

CLI para arrancar proyectos NestJS con todo lo que normalmente terminas configurando a mano cada vez: validación de envs con Zod, logger estructurado con Pino, filtros globales, Prisma con `adapter-pg`, path aliases y auth con JWT. Las versiones siempre son frescas — no es un template estático.

## Empezar

```bash
npm create nestkit-app@latest
```

```bash
pnpm create nestkit-app@latest
```

```bash
yarn create nestkit-app@latest
```

El CLI pregunta el nombre del proyecto y el package manager, y se encarga del resto.

## Vista previa

```
$ npm create nestkit-app@latest

◆  create-nestkit
│
◇  What is the name of the project?
│  my-api
│
◇  Package manager?
│  pnpm
│
◆  Generating your project...
│
◆  Proyecto "my-api" creado.
```

Cuando termina:

```bash
cd my-api
pnpm start:dev
```

## ¿Qué incluye?

- **NestJS** — con la versión que `@nestjs/cli new` provea en el momento. No congela versiones en un template.
- **Prisma + `@prisma/adapter-pg`** — `PrismaService` global, pool con `max/min/timeouts` razonables, lifecycle hooks, cliente generado en `src/prisma/generated`. Filtro `PrismaExceptionFilter` que mapea errores conocidos a HTTP status correctos (`P2002 → 409`, `P2025 → 404`, `P2003 → 400`).
- **Pino logger** — transport custom con pretty-print legible, niveles tipados, redacción de campos sensibles (`password` y los que añadas), integración con `nestjs-pino` y `nestjs-cls`.
- **Zod + `nestjs-zod`** — schema de envs tipado, validación al arranque (si falta una env, el proyecto no levanta), DTOs con `createZodDto`, `ZodValidationPipe` global. `ConfigService<EnvConfig, true>` tipado en todo el proyecto.
- **Auth con JWT** (opcional, en roadmap volverla seleccionable) — access + refresh tokens, rotación con detección de reuse, revocación por familia, Passport strategies (local + JWT + JWT-refresh), cookies `httpOnly` con `sameSite: strict`, hashing con bcrypt + salt.
- **Path aliases** — `@common/*`, `@config/*`, `@core/*`, `@modules/*`, `@prisma-orm/*`. Configurados en `tsconfig.json`, resueltos por `nest build` sin más config.
- **Estructura por capas** — `common`, `config`, `core`, `modules`. Separación de responsabilidades desde el primer commit, no después de refactor.
