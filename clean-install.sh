#!/bin/bash

# Navigate to project directory
#cd home/Desktop/ai/SpanishAIAssitant

# Update and clean existing packages
sudo apt update
sudo apt autoremove -y
sudo apt autoclean

# Install required dependencies
sudo apt install -y software-properties-common

# Install compatible OpenSSL
wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb
rm libssl1.1_1.1.1f-1ubuntu2_amd64.deb

# Uninstall existing MongoDB if present
sudo systemctl stop mongod || true
sudo apt-get purge mongodb-org* -y
sudo rm -rf /var/log/mongodb
sudo rm -rf /var/lib/mongodb

# Uninstall Node.js
sudo apt-get remove nodejs npm -y
sudo rm -rf /usr/local/lib/node_modules
sudo rm -rf ~/.npm

# Uninstall Ollama
sudo systemctl stop ollama || true
sudo rm -rf /usr/local/bin/ollama

# Update system packages
sudo apt update && sudo apt upgrade -y

# Reinstall Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Reinstall MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Reinstall Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull default models
ollama pull mistral

# Clean npm cache and reinstall dependencies
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install

# Print completion message
echo "Clean installation complete. Start the app with 'npm start'."