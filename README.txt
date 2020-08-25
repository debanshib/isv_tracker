npm install --save to download all libraries needed from package.json

**********************************************************************

IMPORT SALESFORCE DATA:

Download report from Salesforce as csv
(Update script.js lines 35-45 based on the fields you include)

Converting csv to json:
[terminal] (make sure to install csvtojson globally)
csvtojson ./data/accounts.csv > ./data/accounts.json

Then saved file as accounts.js, adding module.exports = <json array>

**********************************************************************

GET TECHNOLOGIES USED BY EACH SALESFORCE ACCOUNT:

Make sure Redis is running in background
[terminal] redis-server

Run npm start script.js

Go to your browser...

Look at http://localhost:1800/kue-api/ and see if you need to remove any existing jobs:
http://localhost:1800/clear

Call http://localhost:1800/create to add jobs to the queue.
See that they have been added on http://localhost:1800/kue-api/

Call http://localhost:1800/process to start processing the jobs.
See that they start to move to the "Active" tab on http://localhost:1800/kue-api/

**********************************************************************

EXPORT RESULTS:

When http://localhost:1800/kue-api has 0 Queued jobs / all Complete jobs - we are ready to look at the results.

Call http://localhost:1800/tech to see object with all results. Copy/paste into json file.

Converting json to csv:
[terminal] (make sure to install json2csv globally)
json2csv -i accounts-with-tech-1.json -f account,url,region,account_id,amount_won,type,industry,employees,tech,tech_type,confidence > accounts-with-tech-1.csv

json2csv -i ./data/tech.json -f url,account_id,tech,tech_type,confidence > tech.csv
json2csv -i ./data/prospects-open-tech.json -f url,account_id,tech,tech_type,confidence > prospects-open-tech.csv
