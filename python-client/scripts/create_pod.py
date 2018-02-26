from kubernetes import client, config

config.load_incluster_config()
v1 = client.CoreV1Api()

pod=client.V1Pod()
pod.metadata=client.V1ObjectMeta(name="mypod")
container=client.V1Container(name="nginx")
container.image="nginx:1.7.9"
spec=client.V1PodSpec(containers=[container])
pod.spec = spec
v1.create_namespaced_pod(namespace="default",body=pod)