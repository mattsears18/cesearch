/**
 * ArticleController
 *
 * @description :: Server-side logic for managing Articles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  show: function(req, res) {
    Article.findOne({ id: req.params.id }).exec(function (err, article){
      if (err) return res.serverError(err);

      return res.view('article/show', { article: article });
    });
  }
};
