FROM node:24-alpine

WORKDIR /app

# Copy package files from nested folder
COPY globe-scholars/package*.json ./

# Install dependencies
RUN npm install

# Copy entire Angular project
COPY globe-scholars/ ./

# Expose port
EXPOSE 4200

# Start dev server
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "500"]