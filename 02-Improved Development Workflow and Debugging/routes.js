/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
const fs = require('fs');
function handleRequest(req, res) { // this will be called for every request
   
    if (req.url === '/') {
        res.setHeader('Content-Type', 'text/html');
        res.write('<html>');
        res.write('<head><title>enter a message</title></head>');
        res.write('<body>')


        res.write('<form action="/message" method="POST">');
        res.write('<input type="text" name="message" />');
        res.write('<button type="submit">Send</button>');
        res.write('</form>');

        res.write('</body>')
        res.write('</html>');
        return res.end();

    }
    if (req.url === '/message' && req.method === 'POST') {
        const bodyChunks = [];
        req.on('data', (chunk) => {
            bodyChunks.push(chunk);
            console.log("received chunk:", chunk);
        });
        req.on('end', () => {
            const fullBuffer = Buffer.concat(bodyChunks);
            const parsedBody = fullBuffer.toString();
            let message = parsedBody.split('=')[1];
            message = message.replace(/\+/g, ' '); // replace '+' with space
            console.log("Message received:", message);

            // Write to file and redirect
            fs.writeFile('message.txt', message,err =>{
                   res.statusCode = 302;
                    res.setHeader('Location', '/');
                    return res.end();
            });
         
        });
        return; // Prevent further response after handling POST
    }
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>My First Page</title></head>');
    res.write('<body><h1>Hello from Node.js!</h1></body>');
    res.end(); // end the response
}

module.exports = {
    requestHandler: handleRequest,
    someText: 'Hello World'
};