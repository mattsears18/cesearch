/**
 * JournalController
 *
 * @description :: Server-side logic for managing Journals
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index: function(req, res) {
		Journal.find().populate('issues').sort('name').exec(function (err, journals){
		  if (err) return res.serverError(err);

			return res.view('journal/index', { journals: journals });
		});
	},

	show: function(req, res) {
		Journal.findOne({ id: req.params.id }).populate('issues').sort('date').exec(function (err, journal){
		  if (err) return res.serverError(err);

			return res.view('journal/show', { journal: journal });
		});
	}
};
