/**
 * ScraperController
 *
 * @description :: Server-side logic for managing Scrapers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var fs = require('fs');
var request = require('request');
var $ = require('cheerio');

module.exports = {
	scrape: function(req, res) {
		var journals = JSON.parse(fs.readFileSync('./scraper/data/journals.json', 'utf8'));

		url = 'http://ascelibrary.org/journal/jcemd4';
		cookie = "I2KBRCK=1; JSESSIONID=aaa85T3KL8GE5cmcdoRPv; MACHINE_LAST_SEEN=2017-02-23T17%3A55%3A06.481-08%3A00; MAID=AvStR0Q1F/ZiaXXY5v1L3g==; SERVER=WZ6myaEXBLEcZv1pIhVX+g==; _dc_gtm_UA-56132535-29=1; _dc_gtm_UA-8940040-23=1; _ga=GA1.2.1187409641.1487820890; _hjIncludedInSample=1";

		request({url, headers: {Cookie: cookie}}, function(error, response, html) {

	    if(!error){
        var $html = $(html);

				var $issues = $html.find('.yearContent .row');

				var all_issues = [];

				$issues.each(function(i, issue){
					$issue = $(issue);

					var issue_href = $issue.find('a').attr('href');

					var issue_number = issue_href.split('/')[4];
					var volume_number = issue_href.split('/')[3];

					var regExp = /\(([^)]+)\)/;

					var date = $issue.find('.loiIssueCoverDateText').first().text().match(regExp)[1];
					var journal = '58a8d396ec7d9d1100a9475f';

					var issue_data = { issue_number: issue_number, volume_number: volume_number, date: date, journal: journal };

					console.log(issue_data);

					all_issues.push(issue_data);
				});

				//res.send(html);
				res.send(journals);
			}

			fs.writeFile('./scraper/data/issues.json', JSON.stringify(all_issues, null, 4), function(err){
			    console.log('File successfully written! - Check your project directory for the output.json file');
			});
		});
	}
};
