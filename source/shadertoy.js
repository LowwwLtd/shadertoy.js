var ShaderToy = function() {

    if ( window.WebGLRenderingContext ) {

        this.init();

    } else {

        console.error( 'You need a WebGL browser: Try get.webgl.org' );

    }

};

ShaderToy.prototype = {

    constructor: ShaderToy.prototype,

    _ready: false,

    _pause: false,

    mouse: new Float32Array( 2 ),

    _textureCount: 0,

    width: 320,

    height: 240,

    version: '0.0.1',

    _vertexShader: [
        'attribute vec2 position;',
        'void main() {',
        '   gl_Position = vec4( position, 0., 1. );',
        '}'
    ],

    _fragmentShader: [
        'precision highp float;',

        'uniform float iGlobalTime;',
        'uniform vec2 iResolution;',
        'uniform vec2 iMouse;',
        'uniform sampler2D iChannel0;',

        'void mainImage( out vec4 fragColor, in vec2 fragCoord ) { fragColor.rgb = vec3( 0.5 + 0.5 * cos( iGlobalTime ) ); }',

        'void main() {',
        '   vec4 color = vec4( 0., 0., 0., 1. );',
        '   mainImage( color, gl_FragCoord.xy );',
        '   gl_FragColor = color;',
        '}'
    ],

    _loadExternalFile: function( url ) {

        return new Promise( function( resolve, reject ) {

            var req = new XMLHttpRequest;
            req.open('GET', url);

            req.onload = function() {

                if ( req.status === 200 ) {

                    resolve( req.response );

                } else {

                    reject( Error( req.statusText ) );

                }
            };

            req.onerror = function() {
                reject( Error( 'Network Error' ) );
            };

            req.send();
        });

    },

    _createProgram: function( vertexShader, fragmentShader ) {

        var vs = this._createShader( vertexShader, this.gl.VERTEX_SHADER );
        var fs = this._createShader( fragmentShader, this.gl.FRAGMENT_SHADER );

        var program = this.gl.createProgram();
        this.gl.attachShader( program, vs );
        this.gl.attachShader( program, fs );
        this.gl.linkProgram( program );

        return program;
    },

    _createShader: function( str, type ) {

        var shader = this.gl.createShader( type );
        this.gl.shaderSource( shader, str );
        this.gl.compileShader(shader);

        var compiled = this.gl.getShaderParameter( shader, this.gl.COMPILE_STATUS );

        if ( !compiled ) {

            var error = this.gl.getShaderInfoLog( shader );
            console.error( 'Error compiling shader', shader, error );
            this.gl.deleteShader(shader);

            return null;

        }

        return shader;
    },

    _createNoiseTextureBuffer: function( width, height ) {

        var id = new Uint8Array( width * height * 4 );
        id.width = width;
        id.height = height;

        for (var i = 0; i < id.length; i += 4 ) {

            var c = Math.round( Math.random() * 255 );
            id[ i + 0] = c
            id[ i + 1] = c
            id[ i + 2] = c
            id[ i + 3] = 255

        }

        return id;

    },

    _createTextureBuffer: function() {

        return this._createNoiseTextureBuffer( 1, 1 );

    },

    _createTexture: function( buf, unit ) {

        this.gl.activeTexture( this.gl.TEXTURE0 + ( unit || 0 ) );
        var tex = this.gl.createTexture();
        this.gl.bindTexture( this.gl.TEXTURE_2D, tex );
        this.gl.pixelStorei( this.gl.UNPACK_FLIP_Y_WEBGL, false );

        if ( buf instanceof Float32Array ) {
            this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.gl.RGBA, buf.width, buf.height, 0, this.gl.RGBA, this.gl.FLOAT, buf );
            this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST );
            this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST );
            this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT );
            this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT );
        } else {
            this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.gl.RGBA, buf.width, buf.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, buf );
            this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR );
            this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR );
            this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT );
            this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT );
            this.gl.generateMipmap( this.gl.TEXTURE_2D);
        }

        return tex;

    },

    _getUniform: function( name ) {

        if ( !this.program.uniforms ) {
            this.program.uniforms = {};
        }

        if ( !this.program.uniforms[ name ] ) {
            this.program.uniforms[ name ] = this.gl.getUniformLocation( this.program, name );
        }

        return this.program.uniforms[ name ];

    },

    _getAttribute: function( name ) {

        if ( !this.program.atttributes ) {
            this.program.atttributes = {};
        }

        if ( !this.program.atttributes[ name ] ) {
            this.program.atttributes[ name ] = this.gl.getAttribLocation( this.program, name );
        }

        return this.program.atttributes[ name ];

    },

    _setU1f: function( name, x ) {

        this.gl.uniform1f( this._getUniform(name), x );

    },

    _setU2f: function( name, x, y ) {

        this.gl.uniform2f( this._getUniform(name), x, y );

    },

    _setU2fv: function( name, v2 ) {

        this.gl.uniform2fv( this._getUniform(name), v2 );

    },

    _setU1i: function( name, x ) {

        this.gl.uniform1i( this._getUniform(name), x );

    },

    _onBlur: function( e ) {

        this._pause = true;

    },

    _onFocus: function( e ) {

        this._pause = false;

    },

    _onMove: function( e ) {

        this.mouse[0] = e.layerX;
        this.mouse[1] = e.layerY;

    },

    init: function() {

        var canvas = document.createElement( 'canvas' );
        canvas.width = this.width;
        canvas.height = this.height;
        document.body.appendChild( canvas );

        window.addEventListener( 'blur', this._onBlur.bind(this) );
        window.addEventListener( 'focus', this._onFocus.bind(this) );
        window.addEventListener( 'mousemove', this._onMove.bind(this) );

        this.gl = canvas.getContext( 'webgl' );

        this.gl.getExtension( 'OES_texture_float' );
        this.gl.getExtension( 'OES_standard_derivatives' );

        if ( !this.gl ) {

            console.error( 'Couldn\'t start WebGL. Try get.webgl.org/troubleshooting' );
            return;
        }

        var args = [
            '\n%cShader%cToy %c v: ' + this.version + '\n',
            'background: #1A1A1A; color: #00ffff; font-size: x-large;',
            'background: #00ffff; color: #1A1A1A; font-size: x-large;',
            'background: transparent; color: #000000; font-size: x-small;'
        ];
        
        if ( !window.shadertoycredits ) {

            window.shadertoycredits = true;
            console.log.apply( console, args );

        }

        // random texture
        this.texture = this._createTexture(this._createNoiseTextureBuffer( 256, 256 ), this._textureCount++);

        // quad
        var quad = new Float32Array( [ -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0 ] );
        var buffer = this.gl.createBuffer();
        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, buffer );
        this.gl.bufferData( this.gl.ARRAY_BUFFER, quad, this.gl.STATIC_DRAW);

        // program
        var program = this._createProgram( this._vertexShader.join( '\n' ), this._fragmentShader.join( '\n' ) );
        this.useProgram( program );
    },

    load: function( url ) {

        this._ready = false;

        this._loadExternalFile( url ).then(function( data ) {

            this.write( data );

        }.bind( this ));

    },

    write: function( str ) {

        this._ready = false;

        this._fragmentShader[ 5 ] = str;

        var program = this._createProgram( this._vertexShader.join( '\n' ), this._fragmentShader.join( '\n' ) );
        this.useProgram( program );
    },

    useProgram: function( program ) {

        this.program = program;
        this.gl.useProgram( this.program );

        this.gl.enableVertexAttribArray( this._getAttribute( 'position' ) );
        this.gl.vertexAttribPointer( this._getAttribute( 'position' ), 2, this.gl.FLOAT, false, 0, 0 );

        this._setU2f( 'iResolution', this.width, this.height );

        this.startTime = Date.now();
        this._ready = true;

    },

    updateTexture: function( tex, buf, unit ) {

        this.gl.activeTexture( this.gl.TEXTURE0 + ( unit || 0 ) );
        this.gl.bindTexture( this.gl.TEXTURE_2D, tex );

        if ( buf instanceof Float32Array ) {
            this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.gl.RGBA, buf.width, buf.height, 0, this.gl.RGBA, this.gl.FLOAT, buf );
        } else {
            this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.gl.RGBA, buf.width, buf.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, buf );
        }

    },

    setSize: function( width, height ) {

        this.width = width;
        this.height = height;

        this.gl.canvas.width = this.width;
        this.gl.canvas.height = this.height;

        this.gl.viewportWidth = this.width;
        this.gl.viewportHeight = this.height;
        this.gl.viewport( 0, 0, this.width, this.height );

        if (this.program ) {

            this._setU2f( 'iResolution', this.width, this.height );

        }

    },

    clear: function( r, g, b, a ) {

        this.gl.clearColor( r || 0, g || 0, b || 0, a || 1 );
        this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

    },

    render: function() {

        if ( this._ready !== true ) return;
        if ( this._pause ) return;

        this._setU1f('iGlobalTime', (Date.now()-this.startTime)/1000);
        this._setU2fv('iMouse', this.mouse);
        this._setU1i('iChannel0', this.texture);

        this.clear()
        this.gl.drawArrays( this.gl.TRIANGLES, 0, 6 );

    }

}
