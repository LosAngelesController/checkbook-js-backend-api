import {pgclient} from './postgres'
import cors from 'cors'
 
//DJKenster is the http api endpoint for checkbook.
//https://djkenster.checkbook.mejiaforcontroller.com/vendorpage/

const express = require('express')
const app = express()
const port = 3713;

async function djkenster() {
    await pgclient.connect()
    const res = await pgclient.query('SELECT * FROM losangelescheckbook LIMIT 100', [])
    console.log(res.rows)
    // Hello world!

app.get('/', (req, res) => {
  res.type('html');
  res.send('Hello World!');
});

app.all('/vendorpage', [cors({
    "origin": "*"
  }), express.json()],async (req, res) => {
    /*

Recieves an object like this 
{
    params: {
        "vendor": "The Glue, LLC"
    }
}

*/

    var vendorstringtosearch = decodeURI(req.body.params.vendor).toUpperCase();

    const start = performance.now();

    if (typeof vendorstringtosearch === "string") {
          //number of transactions and total this year
         // const thisyear = "select SUM(dollar_amount), COUNT(id_number) from losangelescheckbook WHERE vendor_name LIKE $1 AND transaction_date >= '2022-01-01' AND transaction_date <= '2022-12-31'"
          const thisyear = "SELECT * FROM latestyearpervendorsummary WHERE vendor_name = $1"

          const totalcost = "SELECT * FROM vendor_summed WHERE vendor_name = $1"
          const totalnumberoftransactions = "SELECT * FROM numberoftransactionspervendor WHERE vendor_name = $1"

        const resultsforvendordata = await Promise.all([
          pgclient.query(thisyear, 
            [vendorstringtosearch]),
          pgclient.query(totalcost, 
              [vendorstringtosearch]),
          pgclient.query(totalnumberoftransactions, 
                [vendorstringtosearch])  
        ])

        const end = performance.now();

        res.type('json')
        res.send({
          timeelapsed: end-start,
          thisyearsum: resultsforvendordata[0].rows,
          totalcost: resultsforvendordata[1].rows,
          totalnumberoftransactions: resultsforvendordata[2].rows
        })
    }

    

  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
  
    
  }
  
djkenster()