FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Variables VITE_* se inyectan en build-time (import.meta.env)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5173
EXPOSE 5173

CMD ["npm", "start"]
