/**
 * JournalController
 *
 * @description :: Server-side logic for managing Journals
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	show: function(req, res) {
		Journal.findOne({ id: req.params.id }).populate('issues').exec(function (err, journal){
		  if (err) return res.serverError(err);

			return res.view('journal/show', { journal: journal });
		});
	}
};
