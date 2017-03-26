/**
 * MainController
 *
 * @description :: Server-side logic for managing Mains
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	home: function(req, res) {
		var articleCount = 0;
		var processedCount = 0;

		Article.find({}).exec(function(err, articles) {
			articleCount = articles.length;
			Article.find({ processed: true }).exec(function(err, processed) {
				processedCount = processed.length;

				res.render('homepage', {
					processedCount,
					articleCount,
				});
			});
		});
	},
};
