'use strict';

let q = require('q');
let request = require('request');
let _ = require('lodash');
let Blueprint = require('ember-cli/lib/models/blueprint');
let fs = require('fs');
// let Inflector = require('ember-inflector');

module.exports = {
    name: 'newgenerate',
    description: 'Given a openapi schema generate or update Ember models.',
    works: 'insideProject',
    // Defaults
    options: {
        cli: false,
        resource: false,
        arraytype: false
    },

    anonymousOptions: [
        '<url>'
    ],

    availableOptions: [
        { name: 'cli', type: Boolean, description: 'Generate cli commands instead of model files.' },
        { name: 'resource', type: Boolean, description: 'Generate resources instead of models (models, routes, templates and tests).' },
        { name: 'arraytype', type: Boolean, description: 'Arrays are an allowed type, you need to have an "array" transform' },
    ],

    /**
     */
    run: function (commandOptions, rawArgs) {
        let self = this;
        let deferred = q.defer();

        self.options = _.defaults(commandOptions, self.options);

        if (!rawArgs.length) {
            self.ui.writeLine('Please specify the URI or path to the OpenAPI schema as the first argument. eg: ember openapi https://example.com/api/swagger.json');
            return;
        }
        else {
            self.uri = rawArgs[0];
            self.ui.writeLine(`Generating models from ${self.uri}`);
        }

        self._fetch(self.uri)
            .then(function (result) {
                return self._parseOpenapi(result);
            })
            .fail(function (error) {
                deferred.reject(error);
            })
            ;

        return deferred.promise;
    },


    _parseOpenapi: function (data) {
        let self = this;
        let deferred = q.defer();

        // Check for definitions
        if (data.hasOwnProperty('definitions')) {
            let definitions = data.definitions;
            let promises = [];

            // Iterate definitions.
            _.each(data.definitions, function (definition, name) {
                promises.push(self._parseDefinition(definition, name));
            });

            q.allSettled(function (results) {
                deferred.resolve(results);
            })
                .fail(function (error) {
                    self.ui.writeLine(JSON.stringify(error));
                    deferred.reject(error);
                });

        }
        else {
            deferred.reject({ message: `openapi at ${self.uri} doesn't contain definitions.` });
        }

        return deferred.promise;
    },


    _parseDefinition: function (definition, name) {
        let self = this;
        let deferred = q.defer();

        if (name !== 'error') {
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
                _.each(attributes, function (attribute, attrName) {
                    if (attrName.toLowerCase() === 'id') {
                        return;
                    }

                    // @TODO Required.
                    if (['array', 'object'].indexOf(attribute.type) < 0 || (attribute.type === 'array' && self.options.arraytype)) {
                        // Undefined are object with references
                        if (attribute.type === undefined) {
                            // References are references to other object (definitions)
                            if (attribute.$ref !== undefined && attribute.$ref !== '') {
                                attr[attrName] = 'belongsTo:'+ attrName;
                            }
                            else {
                                attr[attrName] = '';
                            }
                        }
                        else {
                            // Since the type can be an array, the array can be an array of string/objects (other models)
                            if (attribute.items !== undefined) {
                                if ((attribute.items.$ref !== undefined && attribute.$ref !== '')) {
                                    attr[attrName] = 'hasMany:' + attrName;
                                }
                                else {
                                    attr[attrName] = attribute.type;
                                }
                            }
                            else {
                                if (!(self.options.arraytype) && attribute.type === 'array') {
                                    attr[attrName] = 'hasMany:' + attrName;
                                }
                                else {
                                    attr[attrName] = attribute.type;
                                }
                            }
                        }
                    }
                    else {
                        // At this point the attribute is an array
                        attr[attrName] = 'hasMany:' + attrName;
                    }
                });

                // Model or Resource
                let blueprintName = "model";
                if (self.options.resource)
                    blueprintName = "resource";

                // let modelName = Inflector.inflector.singularize(name);
                let modelName = name.replace(/s$/, '');

                // Either output CLI generate command.
                if (self.options.cli) {
                    let fields = _.chain(attr).toPairs().map(function (pair) {
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
                deferred.reject({ error: `Rejecting ${name} as definitions are missing.` });
            }
        }
        else {
            deferred.resolve({ error: `Rejecting ${name} as its illegal.` });
        }

        return deferred.promise;
    },


    _fetch: function (uri) {
        let self = this;
        let deferred = q.defer();

        if (uri.search(/^https?:/) !== -1) {
            // Looks like a URL; try fetching
            request(uri, function (error, response, body) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(JSON.parse(body));
                }
            });
        } else {
            // Doesn't look like a URL; it's probably a local file path
            fs.readFile(uri, 'utf8', function (error, body) {
                if (error) {
                    deferred.reject(error);
                }
                else {
                    deferred.resolve(JSON.parse(body));
                }
            })
        }

        return deferred.promise;
    },

};
