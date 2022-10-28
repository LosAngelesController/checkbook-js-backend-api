import fs from 'fs'

const server = require('http').createServer();
const io = require('socket.io')(server);
io.on('connection', client => {
  client.on('event', data => { /* … */ });
  client.on('disconnect', () => { /* … */ });
});
server.listen(3000);

const config = require('../config.json');

const { Client } = require('pg')
const client = new Client({
  user: config.db.username,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync('./ca-certificate.crt').toString(),
  }
})

//connect to the checkbook database before starting the checkbook endpoints
 
async function main() {
  await client.connect()
  const res = await client.query('SELECT * FROM losangelescheckbook LIMIT 100', [])
  console.log(res.rows) // Hello world!
}

main()