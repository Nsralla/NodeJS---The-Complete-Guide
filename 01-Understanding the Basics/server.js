const http = require('http');
const handlers = require('./routes');

const server = http.createServer(handlers.requestHandler);

server.listen(3000, () => console.log('Server is listening on port 3000'));