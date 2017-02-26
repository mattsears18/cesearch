/**
 * IssueController
 *
 * @description :: Server-side logic for managing Issues
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	show: function(req, res) {
		Issue.findOne({ id: req.params.id }).populate('articles', { sort: 'name' }).populate('journal').exec(function (err, issue){
		  if (err) return res.serverError(err);

			return res.view('issue/show', { issue: issue });
		});
	}
};
