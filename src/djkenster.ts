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

    var vendorstringtosearch = req.body.params.vendor;

    const start = performance.now();

    if (typeof vendorstringtosearch === "string") {
        const vendorpagequery = "SELECT * FROM losangelescheckbook WHERE vendor_name ILIKE $1"
        const vendorpageresults = await pgclient.query(vendorpagequery, 
            [vendorstringtosearch]);

        const end = performance.now();
    }

    

  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
  
    
  }
  
djkenster()