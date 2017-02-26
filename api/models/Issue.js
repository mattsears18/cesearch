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
    uri:            { type: 'string' },

    // RELATIONSHIPS
    journal:	      { model: 'journal' },
    articles:       { collection: 'article', via: 'issue' },


    // ATTRIBUTE METHODS
    getMonth: function() { return 'Month'; },
    getYear: function() { return 'Year'; },
    getUri: function() { return 'http://ascelibrary.org/toc/' + this.journal.abbrev + '/' + this.volume_number + '/' + this.issue_number; },
  }
};
