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
		//issues = utility.shuffle(issues);
		var i = 0;

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

			scrapeIssue(issues[i]);
			i++;
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

			$headings.each(function(i, h){
				var $h = $(h);
				if($h.text().trim().toUpperCase() == 'TECHNICAL PAPERS') {
					$h.nextUntil('subject', function(j, article) {
						var $article = $(article);
						var name = $article.find('div.art_title span.hlFld-Title').text().trim();
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


var test = function(req, res) {
	// Find all Issues and scrape them with a time delay between each on so that
	// you don't get banned from ascelibrary.org
	Issue.find().where({ articles: { '=': undefined }}).exec(function(err, issues){
		console.log(issues.length);
/*
		issues = utility.shuffle(issues);
		var i = 0;

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

			scrapeIssue(issues[i]);
			i++;
		}, 2000);
		*/
	});

	res.send(200, 'scraping issues...');
}




module.exports = {
	scrape: scrape,
	scrapeIssues,
	test: test,
}
