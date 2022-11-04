import fs from 'fs'

const server = require('http').createServer();
const socket = require('socket.io')(server, {
  cors: {
    origins: ["https://checkbook.mejiaforcontroller.com",
  "http://localhost:3001","http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});
server.listen(3000);

const config = require('../config.json');

import {pgclient} from './postgres'

//connect to the checkbook database before starting the checkbook endpoints
 
async function main() {
  await pgclient.connect()
  const res = await pgclient.query('SELECT * FROM losangelescheckbook LIMIT 100', [])
  console.log(res.rows) // Hello world!
  socket.on('connection', client => {
    client.on('disconnect', () => { /* … */ });

    client.on("mainautocomplete", async (args) => {
      //this is the google-esque autocomplete on the frontpage
  
      //user will submit args: {querystring: string}
  
      //therefore, search the important string-based indexes for the following, 
      //and sort based on amount? similarity? still deciding
  
          //SELECT vendor_name, sum(dollar_amount) FROM losangelescheckbook GROUP BY vendor_name;
      //took over 17 seconds to run! a fast query index is required
  
      const vendorquery = "SELECT * FROM vendor_summed WHERE vendor_name ILIKE '%' || $1 || '%' ORDER BY sum desc LIMIT 100;"
  
      if (typeof args.querystring === "string") {
        const start = performance.now();
        const vendorresults = await pgclient.query(vendorquery, [args.querystring]);
        const end = performance.now();
        console.log(vendorresults.rows);
  
        client.emit("autocompleteresponse", {
          rows: vendorresults.rows,
          timeelapsed: end-start,
          querystring: args.querystring
        });
      }

    });
  });

  
}

main()