/**
 * ScraperController
 *
 * @description :: Server-side logic for managing Scrapers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var fs = require('fs');
var request = require('request');
var $ = require('cheerio');
var utility = require('../services/utility');
var xlsx = require('xlsx');
var async = require('async');

var COOKIE = "I2KBRCK=1; JSESSIONID=aaa85T3KL8GE5cmcdoRPv; MACHINE_LAST_SEEN=2017-02-23T17%3A55%3A06.481-08%3A00; MAID=AvStR0Q1F/ZiaXXY5v1L3g==; SERVER=WZ6myaEXBLEcZv1pIhVX+g==; _dc_gtm_UA-56132535-29=1; _dc_gtm_UA-8940040-23=1; _ga=GA1.2.1187409641.1487820890; _hjIncludedInSample=1";

var scrape = function(req, res) {
	var journals = JSON.parse(fs.readFileSync('./scraper/data/journals.json', 'utf8'));

	for($i = 0; $i < journals.length; $i++) {
		scrapeJournal(journals[$i]);
	}

	res.send('scraping... navigate to /scraper/issues when complete');
}


var scrapeJournal = function(journal) {
	var newJournal = Journal.findOrCreate(journal).exec(function(err, newJournal){
		console.log(newJournal.getUri());

		var uri = newJournal.getUri();

		request({uri, headers: {Cookie: COOKIE}}, function(error, response, html) {
			if(!error){
				var $html = $(html);

				var $issues = $html.find('.yearContent .row');

				if($issues.length > 0) {
					$issues.each(function(i, issue){

						$issue = $(issue);

						var issue_href = $issue.find('a').attr('href');

						var issue_number = issue_href.split('/')[4];
						var volume_number = issue_href.split('/')[3];

						var regExp = /\(([^)]+)\)/;

						var date = $issue.find('.loiIssueCoverDateText').first().text().match(regExp)[1];

						var issue_uri = 'http://ascelibrary.org/toc/' + newJournal.abbrev + '/' + volume_number + '/' + issue_number;

						var issue_data = { issue_number: issue_number, volume_number: volume_number, date: date, uri: issue_uri, journal: newJournal.id };

						var newIssue = Issue.findOrCreate(issue_data).exec(function(err, issue){
							console.log(issue);
						});
					});
				} else {
					console.log('ERROR! No issues found. (Probably blocked from ASCElibrary.org)');
				}
			} else {
				console.log('ERROR!');
			}
		});
	});
}


var scrapeIssues = function(req, res) {
	// Find all Issues and scrape them with a time delay between each on so that
	// you don't get banned from ascelibrary.org
	Issue.find().exec(function(err, issues){
		issues = utility.shuffle(issues);
		//console.log(issues);
		var fissues = [];

		// Erase the log file
		fs.writeFileSync('./scraper/data/blank_issues.json', '', 'utf8');

		issues.forEach(function(iss) {
			Article.find({ issue: iss.id }).exec(function(err, articles){
				if( ! articles.length) {
					//console.log('No Articles for issue: ' + iss.id);
					// NO ARTICLES!
					fissues.push(iss);

					fs.appendFile('./scraper/data/blank_issues.json', iss.uri + '\r\n', function(err){
						if(err){
							console.log(err);
						}
					});
				} else {
					//console.log('Articles found for issue: ' + iss.id);
				}
			});
		});

		console.log('=====================');
		console.log('');
		console.log('');
		console.log('Waiting 2 seconds...');
		console.log('');
		console.log('');
		console.log('=====================');

		setInterval(function() {

			console.log('=====================');
			console.log('');
			console.log('');
			console.log('Waiting 2 seconds...');
			console.log('');
			console.log('');
			console.log('=====================');

			if(fissues.length) {
				scrapeIssue(fissues.shift());
			} else {
				console.log('No issues at the moment...');
			}
		}, 2000);
	});

	res.send(200, 'scraping issues...');
}


var scrapeIssue = function(issue) {
	var uri = issue.uri;
	console.log(issue.uri);

	request({uri, headers: {Cookie: COOKIE}}, function(error, response, html) {
		if(!error){
			var $html = $(html);

			var $headings = $html.find('subject');

			console.log('Headings: ' + $headings.length);

			$headings.each(function(i, h){
				var $h = $(h);
				console.log($h.text().trim().toUpperCase());

				var acceptable_headers = [
					'TECHNICAL PAPERS',
					'TECHNICAL PAPER',
					'SCHOLARLY PAPERS',
					'ARTICLES',
					'FEATURES',
					'MANAGEMENT PAPERS',
					'PAPERS',
					'PROFESSIONAL PAPERS',
				];

				if(acceptable_headers.indexOf($h.text().trim().toUpperCase()) > -1) {
					$h.nextUntil('subject', function(j, article) {
						var $article = $(article);
						var name = $article.find('div.art_title span.hlFld-Title').text().trim();
						console.log('    ' + name);
						var article_uri = 'http://ascelibrary.org' + $article.find('div a').attr('href');

						var article_data = { name: name, uri: article_uri, issue: issue.id };

						var newArticle = Article.findOrCreate(article_data).exec(function(err, article){
							console.log(article);
						});
					});
				}
			});
		} else {
			console.log('ERROR!');
		}
	});
}


var upload = function(req, res) {
	req.file('data').upload({
  	dirname: require('path').resolve(sails.config.appPath, 'uploads')
	},
	function (err, files){
	  if (err) return res.serverError(err);

		var workbook = xlsx.readFile(files[0].fd);
		var worksheet = workbook.Sheets[workbook.SheetNames[0]];

		var articles = xlsx.utils.sheet_to_json(worksheet);

		async.eachSeries(articles, insertArticle, function(err) {
			if (err) { throw err; }
			console.log("");
			console.log("All done!");
		});

	  return res.send(200, "Uploaded");
	});
}

var insertArticle = function(article, callback){
	// GET PUBLISHER
	Publisher.findOrCreate({ name: article.publisher }).exec(function(err, publisher){

		// GET JOURNAL
		Journal.findOrCreate({ name: article.journal_name }).exec(function(err, journal){
			journal.publisher = publisher.id;
			if(article.journal_uri) {
				journal.uri = article.journal_uri;
				journal.save();
			}

			// GET Issue
			Issue.findOrCreate({ issue_number: article.number, volume_number: article.volume }).exec(function(err, issue) {
				issue.journal = journal.id;
				issue.save();

				// GET ARTICLE
				Article.findOrCreate({ name: article.name, issue: issue.id }).exec(function(err, foundarticle){
					if(article.uri) {
						foundarticle.uri = article.uri;
						foundarticle.save();
						console.log(article.name);

						// Call callback to insert next article
						callback();
					}
				});
			});
		});
	});
}


var test = function(req, res) {
	Issue.findOne({ uri: 'http://ascelibrary.org/toc/jcemd4/138/7' }).populate('articles').exec(function(err, issue){
		res.send(issue);
	});
}



module.exports = {
	scrape,
	scrapeIssues,
	upload,
	test,
}
