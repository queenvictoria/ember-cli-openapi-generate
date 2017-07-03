# ember-cli-openapi-generate

Generate Ember models from an OpenAPI schema.

## Usage

```
$ ember openapi https://example.com/api/swagger.json
```
### Options

(Under development)

* `--cli` Only generate `ember g model` style output
* `--resource` Use resources rather than models (model, route, template).
* `--update` Overwrite existing models

## Rationale

You can easily spin up a JSONAPI compliant Node/Express server backed by Mongo (along with other datastores) with [jsonapi-server](https://github.com/holidayextras/jsonapi-server). By adding a `swagger` configuration option you can provide an OpenAPI schema for the models you've created. All in all there is a lot of duplication in creating JOI models for the server and then data models for Ember. This Ember addon means that you can automate the creation of the Ember models and optionally use it to update them when the API changes.

## References

* https://swagger.io
* https://github.com/OAI/OpenAPI-Specification
* https://github.com/holidayextras/jsonapi-server/blob/master/documentation/swagger.md

This README outlines the details of collaborating on this Ember addon.

## Installation

* `git clone <repository-url>` this repository
* `cd ember-cli-openapi-generate`
* `npm install`
* `bower install`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
