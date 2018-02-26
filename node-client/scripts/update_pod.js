const Api = require('kubernetes-client');

//Get credentials (token and certificate) and api endpoints
const api = new Api.Api(Api.config.getInCluster());

//UPDATE POD
const podJSONupdated = {
    "apiVersion": "v1",
    "kind": "Pod",
    "metadata": {
      "name": "mynginxpod"
    },
    "spec": {
      "containers": [
        {
          "name": "nginx",
          "image": "nginx:1.8",
          "ports": [
            {
              "containerPort": 80
            }
          ]
        }
      ]
    }
  };
  api.group('v1').ns('default').pods('mynginxpod').patch({ body: podJSONupdated });
  