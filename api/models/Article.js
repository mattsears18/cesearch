/**
 * Article.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var path = require('path');
var request = require('request');
var fs = require('fs');
var pdftotext = require('pdftotextjs');
var cookies = require('../services/cookies');

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
    process: function() {
      if(this.filename) {
        //console.log("process local file");
        this.processFile();
      } else if(this.uri) {
        //console.log("get remote file");
        this.getRemoteFile();
      } else {
        //console.log("No file!");
        console.log(this.name);
      }
    },

    getRemoteFile: function() {
      var article = this;
      var uri = this.uri;
      console.log(uri);
      var cookie;

      if(!article.source) {
        cookie = cookies.ASCE;
      } else if(article.source == "OCLC") {
        cookie = cookies.OCLC;
      }

      var options = {
        uri,
        headers: { Cookie: cookie }
      };

      //console.log(options);

      var req = request.head(options, function(error, response, html) {
        if(error){ console.log(error); }

        //console.log(response);

        if(response.headers && response.headers['content-type'] == "application/pdf; charset=UTF-8" || response.headers['content-type'] == "application/pdf") {
          // RECEIVED A PDF
          //console.log('PDF Available!');

          var dirname = path.resolve(sails.config.appPath, 'uploads');
          var filename = Math.random().toString(36).substring(3) + ".pdf";
          var filepath = dirname + "/" + filename;

          request(options).pipe(fs.createWriteStream(filepath)).on('close', function(){
            article.filename = filename;
            article.save(function(err){
              if(err) { console.log(err); }
              article.process();
            });
          });
        } else {
          console.log('No PDF available`!');

          article.uri = article.uri.replace('http://ascelibrary.org/', 'http://ascelibrary.org.colorado.idm.oclc.org/');
          article.source = "OCLC";
          console.log(article.uri);

          article.getRemoteFile();
        }
      });
    },

    processFile: function() {
      var article = this;
      if(!this.processed) {
        //console.log('PROCESS FILE!');
        var dirname = path.resolve(sails.config.appPath, 'uploads');
        var filepath = dirname + "/" + this.filename;

        if (fs.existsSync(filepath)) {
          //console.log('FILE EXISTS!');

          var pdf = new pdftotext(filepath);
          var text = pdf.getTextSync().toString('utf8');
          this.text = text;
          this.processed = true;

          this.save(function (err) {
            if (err) { console.log(err); }

            fs.unlink(filepath, function(err){
              if(err) { console.log(err); }
            });
          });
        } else {
          console.log("File does not exist");
        }
      } else {
        console.log("FILE ALREADY PROCESSED!");
      }
    },
  },
};
