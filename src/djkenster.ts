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

app.all('/deptpage', [cors({
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

});

app.all('/vendortransactionsovertimedeptall', [cors({
  "origin": "*"
}), express.json()], async (req, res) => {
 try {
  //selecting without the vendor_name shortened the response time from 1.6s to 1.3s
  const selectforbargraphovertime = "select dollar_amount,count,transaction_date,department_name from vendorovertimechartdept WHERE vendor_name ILIKE $1"
  const timelineresults = pgclient.query(selectforbargraphovertime, [req.body.params.vendor]);
  
  res.type('json')
        res.send({
          rows: timelineresults.rows
        })

 } catch (errorofvendor) {
  console.error(errorofvendor)
 }
})

app.all('/vendortransactionsovertimedeptpermonth', [cors({
  "origin": "*"
}), express.json()], async (req, res) => {
 try {
  //selecting without the vendor_name shortened the response time from 1.6s to 1.3s
  const selectforbargraphovertime = "select sum(dollar_amount) AS dollar_amount ,sum(count) AS count,DATE_TRUNC('month',transaction_date),department_name from vendorovertimechartdept WHERE vendor_name ILIKE $1 GROUP BY DATE_TRUNC('month',transaction_date), department_name"
  const timelineresults = await pgclient.query(selectforbargraphovertime, [req.body.params.vendor]);
  
console.log(timelineresults)

  res.type('json')
        res.send({
          rows: timelineresults.rows
        })

 } catch (errorofvendor) {
  console.error(errorofvendor)
 }
})

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