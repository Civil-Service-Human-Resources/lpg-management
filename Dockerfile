FROM node:22.23.4

WORKDIR /workspace/app

COPY node_modules ./node_modules
COPY dist ./dist
COPY views ./views

EXPOSE 3005

CMD ["node", "dist/server.js"]
