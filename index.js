/* eslint-env node */
'use strict';


module.exports = {
  name: 'ember-cli-openapi-generate',

  includedCommands: function() {
    return {
      'openapi': require('./lib/commands/openapi'),
    };
  },

  isDevelopingAddon: function() {
    return true;
  },

};
