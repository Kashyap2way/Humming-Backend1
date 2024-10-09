# Use an official Node.js runtime as a parent image
FROM node:16-slim

# Install required tools: tshark (Wireshark) and aircrack-ng
RUN apt-get update && apt-get install -y \
    tshark \
    aircrack-ng \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Expose the port that your app will run on
EXPOSE 3000

# Command to run the app
CMD [ "npm", "start" ]
