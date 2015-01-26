LightingEngine
==============

A 2D lighting and shadows engine using WebGL and Javascript.

A live example can be found here: https://corybeams.com/lightingengine/

![alt tag](http://puu.sh/e8waf/5bace22882.jpg)

## Getting started

```javascript
var le = new LightingEngine(canvas);
var colour = { r: 0, g: 125, b: 0, a: 255 };
le.createPolygon(100, 100, 5, 50, colour, true);
le.setLightColour(255, 0, 0);
le.createPointLight(200, 200);
le.init();

le.update();
le.render();
```

This will start the engine with the provided canvas, create a green pentagon at x = 100 and y = 100 and put it in the foreground layer, set the light colour to red, create a point light at x = 200 and y = 200 and finally initialize the engine. After this the engine is updated and then renders to the canvas.

A more in-depth getting started guide can be found on the wiki [right here](https://github.com/Jaloko/LightingEngine/wiki/Getting-started). 

## Documentation
The lighting engine is fully documented and can be found on the [wiki](https://github.com/Jaloko/LightingEngine/wiki).
