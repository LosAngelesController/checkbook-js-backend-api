const { exec } = require("child_process");
import {pgclient} from './../postgres'

async function runseq() {
    await pgclient.connect()
    const nameofcsv = `checkbook-${Date.now()}.csv`

    var wgetcommand = `wget -O ${nameofcsv} https://controllerdata.lacity.org/api/views/pggv-e4fn/rows.csv?accessType=DOWNLOAD`;

    var child = exec(
        wgetcommand,
        function (error, stdout, stderr) {
          
          if (error !== null) {
            console.log('exec error: ' + error);
          } else {
            // okay i guess it downloaded
            
            //transfer the file name into the database under a new file name

            //check against the alias file and create transfer tables using UNION features

            //draft mode "BEGIN" and then move the finished table and then commit

            //delete the import table

            //and then delete the csv

            //create replacement functions for all proxy tables

          }
        }
      );
}