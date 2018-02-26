const Api = require('kubernetes-client');

//Get credentials (token and certificate) and api endpoints
const api = new Api.Api(Api.config.getInCluster());

const podJSON = {
    "apiVersion": "v1",
    "kind": "Pod",
    "metadata": {
      "name": "mynginxpod"
    },
    "spec": {
      "containers": [
        {
          "name": "nginx",
          "image": "nginx:1.7.9",
          "ports": [
            {
              "containerPort": 80
            }
          ]
        }
      ]
    }
};

// CREATE POD
api.group('v1').ns('default').pods.post({ body: podJSON });




