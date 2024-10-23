# Use the official Node.js image as a base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install NestJS CLI globally
RUN yarn global add @nestjs/cli

# Copy the package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --production

# Copy the rest of the application files
COPY . .

# Copy the .env file
COPY .env .env

# Build the application
RUN yarn build

# Expose the port on which the app will run
EXPOSE 3000

# Command to run the application
CMD ["yarn", "start:prod"]