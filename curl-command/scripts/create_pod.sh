curl -v --cacert /var/run/secrets/kubernetes.io/serviceaccount/ca.crt -H "Authorization: Bearer $(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" https://kubernetes.default:$KUBERNETES_PORT_443_TCP_PORT/api/v1/namespaces/default/pods -XPOST -H'Content-Type: application/json' -d@pod.json

