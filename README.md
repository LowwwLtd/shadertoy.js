# ShaderToy
WebGL Renderer for quick shader based toys.
If you are familiar with [http://shadertoy.com](http://shadertoy.com), you will quickly be able to use this tool.

### Example ###
[![Basic Example](http://andrevenancio.com/thumbnails/1.png)](http://andrevenancio.com/experiments/1.html)

### Shader Inputs ###
```glsl
// viewport resolution (in pixels).
uniform vec2 iResolution;

// shader playback time (in seconds).
uniform vec2 iGlobalTime;

// mouse pixel coordinates.
uniform vec2 iMouse;

// input texture.
uniform sampler2D iChannel0;
```

### Usage ###

The most basic usage is described below. This will start the factory shader.
```html
<script>

    var renderer;

    init()
    update()

    function init() {

        renderer = new ShaderToy();
        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    function update() {

        requestAnimationFrame( update );

        renderer.render();

    }

</script>
```

Next you need to decide how to feed the new shader. You can load an external GLSL file by calling the `.loadFragment()` method, or you can write your shader inline accessing directly the `.writeFragment()` method.


Loading an external file:
```javascript
function init() {

    renderer = new ShaderToy();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.loadFragment( 'path/to/my/glsl.file' );

}
```

Writing inline:
```javascript
function init() {

    renderer = new ShaderToy();
    renderer.setSize( window.innerWidth, window.innerHeight );

    var fragment = [
        'void mainImage( out vec4 fragColor, in vec2 fragCoord ) {',
        '   fragColor.rgb = vec3( 0.0, 1.0, 1.0 );',
        '}'
    ].join( '\n' );

    renderer.writeFragment( fragment );

}
```
