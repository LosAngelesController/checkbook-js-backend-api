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

    client.on('fetchdepts', async (args) => {
      const deptallquery = 'SELECT * FROM department_summary';

      const vendorresults = await pgclient.query(deptallquery);

      client.emit('alldepts', {
        rows: vendorresults.rows
      })
    })

    client.on('getcheckbookrows', async (args) => {
      /*
      structure of the thing

      filters: {
        vendor: {
          query: 'Office Depot',
          match: "contains | equals"
        }
      },
      offset: 100 (skips rows already loaded),
      forcescrollmethod?: "all" | "scroll"

      */

      /*

      by default, the fetch method is infinite scrolling via loadmethod = 'scroll'
      if the vendor match is equal and the vendor query is found with a number of rows < 2000,
      disable as you go scrolling by loadmethod = 'all'
    
      */

      var loadmethod = 'scroll';

      if (
        args.forcescrollmethod === "default" || args.forcescrollmethod === undefined
      ) {
        if (args.forcescrollmethod === undefined || args.forcescrollmethod != false) {
          if (args.filters) {
            if (args.filters.vendor) {
              if (args.filters.vendor.match === "equals") {
                const checktheamountofvendors = 'SELECT * numberoftransactionspervendor WHERE vendor_name = $1'
    
                const vendorcount = await pgclient.query(checktheamountofvendors, [args.filters.vendor.query])
    
                if (vendorcount.rows) {
                  if (vendorcount.rows[0]) {
                    if (parseInt(vendorcount.rows[0].count) < 1500) {
                      loadmethod = 'all'
                    }
                  }
                }
              }
            }
          }
        }
      }
      

      var query = 'SELECT * FROM losangelescheckbook '

      var alreadystarted:boolean = false      

      if (args.filters) {
        query += " WHERE "
        if (args.filters.vendor) {
          if (args.filters.vendor.query) {
            query +=  ""
            alreadystarted = true;
          }
        }
        if (args.filters.detaileddescription) {
          if (alreadystarted === true) {
            query += " AND "
          }
          query += ""
        }
      }

      if (loadmethod === 'scroll') {
        const offsetnumber = '100'
        query += ` LIMIT 100 OFFSET ${offsetnumber}`
      }
      
    });

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