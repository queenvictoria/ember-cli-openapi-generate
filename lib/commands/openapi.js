'use strict';

let q = require('q');
let request = require('request');
let _ = require('lodash');
let Blueprint = require('ember-cli/lib/models/blueprint');
let fs = require('fs');
let yaml = require('js-yaml');
// let Inflector = require('ember-inflector');

module.exports = {
  name: 'openapi',
  description: 'Given a openapi schema generate or update Ember models.',
  works: 'insideProject',
  // Defaults
  options: {
    cli: false,
    resource: false,
    arraytype: false,
    yaml: false,
  },

  anonymousOptions: [
    '<url>'
  ],

  availableOptions: [
    { name: 'cli', type: Boolean, description: 'Generate cli commands instead of model files.' },
    { name: 'resource', type: Boolean, description: 'Generate resources instead of models (models, routes, templates and tests).' },
    { name: 'arraytype', type: Boolean, description: 'Arrays are an allowed type: you need to have an "array" transform.' },
    { name: 'yaml', type: Boolean, description: 'Treat OpenAPI file as YAML.' },
  ],

  /**
   */
  run: function(commandOptions, rawArgs) {
    let self = this;
    let deferred = q.defer();

    self.options = _.defaults(commandOptions, self.options);

    if ( ! rawArgs.length ) {
      self.ui.writeLine('Please specify the URI or path to the OpenAPI schema as the first argument. eg: ember openapi https://example.com/api/swagger.json');
      return;
    }
    else {
      self.uri = rawArgs[0];
      self.ui.writeLine(`Generating models from ${self.uri}`);
    }

    self._fetch(self.uri)
      .then(function(result) {
        return self._parseOpenapi(result);
      })
      .fail(function(error) {
        deferred.reject(error);
      })
      ;

    return deferred.promise;
  },


  _parseOpenapi: function(data) {
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
        deferred.resolve(results);
      })
      .fail(function(error) {
        self.ui.writeLine(JSON.stringify(error));
        deferred.reject(error);
      });

    }
    else {
      deferred.reject({message: `openapi at ${self.uri} doesn't contain definitions.`});
    }

    return deferred.promise;
  },


  _parseDefinition: function(definition, name) {
    let self = this;
    let deferred = q.defer();

    if ( name !== 'error' ) {
      // @TODO Validate a valid JSONAPI structure.

      if (
        definition.hasOwnProperty('properties')
      ) {
        let attributes = definition.properties;

        // jsonapi-server seems to nest the properties more deeply than usual.
        // If the definition contains `properties.attributes.properties`, use that instead of just `properties`.
        if (
          definition.properties.hasOwnProperty('attributes')
          &&
          definition.properties.attributes.hasOwnProperty('properties')
        ) {
          attributes = definition.properties.attributes.properties;
        }

        let attr = {};
        _.each(attributes, function(attribute, attrName) {
          if (attrName.toLowerCase() === 'id')
            return;

          attr[attrName] = self._getAttrValue(attribute, attrName);
        });

        // Iterate jsonapi-server relationships.
        if (
          definition.properties.hasOwnProperty('relationships')
          &&
          definition.properties.relationships.hasOwnProperty('properties')
        ) {
          let relationships = definition.properties.relationships.properties;

          _.each(relationships, function(relationship, relName) {
            if ( relationship.properties && relationship.properties.data ) {
              // @TODO Support inverse
              if ( relationship.properties.data.type == 'array' )
                attr[relName] = `hasMany:${relName}`;
              else
                attr[relName] = `belongsTo:${relName}`;
            }
          });

        }

        // Model or Resource
        let blueprintName = "model";
        if ( self.options.resource )
          blueprintName = "resource";

        // let modelName = Inflector.inflector.singularize(name);
        let modelName = name.replace(/s$/, '');

        // Either output CLI generate command.
        if ( self.options.cli ) {
          let fields = _.chain(attr).toPairs().map(function(pair) {
            return pair.join(':');
          }).join(' ');
          self.ui.writeLine(`ember generate ${blueprintName} ${modelName} ${fields}`);
          deferred.resolve();
        }

        // or generate models or resources.
        else {
          let options = {
            entity: {
              name: modelName,
              options: attr,
            },
            target: "./",
            ui: self.ui,
            project: self.project,
          };

          var resource = Blueprint.lookup(blueprintName, {
            paths: self.project.blueprintLookupPaths()
          });

          // Returns a promise.
          return resource.install(options);
        }
      }
      else {
        deferred.reject({error: `Rejecting ${name} as definitions are missing.`});
      }
    }
    else {
      deferred.resolve({error: `Rejecting ${name} as its illegal.`});
    }

    return deferred.promise;
  },


  // @TODO Support required fields.
  _getAttrValue: function(attribute, attrName) {
    let self = this;

    let value = '';

    // Detect object references (attribute.type: undefined)
    if ( attribute.type === undefined ) {
      if ( attribute.$ref )
        value = `belongsTo:${attrName}`;
    }

    // Detect arrays (attribute.items)
    // Detect arrays (attribute.type: array)
    else if ( attribute.items || attribute.type === 'array' ) {
      // but not an array of references
      if ( attribute.items && attribute.items.$ref )
        value = `hasMany:${attrName}`;
      // or unless we are using the arraytype switch
      else if ( self.options.arraytype )
        value = attribute.type;
      // Ember Data doesn't have an 'array' type
    }

    // Everything else falls through and sets its native type.
    else
      value = attribute.type;

    return value;
  },


  _fetch: function(uri) {
    let self = this;
    let deferred = q.defer();
    let parseText = self.options.yaml ? yaml.load : JSON.parse;

    if (uri.search(/^https?:/) !== -1) {
      // Looks like a URL; try fetching
      request(uri, function (error, response, body) {
        if ( error ) {
          deferred.reject(error);
        }
        else {
          deferred.resolve(parseText(body));
        }
      });
    } else {
      // Doesn't look like a URL; it's probably a local file path
      fs.readFile(uri, 'utf8', function(error, body) {
        if ( error ) {
          deferred.reject(error);
        }
        else {
          deferred.resolve(parseText(body));
        }
      })
    }

    return deferred.promise;
  },

};
