# ember-cli-openapi-generate

Generate Ember models from an OpenAPI schema.

## Installation

```
ember install ember-cli-openapi-generate
```

## Usage

Generate from a web-accessible swagger.json
```
$ ember openapi http://petstore.swagger.io/v2/swagger.json
```

Or, generate from a local file
```
$ ember openapi /path/to/your/swagger.json
```


An arraytype option is available. Use this when you have an array transform created and want to have regular string/int arrays as attribute type when parsing models through openapi.json files.
```
$ ember openapi http://petstore.swagger.io/v2/swagger.json --arraytype
```

The difference between a regular generate command and the arraytype generate command is shown in the following example.
```diff
diff --git a/app/models/pet.js b/app/models/pet.js
index 6249237..517e5c2 100644
--- a/app/models/pet.js
+++ b/app/models/pet.js
@@ -3,7 +3,7 @@ import DS from 'ember-data';
 export default DS.Model.extend({
   category: DS.belongsTo('category'),
   name: DS.attr('string'),
-  photoUrls: DS.hasMany('photo-url'),
+  photoUrls: DS.attr('array'),
   tags: DS.hasMany('tag'),
   status: DS.attr('string')
 });
```


### Options

(Under development)

* `--cli` Only generate `ember g model` style output.
* `--resource` Use resources (`ember g resource`) rather than only models (which will create models, routes and templates).
* `--arraytype ` Use an array transform (see Usage notes).


## Rationale

You can easily spin up a JSONAPI compliant Node/Express server backed by Mongo (along with other datastores) with [jsonapi-server](https://github.com/holidayextras/jsonapi-server). By adding a `swagger` configuration option you can provide an OpenAPI schema for the models you've created. All in all there is a lot of duplication in creating JOI models for the server and then data models for Ember. This Ember addon means that you can automate the creation of the Ember models and optionally use it to update them when the API changes.

## References

* https://swagger.io
* https://github.com/OAI/OpenAPI-Specification
* https://github.com/holidayextras/jsonapi-server/blob/master/documentation/swagger.md
