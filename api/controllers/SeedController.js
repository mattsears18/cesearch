/**
 * SeedController
 *
 * @description :: Server-side logic for managing Seeds
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	all: function(req, res) {
		Journal.create({ name: 'Journal of Construction Engineering Management' })

		.then(function(journal) {
			return Issue.create({
				issue_number: 	2,
				volume_number: 	143,
		    journal: 				journal,
				date: 					'February 2017',
			});
		})

		.then(function (issue) {
      return Article.create([
			{
				name: 					'Identifying Safety Hazards Using Collective Bodily Responses of Workers',
				uri:						'http://ascelibrary.org/doi/pdf/10.1061/(ASCE)CO.1943-7862.0001220',
				pageCount:			12,
				issue:					issue,
			},
			{
				name: 					'Mental Models of Construction Workers for Safety-Sign Representation',
				uri:						'http://ascelibrary.org/doi/pdf/10.1061/(ASCE)CO.1943-7862.0001221',
				pageCount:			10,
				issue:					issue,
			}]);
  	})

  	.done(function (result3) {
      return res.send('DB Seeded.');
    });
	}
};
