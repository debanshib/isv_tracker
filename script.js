const Wappalyzer = require('wappalyzer');
const accounts = require('./data-5-29/accounts.js');
const kue = require("kue");
const cluster = require('cluster');
const express = require('express');
const app = express();
const queue = kue.createQueue();
const fs = require('fs');


const options = {
	browser: 'puppeteer',
	debug: false,
	delay: 7000, //can be updated
	maxDepth: 5,
	maxUrls: 5, //can be increased
	maxWait: 100000, //can be updated
	recursive: true,
	userAgent: 'Wappalyzer',
	htmlMaxCols: 5000,
	htmlMaxRows: 5000,
};

var fixURL = function(line){
	var end = line.slice(-1);
	if (end == '/') var line = line.slice(0,-1);
	var beg = line.slice(0,3);
	if (beg == 'htt') url = line;
	else if (beg == 'www') var url = 'https://' + line;
	else var url = 'https://www.' + line;
	return url;
}

app.get("/create", function(req, res) {
	console.log('create jobs')
	  accounts.forEach(account => {
	  	var url = fixURL(account["Website"]);
	  	queue.create('task', {
	  		title: url,
	  		data: {
	  			'account_id': account["Account ID"],
	  			'url': url,
	  		}
	  	})
	  	.priority('high')
	  	.save();
	  })
  res.send("Created jobs for all urls!");
});

const aggregated_results = [];

app.get("/process", function(req, res) {
	console.log('processing');
	queue.process('task', 5, function(job, done) {
		const wappalyzer = new Wappalyzer(job.data.data.url, options);
		wappalyzer.analyze()
		.then(result => {
			var account_results = [];
			result.applications.forEach(app => {
				var obj = {
					'url': job.data.data.url,
	  				'account_id': job.data.data.account_id,
	  				'tech': app.name,
	  				'tech_type': app.categories[0],
	  				'confidence': app.confidence,
				}
				fs.appendFile("tech.txt", JSON.stringify(obj), (err) => { 
				  if (err) { 
				    console.log(err); 
				  } 
				}); 
				aggregated_results.push(obj)
				// if (tech[app.name]) tech[app.name].push(Object.keys(result["urls"])[0])
				// else tech[app.name] = [Object.keys(result["urls"])[0]]
			})
			done();
		})
		.catch(error => done(error));
	});
});

app.get("/tech", function(req, res) {
	res.send(aggregated_results)
});

app.use("/kue-api/", kue.app)

app.listen(process.env.PORT || 1800, function(){
	  	console.log("SERVER listening on port", this.address().port, app.settings.env)});


app.get('/clear', function(req, res){
	kue.Job.rangeByState('complete', 0, 2000, 1, function(err, jobs) {
	  jobs.forEach(function(job) {
	    job.remove();  
	  });
	});
	kue.Job.rangeByState('active', 0, 2000, 1, function(err, jobs) {
	  jobs.forEach(function(job) {
	    job.remove();  
	  });
	})
	kue.Job.rangeByState('inactive', 0, 600, 1, function(err, jobs) {
	  jobs.forEach(function(job) {
	    job.remove();  
	  });
	})
	kue.Job.rangeByState('failed', 0, 600, 1, function(err, jobs) {
	  jobs.forEach(function(job) {
	    job.remove();  
	  });
	})
	console.log('removed all jobs')
})