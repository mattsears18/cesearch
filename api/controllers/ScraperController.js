/**
 * ScraperController
 *
 * @description :: Server-side logic for managing Scrapers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var fs = require('fs');
var request = require('request');
var $ = require('cheerio');

var COOKIE = "I2KBRCK=1; JSESSIONID=aaa85T3KL8GE5cmcdoRPv; MACHINE_LAST_SEEN=2017-02-23T17%3A55%3A06.481-08%3A00; MAID=AvStR0Q1F/ZiaXXY5v1L3g==; SERVER=WZ6myaEXBLEcZv1pIhVX+g==; _dc_gtm_UA-56132535-29=1; _dc_gtm_UA-8940040-23=1; _ga=GA1.2.1187409641.1487820890; _hjIncludedInSample=1";

var scrape = function(req, res) {
	var journals = JSON.parse(fs.readFileSync('./scraper/data/journals.json', 'utf8'));

	var all_issues = [];

	for($i = 0; $i < journals.length; $i++) {
		scrapeJournal(journals[$i]);
	}

	res.send('scraping');
}


var scrapeJournal = function(journal) {
	var newJournal = Journal.findOrCreate(journal).exec(function(err, newJournal){
		console.log(newJournal.getUri());

		var uri = newJournal.getUri();

		request({uri, headers: {Cookie: COOKIE}}, function(error, response, html) {

			if(!error){
				var $html = $(html);

				var $issues = $html.find('.yearContent .row');

				$issues.each(function(i, issue){

					$issue = $(issue);

					var issue_href = $issue.find('a').attr('href');

					var issue_number = issue_href.split('/')[4];
					var volume_number = issue_href.split('/')[3];

					var regExp = /\(([^)]+)\)/;

					var date = $issue.find('.loiIssueCoverDateText').first().text().match(regExp)[1];

					var issue_data = { issue_number: issue_number, volume_number: volume_number, date: date, journal: newJournal.id };

					var newIssue = Issue.findOrCreate(issue_data).populate('journal').exec(function(err, newIssue){
						scrapeIssue(newIssue);
					});
				});
			}
		});
	});
}

var scrapeIssue = function(issue) {
	var uri = 'http://ascelibrary.org/toc/' + issue.journal.abbrev + '/' + issue.volume_number + '/' + issue.issue_number;
	console.log(uri);
/*
	request({uri, headers: {Cookie: COOKIE}}, function(error, response, html) {

		if(!error){
			var $html = $(html);

			var $articles = $html.find('.yearContent .row');


			$issues.each(function(i, issue){

				$issue = $(issue);

				var issue_href = $issue.find('a').attr('href');

				var issue_number = issue_href.split('/')[4];
				var volume_number = issue_href.split('/')[3];

				var regExp = /\(([^)]+)\)/;

				var date = $issue.find('.loiIssueCoverDateText').first().text().match(regExp)[1];

				var issue_data = { issue_number: issue_number, volume_number: volume_number, date: date, journal: newJournal.id };

				var newIssue = Issue.findOrCreate(issue_data).exec(function(err, issue){
					scrapeIssue(issue);
				});
			});

		}
	});
	*/
}


module.exports = {
	scrape: scrape
}
