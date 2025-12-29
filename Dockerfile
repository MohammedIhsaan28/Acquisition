
FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci && npm cache clean --force

COPY . .

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=1\
    CMD node -e "require('http').get('http://localhost:3000/health',(res)=> { process.exit(res.statusCode===200 ? 0 : 1)}).on('error',() => { process.exit(1)})"

FROM base AS development
USER root
RUN npm ci && npm cache clean --force
USER nodejs
CMD ["npm", "run", "dev"]

FROM base AS production
CMD ["npm", "start"]