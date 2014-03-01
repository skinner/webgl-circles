function WebGLCircleRenderer(glowContext, circleCount, colors, radii) {
    this.context = glowContext;
    this.count = circleCount;

    var vertShader = [
        "uniform mat4 u_matrix;",
        "attribute float a_x;",
        "attribute float a_y;",
        "attribute float a_radius;",
        "attribute vec3 a_color;",
        "varying vec3 v_color;",
        
        "void main() {",
        "    gl_PointSize = a_radius;",
        "    gl_Position = u_matrix * vec4(a_x, a_y, 1.0, 1.0);",
        "    v_color = a_color;",
        "}"
    ].join("\n");

    var fragShader = [
        "precision mediump float;",
        "varying vec3 v_color;",

        "void main() {",
        "    vec2 dxy = gl_PointCoord - 0.5;",
        "    vec2 dxy2 = pow(dxy, vec2(2.0));",
        "    float centerDist = sqrt(dxy2.x + dxy2.y);",
        "    float radius = 0.5;",
        "    // works for overlapping circles if blending is enabled",
        "    gl_FragColor = vec4(v_color, 0.3 * step(centerDist, radius));",
        "}"
    ].join("\n");

    var circleShaderInfo = {
        vertexShader: vertShader,
        fragmentShader: fragShader,

        data: {
            // uniforms
            // Use a transformation matrix that makes 1 unit 1 pixel.
            u_matrix: { value: new Float32Array([
                2 / this.context.width, 0, 0, 0,
                0, 2 / this.context.height, 0, 0,
                0, 0, 1, 0,
                -1, -1, 0, 1
            ])},
            
            // attributes
            a_color: new Float32Array(colors),
            a_radius: new Float32Array(radii),
            a_x: new Float32Array(circleCount),
            a_y: new Float32Array(circleCount)
        },

        primitives: this.context.GL.POINTS,

        interleave: {
            a_x: false,
            a_y: false
        },

        usage: {
            a_x: this.context.GL.DYNAMIC_DRAW,
            a_y: this.context.GL.DYNAMIC_DRAW
        }
    };

    this.shader = new GLOW.Shader(circleShaderInfo);
}

WebGLCircleRenderer.prototype.setPositions = function(xs, ys) {
    this.shader.attributes.a_x.bufferData(xs);
    this.shader.attributes.a_y.bufferData(ys);
};

WebGLCircleRenderer.prototype.draw = function() {
    this.shader.draw();
};
