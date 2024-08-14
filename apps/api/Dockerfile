###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18 AS development
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

WORKDIR /usr/src/app

COPY --chown=node:node pnpm-lock.yaml ./

RUN pnpm fetch --prod

COPY --chown=node:node . .

RUN pnpm install

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:18 AS build

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

WORKDIR /usr/src/app

COPY --chown=node:node pnpm-lock.yaml ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN pnpm nx run api:prisma-generate

ENV NODE_ENV production

RUN pnpm nx run api:build

RUN pnpm install --prod

USER node

###################
# PRODUCTION
###################

FROM node:18-buster AS production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist/apps/api ./dist

CMD [ "node", "dist/src/main.js" ]
