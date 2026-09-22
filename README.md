# Recursos por dimensión

Primer recurso: **Bienestar intelectual y avance académico**.

> Simula tus resultados, planea tu aprendizaje y cuida tu avance.

Sitio estático, en español, para acompañar a estudiantes de primer semestre. Los datos se procesan en memoria en el navegador y desaparecen al recargar; no se envían a un servidor desde los simuladores. El proveedor de alojamiento puede registrar accesos al sitio.

## Contenido

- Simulador de UF con varios escenarios por materia, componentes, pesos y notas obtenidas/esperadas.
- Promedio ponderado de las UF capturadas, con confirmación explícita de la carga completa.
- Costo por crédito con tarifa capturada por el estudiante.
- Rutas a MiTec, reglamento de becas y fuentes institucionales.
- Fechas académicas de baja separadas de tablas de cobro.

No se autocompletan créditos desde SAMP. Los estudiantes consultan su plan y horario. El docente es la primera fuente para criterios de evaluación. El resultado no determina aprobación, sanciones ni estatus de beca.

## Vista local

Desde la carpeta del proyecto:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Abrir http://127.0.0.1:4173. No se necesitan paquetes ni un proceso de compilación.

## Comprobación

```sh
node --test tests/calculations.test.mjs
node --check dist/app.js
```

## GitHub Pages

Repositorio propuesto: `MentorIATec/recursos-por-dimension`.

1. Mantener el contenido del proyecto en la rama `main`.
2. Publicar la carpeta estática en la rama `gh-pages` con `git subtree push --prefix dist origin gh-pages` después de guardar los cambios en un commit.
3. En Settings → Pages → Build and deployment, seleccionar **Deploy from a branch**, rama `gh-pages`, carpeta `/ (root)`.
4. Abrir la dirección confirmada por GitHub Pages.

La rama de publicación contiene solo `dist`; no publica las pruebas ni esta documentación. Todas las rutas de los recursos son relativas y funcionan bajo el prefijo del repositorio. Antes de cada publicación, ejecutar las comprobaciones indicadas arriba.

## Fuentes y revisión de contenido

- `dist/fuentes/reglamento-becas-2026.pdf`: archivo proporcionado, modificación 2026. Definición de promedio de beca; artículos 55–69 y 72.
- `dist/fuentes/cuotas-agosto-diciembre-2026.pdf`: archivo proporcionado de Campus Monterrey, Profesional Tec21, agosto–diciembre 2026. No se ha confirmado aplicabilidad a ING26.
- `dist/fuentes/fechas-bajas-2026.png`: captura proporcionada. No identifica campus ni plan; confirmar alcance institucional. Se conserva literalmente la fecha 15/09/2026 aunque la regla textual de la captura menciona “3er. día”; no se infieren otras fechas.
- SAMP: https://samp.itesm.mx/Programas/VistaPrograma?clave=ING26&modoVista=Default&idioma=ES&cols=0
- Ruta de solicitud para estudiantes actuales: https://solicitud.tec.mx/ERx_Forms__Portal_Login?lang=es
- Políticas y reglamentos: https://tec.mx/es/profesional/politicas-y-reglamentos

La captura de MiTec de 2024 no se usa como calendario vigente. Las tablas económicas representan **cobro**, no reembolso garantizado. El documento no da un plazo separado para solicitar reembolso. Se remite a Tesorería.

Para actualizar periodos, revisar `dist/reference-data.mjs`, las tarifas y los avisos de alcance en `dist/index.html`, sustituir las fuentes y actualizar la fecha de referencia. No extrapolar requisitos de beca entre programas.

La calculadora muestra dos decimales, sin aplicar reglas institucionales de redondeo. El valor interno conserva precisión al transferir una UF al semestre. Al reenviar el mismo escenario se actualiza su fila, sin duplicarlo. Las modificaciones posteriores en un módulo no se propagan hasta volver a transferir el escenario. Una fila incompleta bloquea el resultado, en lugar de descartarse. Una UF con cero créditos no afecta el promedio ni requiere una nota numérica.

## Extender a otras dimensiones

Esta primera versión ocupa la portada del repositorio. Las futuras dimensiones pueden añadirse como carpetas independientes en `dist/`, sin cambiar el motor de simulación. No se han creado módulos adicionales sin definir su contenido pedagógico.
