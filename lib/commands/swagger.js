'use strict';

let q = require('q');
let request = require('request');


module.exports = {
  name: 'swagger',
  description: 'Given a Swagger schema generate or update Ember models.',
  works: 'insideProject',

  anonymousOptions: [
    '<url>'
  ],

  availableOptions: [
    { name: 'cli', type: Boolean, description: 'Generate cli commands instead of model files.' },
    { name: 'update', type: Boolean, description: 'Update existing models.' },
  ],

  /**
   */
  run: function(commandOptions, rawArgs) {
    let self = this;
    let deferred = q.defer();

    let uri;

    if ( ! rawArgs.length ) {
      self.ui.writeLine('Please specify the URI to the swagger schema as the first argument. eg: ember swagger https://example.com/api/swagger.json');
      return;
    }
    else {
      uri = rawArgs[0];
      self.ui.writeLine(`Generating models from ${uri}`);
    }

    self._fetch(uri)
      .then(function(result) {
        self.ui.writeLine(JSON.stringify(result));
        deferred.resolve(result);
      })
      .fail(function(error) {
        self.ui.writeLine(JSON.stringify(error));
        deferred.reject(error);
      })
      ;

    return deferred.promise;
  },

  _fetch: function(uri) {
    let self = this;
    let deferred = q.defer();

    self.ui.writeLine(`Fetching from ${uri}`);

    request(uri, function (error, response, body) {
      self.ui.writeLine("resolved");

      if ( error ) {
        deferred.reject(error);
      }
      else {
        deferred.resolve(JSON.parse(body));
      }
      // console.log('error:', error); // Print the error if one occurred
      // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      // console.log('body:', body); // Print the HTML for the Google homepage.
    });

    return deferred.promise;
  },

};
