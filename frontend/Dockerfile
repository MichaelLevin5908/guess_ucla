# Development stage
FROM node:18 as development

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY frontend/ .

# Expose port
EXPOSE 3000

# Run the application
CMD ["npm", "start"]