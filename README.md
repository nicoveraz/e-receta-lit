# Experimento de NewtriLabs

## QR que incorpora receta encriptada y firma del médico con esquema llave pública/privada de 256bits

Proyecto creado con el fin de lograr transición desde receta tradicional en papel a receta electrónica en forma natural ya que receta QR puede ser impresa o compartida por medios digitales

Lector restringido a acceso con email, para médicos enrolados en el sistema y usuarios autorizados, por ejemplo, de farmacias. Graba en base de datos si receta fue despachada, evitando doble venta de producto, lo que permitiría recetas digitales "retenidas"

Importante: A pesar de ser seguro y basarse en últimas tecnologías de encriptación, este proyecto aún no cumple con legislación chilena para recetas electrónicas, pues no cuenta con Firma Digital Avanzada para cada médico (Requerimiento, en nuestra opinión, completamente innecesario)

Fácilmente se puede incorporar firma electrónica a nuestro sistema en el futuro

e-receta.cl es un proyecto en desarrollo, es libre de probarlo en forma gratuita, pero no debe ser utilizado para recetas reales

## e-receta app

[![Built with open-wc recommendations](https://img.shields.io/badge/built%20with-open--wc-blue.svg)](https://github.com/open-wc)


## Scripts

- `start` runs your app for development, reloading on file changes
- `start:build` runs your app after it has been built using the build command
- `build` builds your app and outputs it in your `dist` directory
- `test` runs your test suite with Karma
- `lint` runs the linter for your project
- `firebase deploy` sube proyecto a fb 
