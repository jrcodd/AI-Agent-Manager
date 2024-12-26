cd /Users/jcodd/Downloads
eval "$(brew/bin/brew shellenv)"     
brew services start mongodb-community@8.0
cd /Users/jcodd/Documents/GitHub/AISpanish/SpanishAIAssitant/backend
node server.js