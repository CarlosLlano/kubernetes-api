## ACCESO AL API DE KUBERNETES DENTRO DE UN POD


## INTRODUCCIÓN 

En Kubernetes existen una gran cantidad de recursos o entidades (pods, deployments,
services, secrets, etc) que pueden ser administrados usando el comando “kubectl”. Sin
embargo, todos estos recursos pueden ser administrados directamente usando la API Rest
de kubernetes (https://v1-8.docs.kubernetes.io/docs/api-reference/v1.8/).

El llamado al api se puede realizar directamente o utilizando librerías integradas a algunos
lenguajes de programación, librerías que pueden ser oficiales (soportadas por el equipo de
kubernetes) o mantenidas por la comunidad de desarrolladores. Actualmente, existen
librerías oficiales para Go, python y java, y librerías “no oficiales” para lenguajes como
nodejs, ruby o php. En el siguiente enlace se encuentra mayor documentacion sobre estas
librerias: https://kubernetes.io/docs/reference/client-libraries/

Independientemente del método que se utilice, todo llamado al api desde un pod debe ser
autenticado proporcionando un token y un certificado de seguridad. ¿Cómo obtenerlos?
Afortunadamente, esta información ya está disponible. Cuando se crea un pod, kubernetes
ubica en el filesystem del pod estos archivos en las siguientes rutas.

- Certificado: _var/run/secrets/kubernetes.io/serviceaccount/ca.crt_
- Token: _/var/run/secrets/kubernetes.io/serviceaccount/token_

A continuación se mostrará a través de una demo como acceder al api desde un pod usando
las distintas opciones de acceso (directo y con librerías)

**DETALLES DE LA DEMO**

La demo consiste en crear y borrar un pod (contenedor nginx) desde dentro de otro pod
usando el comando curl, y librerías para python y nodejs.

**PRERREQUISITOS**

- Crear un cluster de kubernetes en ibm cloud: https://console.bluemix.net
- Configuración del cliente de bluemix (bx): https://console.bluemix.net/docs/containers/cs_cli_install.html#cs_cli_install_steps
- Instalación de kubectl: https://kubernetes.io/docs/tasks/tools/install-kubectl/


## PASOS PREVIOS

Configurar acceso al cluster con kubectl
```bash
bx cs cluster-config mycluster
```

Al ejecutar el comando anterior, se obtentrá el valor de la variable de ambiente
KUBECONFIG. Se debe exportar dichar variable usando el comando:
```bash
export KUBECONFIG=<valor>
```
Añadir espacio de nombres para las imágenes de los contenedores
```bash
bx cr namespace-add <name>
```
Clonar codigo
```bash
git clone https://github.com/CarlosLlano/kubernetes-api
```
## ACCESO DIRECTO AL API

El acceso directo se puede realizar utilizando el comando curl con la siguiente estructura:
```bash
curl -v --cacert /var/run/secrets/kubernetes.io/serviceaccount/ca.crt -H
"Authorization: Bearer $(cat
/var/run/secrets/kubernetes.io/serviceaccount/token)" \
https://kubernetes.default:$KUBERNETES_PORT_443_TCP_PORT/<endpoint> \
<HTTP_METHOD> <ARGUMENTS>
```
Observe como es necesario especificar la ubicación del token y del certificado de seguridad
en el pod.

En el siguiente ejemplo, se hará el deployment de un pod al cual se accederá para hacer
llamados al api con el comando curl. Para ello, se deben realizar los siguientes pasos:

**1. Entrar al proyecto**
```bash
cd curl-command/
```
**2. Subir imagen del contenedor al registry de bluemix**
```bash
bx cr build -t <name> <dockerfile-path> # <name> = registry.<domain>/<namespace>/<imagename:version>
```


Para consultar los domain disponibles:
```bash
bx regions
```
ejemplo:
```bash
bx cr build -t registry.ng.bluemix.net/dakar9499ns/centospod:0.0.1 .
```
Para comprobar que la imagen ha sido subida correctamente:
```bash
bx cr images
```
**3. Realizar deployment del pod**

Para ello se utiliza el siguiente archivo .yml.
```yml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: centosapp
spec:
  replicas: 1 
  template: 
    metadata:
      labels:
        app: centosapp
    spec:
      containers:
      - name: centosapp
        image: "registry.ng.bluemix.net/dakar9499ns/centospod:0.0.1"
        imagePullPolicy: Always
```

Se debe cambiar el nombre de la imagen por el nombre dado en el paso 2.

Ejecutar el comando:
```bash
kubectl apply -f deployment.yaml
```

**4. Verificar creación**

![captura de pantalla 2018-07-13 a la s 2 24 16 p m](https://user-images.githubusercontent.com/17281733/42710187-a1331476-86a8-11e8-967d-1bfd7888df1b.png)

**5. Acceder al pod**
```bash
kubectl exec -it <pod_name> /bin/bash
```

**6.Ejecutar scripts**
```bash
cd scripts/
sh create_pod.sh
sh delete_pod.sh
```
## ACCESO AL API CON NODEJS

En el siguiente ejemplo, se hará el deployment de un pod que ejecuta una aplicación nodejs.
Posteriormente, se accederá al pod para hacer llamadas al api usando una librería de
kubernetes para nodejs (https://github.com/godaddy/kubernetes-client).

**1. Entrar al Proyecto**
```bash
cd node-client/
```
**2. Subir imagen del contenedor al registry de bluemix**
```bash
bx cr build -t <name> <dockerfile-path> # <name> = registry.<domain>/<namespace>/<imagename:version>
```

Ejemplo:
```bash
bx cr build -t registry.ng.bluemix.net/dakar9499ns/nodeapp:0.0.1 .
```
**3. Realizar deployment del pod**

Para ello se utiliza el siguiente archivo .yml.
```yml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: nodeapp
spec:
  replicas: 1 
  template: 
    metadata:
      labels:
        app: nodeapp
    spec:
      containers:
      - name: nodeapp
        image: "registry.ng.bluemix.net/dakar9499ns/nodeapp:0.0.1"
        imagePullPolicy: Always
        ports:
        - containerPort: 80
```

Se debe cambiar el nombre de la imagen por el nombre dado en el paso 2.

Ejecutar el comando:
```bash
kubectl apply -f deployment.yaml
```

**4. Verificar creación**

![captura de pantalla 2018-07-13 a la s 2 26 38 p m](https://user-images.githubusercontent.com/17281733/42710226-c5812458-86a8-11e8-9916-ee123090b6ea.png)

**5. Acceder al pod**
```bash
kubectl exec -it <pod_name> /bin/bash
```
**6.Ejecutar scripts**

Utilizando esta librería para nodejs no es necesario hacer referencia directamente al token
y el certificado de seguridad almacenados en el pod. Por el contrario, basta con usar las
siguientes líneas de código para obtener ambos elementos:
```node
const Api = require('kubernetes-client');
const api = new Api.Api(Api.config.getInCluster());
```

Para probar el funcionamiento, ejecutar los scripts con los siguientes comandos:
```bash
cd scripts/
node create_pod.js
node delete_pod.js
```
## ACCESO AL API CON PYTHON

En el siguiente ejemplo, se hará el deployment de un pod que ejecuta una aplicación
python.

Posteriormente, se accederá al pod para hacer llamadas al api usando una librería oficial de
kubernetes para python (https://github.com/kubernetes-client/python).

Al ser una librería oficial, tiene mayor documentacion, la cual puede ser consultada en:
https://github.com/kubernetes-client/python/tree/master/kubernetes/docs

**1. Entrar al Proyecto**
```bash
cd python-client/
```
**2. Subir imagen del contenedor al registry de bluemix**
```bash
bx cr build -t <name> <dockerfile-path> # <name> = registry.<domain>/<namespace>/<imagename:version>
```

Ejemplo:
```bash
bx cr build -t registry.ng.bluemix.net/dakar9499ns/pythonapp:0.0.1 .
```
**3. Realizar deployment del pod**

Para ello se utiliza el siguiente archivo .yml.
```yml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: pythonapp
spec:
  replicas: 1
  template: 
    metadata:
      labels:
        app: pythonapp
    spec:
      containers:
      - name: pythonapp
        image: "registry.ng.bluemix.net/dakar9499ns/pythonapp:0.0.1"
        imagePullPolicy: Always
        ports:
        - containerPort: 5000
```

Se debe cambiar el nombre de la imagen por el nombre dado en el paso 2.

Ejecutar el comando:
```bash
kubectl apply -f deployment.yaml
```
**4. Verificar creación**

![captura de pantalla 2018-07-13 a la s 2 28 37 p m](https://user-images.githubusercontent.com/17281733/42710295-0d2c5c00-86a9-11e8-8153-7ce4300ef19f.png)

**5. Acceder al pod**
```bash
kubectl exec -it <pod_name> /bin/sh
```
**6.Ejecutar scripts**

Utilizando esta librería para python no es necesario hacer referencia directamente al token
y el certificado de seguridad almacenados en el pod. Por el contrario, basta con usar las
siguientes líneas de código para obtener ambos elementos:

```python
from kubernetes import client, config
config.load_incluster_config()
v1 = client.CoreV1Api()
```
Para probar el funcionamiento, ejecutar los scripts con los siguientes comandos:
```bash
cd scripts/
python create_pod.py
python delete_pod.py
```
