/* eslint-env node */
'use strict';


module.exports = {
  name: 'ember-cli-swagger-blueprints',

  includedCommands: function() {
    return {
      'swagger': require('./lib/commands/swagger'),
    };
  },

  isDevelopingAddon: function() {
    return true;
  },

};
