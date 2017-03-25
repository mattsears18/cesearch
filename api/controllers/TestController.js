/**
 * TestController
 *
 * @description :: Server-side logic for managing Tests
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	meh: function(req, res) {
		Article.findOne({ id: "58d6c24f7674c8c01436a645" }).exec(function(err, article){
			console.log(article.getFile());
			return res.send(200, article.getFile());
		});
	}
};
