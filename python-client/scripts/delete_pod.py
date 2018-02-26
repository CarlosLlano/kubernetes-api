from kubernetes import client, config

config.load_incluster_config()
v1 = client.CoreV1Api()

v1.delete_namespaced_pod(namespace="default", name="mypod",body=client.V1DeleteOptions())