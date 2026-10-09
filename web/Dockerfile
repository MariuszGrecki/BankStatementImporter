FROM node:24-alpine

RUN mkdir -p /app/node_modules && chown -R node:node /app

WORKDIR /app
USER node

CMD ["sh", "-c", "npm install --no-audit --no-fund && npm run dev -- --host 0.0.0.0 --port 5173"]
