FROM node:22-alpine3.19

# Create app directory
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

# Copy files and install dependencies
COPY --chown=node:node . .
RUN npm install

# Build the Next.js app
RUN npm run build

# Run as non-root
USER node

# Expose Next.js default port
EXPOSE 3000

# Start the production server
CMD ["npm", "start"]
