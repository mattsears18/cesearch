/**
 * TestController
 *
 * @description :: Server-side logic for managing Tests
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	meh: function(req, res) {
		Article.findOne({ id: "58d6c2517674c8c01436a64d" }).exec(function(err, article){
			return res.json(200, article.process());
		});
	}
};
