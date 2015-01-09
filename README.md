LightingEngine
==============

A 2D lighting and shadows engine using WebGL and Javascript.

A live example can be found here: https://corybeams.com/lightingengine/

![alt tag](http://puu.sh/e8waf/5bace22882.jpg)

## Getting started

```javascript
var le = new LightingEngine(canvas);
le.createPolygon(100, 100, 5, 50);
le.setLightColour(255, 0, 0);
le.createSpotLight(200, 200);
le.init();

le.update();
le.render();
```

This will start the engine with the provided canvas, create a pentagon at x = 100 and y = 100, set the light colour to red, create a spot light at x = 200 and y = 200 and finally initialize the engine. After this the engine is updated and then renders to the canvas.
