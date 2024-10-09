FROM node:16.17-alpine

WORKDIR /workspace/app

COPY node_modules ./node_modules
COPY dist ./dist
COPY views ./views

EXPOSE 3005

CMD ["node", "dist/server.js"]
