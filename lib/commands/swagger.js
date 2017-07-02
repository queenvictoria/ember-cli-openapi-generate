'use strict';

let q = require('q');
let request = require('request');
let _ = require('lodash');


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

    if ( ! rawArgs.length ) {
      self.ui.writeLine('Please specify the URI to the swagger schema as the first argument. eg: ember swagger https://example.com/api/swagger.json');
      return;
    }
    else {
      self.uri = rawArgs[0];
      self.ui.writeLine(`Generating models from ${self.uri}`);
    }

    self._fetch(self.uri)
      .then(function(result) {
        return self._parseSwagger(result);
      })
      .fail(function(error) {
        self.ui.writeLine(JSON.stringify(error));
        deferred.reject(error);
      })
      ;

    return deferred.promise;
  },


  _parseSwagger: function(data) {
    let self = this;
    let deferred = q.defer();

    // Check for definitions
    if ( data.hasOwnProperty('definitions') ) {
      let definitions = data.definitions;
      let promises = [];

      // Iterate definitions.
      _.each(data.definitions, function(definition, name) {
        promises.push(self._parseDefinition(definition, name));
      });

      q.allSettled(function(results) {
        deferred.resolve();
      });

    }
    else {
      deferred.reject({message: `Swagger at ${self.uri} doesn't contain definitions.`});
    }

    return deferred.promise;
  },


  _parseDefinition: function(definition, name) {
    let self = this;
    let deferred = q.defer();

    if ( name !== 'error' ) {
      self.ui.writeLine(`Parsing ${name}:`);

      // @TODO Validate a valid JSONAPI structure.

      if (
        definition.hasOwnProperty('properties')
        &&
        definition.properties.hasOwnProperty('attributes')
        &&
        definition.properties.attributes.hasOwnProperty('properties')
      ) {
        let attributes = definition.properties.attributes.properties;
        _.each(attributes, function(attribute, attrName) {
          self.ui.writeLine(`Attribute '${attrName}' is a '${attribute.type}'.`);
        });
      }
    }

    deferred.resolve();

    return deferred.promise;
  },


  _fetch: function(uri) {
    let self = this;
    let deferred = q.defer();

    self.ui.writeLine(`Fetching from ${uri}`);

    request(uri, function (error, response, body) {
      if ( error ) {
        deferred.reject(error);
      }
      else {
        deferred.resolve(JSON.parse(body));
      }
    });

    return deferred.promise;
  },

};
