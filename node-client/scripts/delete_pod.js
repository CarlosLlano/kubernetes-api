const Api = require('kubernetes-client');

//Get credentials (token and certificate) and api endpoints
const api = new Api.Api(Api.config.getInCluster());

// DELETE POD
api.group('v1').ns('default').pods.delete('mynginxpod');
