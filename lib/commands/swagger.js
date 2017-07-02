'use strict';


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
    var self = this;
    var uri;

    if ( ! rawArgs.length ) {
      this.ui.writeLine('Please specify the URI to the swagger schema as the first argument. eg: ember swagger https://example.com/api/swagger.json');
      return;
    }
    else {
      uri = rawArgs[0];
      this.ui.writeLine(`Generating models from ${uri}`);
    }

  },

};
