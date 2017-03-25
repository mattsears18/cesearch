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
    filename:       { type: 'string' },

    issue:	        { model: 'issue' },
    search_result:  { model: 'search' },


    // CUSTOM ATTRIBUTE METHODS
    getFile: function() {
      if(this.uri) {
        return "download file!";
      } else if(this.filename) {
        return "local file!";
      } else {
        return "no file!";
      }
    }
  },
};
