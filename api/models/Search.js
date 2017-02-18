/**
 * Search.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    term:       { type: 'string' },
    date_to:    { type: 'date' },
    date_from:  { type: 'date' },
    articles:   { collection: 'article', via: 'search_result' },
  }
};
