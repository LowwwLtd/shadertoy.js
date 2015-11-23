void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    float ratio = iResolution.x / iResolution.y;
    vec2 uv = fragCoord / iResolution;
    uv.x *= ratio;
    fragColor = texture2D( iChannel0, uv );
}
