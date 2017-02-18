/**
 * Article.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	name:						{ type: 'string' },
    normalizedName: { type: 'string' },
    uri: 						{ type: 'string' },
    text: 					{ type: 'string' },
    processed: 			{ type: 'boolean' },
    pageCount: 			{ type: 'integer' },

    issue:	        { model: 'issue' },
    search_result:  { model: 'search' },
  }
};
