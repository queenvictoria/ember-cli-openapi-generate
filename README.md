# ember-cli-openapi-generate

Generate Ember models from an OpenAPI schema.

## Installation

```
ember install ember-cli-openapi-generate
```

## Usage

```
# Generate from a web-accessible swagger.json
$ ember openapi https://example.com/api/swagger.json

# Or, generate from a local file
$ ember openapi /path/to/your/swagger.json
```
### Options

(Under development)

* `--cli` Only generate `ember g model` style output
* `--resource` Use resources (`ember g resource`) rather than models (model, route, template).

## Rationale

You can easily spin up a JSONAPI compliant Node/Express server backed by Mongo (along with other datastores) with [jsonapi-server](https://github.com/holidayextras/jsonapi-server). By adding a `swagger` configuration option you can provide an OpenAPI schema for the models you've created. All in all there is a lot of duplication in creating JOI models for the server and then data models for Ember. This Ember addon means that you can automate the creation of the Ember models and optionally use it to update them when the API changes.

## References

* https://swagger.io
* https://github.com/OAI/OpenAPI-Specification
* https://github.com/holidayextras/jsonapi-server/blob/master/documentation/swagger.md
