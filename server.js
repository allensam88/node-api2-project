const express = require('express');

const postsRouter = require('./posts-router.js');

const server = express();

server.get('/', (req, res) => {
  res.send(`
    <h2>LOTR Blog Post</h>
    <p>Welcome to the Lord of the Rings web log API</p>
  `);
});

server.use('/api/posts', postsRouter); 

// export default server; // ES6 Modules
module.exports = server; // <<<<< export the server