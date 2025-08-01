const requestHandler = (req,res)=>{
    const url = req.url;
    const method = req.method;

    if(url === '/'){
        res.setHeader('Content-Type', 'text/html');
        res.write('<html>');
        res.write('<body><h1> Welcome to my page</h1></body>');
        res.write('<form action="/create-user" method="POST" >');
        res.write('<input type="text" name="username" placeholder="Enter your name">');
        res.write('<button type="submit"> Submit </button>');
        res.write('</form>');
        res.write('</html>');
        res.end()
        return;
    }
    else if(url === '/create-user' && method === 'POST'){
        const dataChunks = [];
        req.on('data',(chunk)=>{
            dataChunks.push(chunk);
        });
        req.on('end',()=>{
            const concatenatedData = Buffer.concat(dataChunks).toString();
            let userName = concatenatedData.split('=')[1];
            userName = userName.replace(/\+/g, ' '); // Decode URL-encoded string
            console.log('User Name:', userName);
            res.setHeader('Location', '/');
            res.statusCode = 302; // Redirect status code
            res.end();
            return;
        })
    }
    else if(url === '/users'){
        res.setHeader('Content-Type', 'text/html');
        res.write('<html>');
        res.write('<body><h1> Users Page</h1></body>');
        res.write('<ul>');
        res.write('<li>User 1</li>');
        res.write('<li>User 2</li>');
        res.write('</ul>');
        res.write('</html>')
        res.end()
        return;
    }
};

module.exports = {
    requestHandler:requestHandler,
};