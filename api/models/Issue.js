/**
 * Issue.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
		issue_number:		{ type: 'integer' },
    volume_number:	{ type: 'integer' },
    date:           { type: 'date' },

    journal:	      { model: 'journal' },

    articles:       { collection: 'article', via: 'issue' },


    month: function() {
      return 'Month';
    }
  }
};
