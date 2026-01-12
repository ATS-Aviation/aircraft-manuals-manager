FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]
