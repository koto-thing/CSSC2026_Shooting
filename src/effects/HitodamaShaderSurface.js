const VERTEX_SHADER = `
    attribute vec2 aPosition;
    varying vec2 vUv;

    void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

const FRAGMENT_SHADER = `
    precision mediump float;

    varying vec2 vUv;

    uniform float uTime;
    uniform float uPhase;
    uniform vec2 uResolution;

    float hash21(vec2 p)
    {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
    }

    float valueNoise(vec2 p)
    {
        vec2 cell = floor(p);
        vec2 local = fract(p);

        local = local * local * (3.0 - 2.0 * local);

        float a = hash21(cell);
        float b = hash21(cell + vec2(1.0, 0.0));
        float c = hash21(cell + vec2(0.0, 1.0));
        float d = hash21(cell + vec2(1.0, 1.0));

        return mix(
            mix(a, b, local.x),
            mix(c, d, local.x),
            local.y
        );
    }

    float fbm(vec2 p)
    {
        float result = 0.0;
        float amplitude = 0.5;

        for (int i = 0; i < 4; i++)
        {
            result += valueNoise(p) * amplitude;
            p = p * 2.03 + vec2(17.13, 9.71);
            amplitude *= 0.5;
        }

        return result;
    }

    float ellipseMask(
        vec2 p,
        vec2 center,
        vec2 radius,
        float softness
    )
    {
        float d = length((p - center) / radius);
        return 1.0 - smoothstep(1.0 - softness, 1.0 + softness, d);
    }

    float ellipseGlow(
        vec2 p,
        vec2 center,
        vec2 radius,
        float expansion
    )
    {
        float d = length((p - center) / radius);
        return 1.0 - smoothstep(1.0, 1.0 + expansion, d);
    }

    float flameShape(
        vec2 p,
        float bottom,
        float top,
        float bottomWidth,
        float topWidth,
        float curve,
        float seed
    )
    {
        float progress = clamp(
            (p.y - bottom) / max(top - bottom, 0.001),
            0.0,
            1.0
        );

        float swayAmount = pow(progress, 1.35);

        float sway =
            sin(
                p.y * 6.2 -
                uTime * 3.1 +
                uPhase +
                seed
            ) * 0.065;

        sway +=
            sin(
                p.y * 13.0 +
                uTime * 4.8 +
                seed * 2.37
            ) * 0.018;

        float noiseValue = fbm(vec2(
            p.y * 3.2 - uTime * 1.35,
            seed + uPhase * 0.31
        ));

        sway += (noiseValue - 0.5) * 0.12 * swayAmount;

        float centerX =
            curve * progress * progress +
            sway * swayAmount;

        float width = mix(
            bottomWidth,
            topWidth,
            pow(progress, 0.72)
        );

        float widthNoise = fbm(vec2(
            p.y * 5.0 + seed * 7.0,
            uTime * 0.75 + seed
        ));

        width *= 0.88 + widthNoise * 0.22;

        float horizontalDistance =
            abs(p.x - centerX) / max(width, 0.001);

        float horizontalMask =
            1.0 - smoothstep(0.82, 1.08, horizontalDistance);

        float bottomMask = smoothstep(
            bottom - 0.055,
            bottom + 0.055,
            p.y
        );

        float topMask =
            1.0 - smoothstep(
                top - 0.10,
                top + 0.025,
                p.y
            );

        return horizontalMask * bottomMask * topMask;
    }

    void main()
    {
        vec2 p = vUv * 2.0 - 1.0;

        /*
         * 上が正、下が負の座標として扱う。
         * Canvasの表示方向によって上下が反転する場合は、
         * 次の行を有効にする。
         */
        // p.y *= -1.0;

        float time = uTime;

        /*
         * 全体がゆっくり呼吸するように横幅を変化させる。
         * 上部ほど大きく変形させる。
         */
        float upperAmount = smoothstep(-0.45, 0.85, p.y);

        float globalSway =
            sin(time * 2.5 + uPhase) * 0.018;

        globalSway +=
            sin(time * 4.1 + uPhase * 1.73) * 0.008;

        p.x -= globalSway * upperAmount;

        /*
         * 輪郭を少しだけ波打たせるためのドメインワープ。
         */
        float warpNoise = fbm(vec2(
            p.y * 2.8 - time * 0.95,
            uPhase + 13.7
        ));

        p.x +=
            (warpNoise - 0.5) *
            0.065 *
            smoothstep(-0.60, 0.90, p.y);

        /*
         * 下部の丸い魂。
         * 完全な円ではなく、上下に複数の楕円を重ねて
         * 雫に近い形状を作る。
         */
        float lowerOrb = ellipseMask(
            p,
            vec2(0.0, -0.50),
            vec2(0.39, 0.34),
            0.12
        );

        float middleOrb = ellipseMask(
            p,
            vec2(-0.015, -0.27),
            vec2(0.31, 0.36),
            0.13
        );

        float neck = ellipseMask(
            p,
            vec2(0.005, -0.03),
            vec2(0.235, 0.31),
            0.15
        );

        /*
         * 中央のメインとなる炎。
         */
        float mainFlame = flameShape(
            p,
            -0.38,
             0.88,
             0.285,
             0.018,
            -0.055,
             2.1
        );

        /*
         * 左右に出る小さな炎。
         * メインの炎とは別の周期で動かす。
         */
        vec2 leftP = p;
        leftP.x += 0.075;
        leftP.y += 0.02;

        float leftFlame = flameShape(
            leftP,
            -0.05,
             0.68,
             0.145,
             0.012,
            -0.18,
             7.4
        );

        vec2 rightP = p;
        rightP.x -= 0.065;
        rightP.y -= 0.015;

        float rightFlame = flameShape(
            rightP,
             0.02,
             0.59,
             0.125,
             0.010,
             0.17,
            12.7
        );

        /*
         * 先端付近に浮かぶ短い炎片。
         * 本体から離れすぎない程度に出現させる。
         */
        vec2 wispPosition = vec2(
            0.10 +
            sin(time * 3.6 + uPhase) * 0.045,

            0.69 +
            sin(time * 4.4 + uPhase * 1.4) * 0.035
        );

        float wisp = ellipseMask(
            p,
            wispPosition,
            vec2(0.075, 0.14),
            0.18
        );

        float wispPulse =
            0.55 +
            0.45 * sin(time * 3.2 + uPhase * 2.0);

        wisp *= smoothstep(0.08, 0.85, wispPulse);

        float body = max(lowerOrb, middleOrb);
        body = max(body, neck);
        body = max(body, mainFlame);
        body = max(body, leftFlame * 0.93);
        body = max(body, rightFlame * 0.88);
        body = max(body, wisp * 0.72);

        /*
         * 輪郭を不均一に削り、
         * ベクター図形のような滑らかすぎる形を避ける。
         */
        float edgeNoise = fbm(vec2(
            p.x * 5.5 + time * 0.35,
            p.y * 5.5 - time * 1.15 + uPhase
        ));

        float edgeBreakup =
            (edgeNoise - 0.5) *
            0.16 *
            smoothstep(-0.30, 0.92, p.y);

        body = smoothstep(
            0.08 - edgeBreakup,
            0.72 - edgeBreakup,
            body
        );

        /*
         * 発光部分。
         */
        float orbGlow = ellipseGlow(
            p,
            vec2(0.0, -0.43),
            vec2(0.46, 0.48),
            0.90
        );

        float upperGlow = flameShape(
            p,
            -0.48,
             0.96,
             0.42,
             0.095,
            -0.045,
             2.1
        );

        float glow = max(
            orbGlow,
            upperGlow * 0.70
        );

        glow = max(
            glow,
            ellipseGlow(
                p,
                wispPosition,
                vec2(0.11, 0.20),
                1.25
            ) * wispPulse * 0.35
        );

        /*
         * 内側の白い核。
         * 下部では大きく、上部へ行くほど細くする。
         */
        float coreLower = ellipseMask(
            p,
            vec2(-0.025, -0.48),
            vec2(0.235, 0.255),
            0.19
        );

        float coreMiddle = ellipseMask(
            p,
            vec2(0.015, -0.23),
            vec2(0.175, 0.275),
            0.18
        );

        vec2 coreP = p;
        coreP.x +=
            sin(
                p.y * 7.0 -
                time * 3.0 +
                uPhase
            ) *
            0.025 *
            upperAmount;

        float coreFlame = flameShape(
            coreP,
            -0.32,
             0.66,
             0.145,
             0.008,
            -0.035,
             4.8
        );

        float core = max(coreLower, coreMiddle);
        core = max(core, coreFlame * 0.78);
        core *= body;

        /*
         * 炎内部を上下に流れる明暗。
         */
        float flowNoise = fbm(vec2(
            p.x * 4.2,
            p.y * 4.0 - time * 2.15 + uPhase
        ));

        float innerFlow =
            smoothstep(0.34, 0.83, flowNoise) *
            body *
            smoothstep(-0.52, 0.55, p.y);

        float pulse =
            0.94 +
            sin(time * 5.3 + uPhase) * 0.035 +
            sin(time * 8.7 + uPhase * 2.1) * 0.015;

        vec3 deepGlowColor = vec3(0.055, 0.055, 0.56);
        vec3 outerColor    = vec3(0.11, 0.22, 0.98);
        vec3 middleColor   = vec3(0.42, 0.72, 1.00);
        vec3 innerColor    = vec3(0.82, 0.94, 1.00);
        vec3 coreColor     = vec3(1.00, 1.00, 1.00);

        vec3 color = deepGlowColor;

        color = mix(
            color,
            outerColor,
            smoothstep(0.02, 0.30, body)
        );

        color = mix(
            color,
            middleColor,
            smoothstep(0.20, 0.75, body)
        );

        color = mix(
            color,
            innerColor,
            innerFlow * 0.62
        );

        color = mix(
            color,
            coreColor,
            core
        );

        color *= pulse;

        /*
         * 本体は比較的はっきり、
         * 外側の光は薄く合成する。
         */
        float alpha = glow * 0.28;
        alpha = max(alpha, body * 0.93);
        alpha = max(alpha, core);

        /*
         * 外縁だけ若干透明にして柔らかくする。
         */
        alpha *= 0.88 + edgeNoise * 0.12;
        alpha = clamp(alpha, 0.0, 1.0);

        if (alpha < 0.008)
        {
            discard;
        }

        /*
         * CreateJS StageGL向けのpremultiplied alpha。
         */
        gl_FragColor = vec4(color * alpha, alpha);
    }
`;

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Hitodama shader compile error: ${message}`);
    }

    return shader;
}

/** WebGLフラグメントシェーダーの出力をCreateJS用Canvasとして提供する。 */
export class HitodamaShaderSurface {
    constructor({ width, height, phase = 0 } = {}) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = Math.max(1, Math.ceil(width));
        this.canvas.height = Math.max(1, Math.ceil(height));
        this.canvas._isCanvas = true;
        this.canvas._invalid = true;

        this.gl = this.canvas.getContext("webgl", {
            alpha: true,
            antialias: true,
            premultipliedAlpha: true,
            preserveDrawingBuffer: true,
        });

        if (this.gl === null) {
            throw new Error("WebGL is required to render the hitodama enemy.");
        }

        this.time = 0;
        this.phase = phase;
        this.program = this.#createProgram();
        this.vertexBuffer = this.#createVertexBuffer();
        this.positionLocation = this.gl.getAttribLocation(this.program, "aPosition");
        this.timeLocation = this.gl.getUniformLocation(this.program, "uTime");
        this.phaseLocation = this.gl.getUniformLocation(this.program, "uPhase");
        this.render();
    }

    tick(deltaTime) {
        this.time += deltaTime;
        this.render();
    }

    render() {
        const gl = this.gl;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.uniform1f(this.timeLocation, this.time);
        gl.uniform1f(this.phaseLocation, this.phase);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.flush();
        this.canvas._invalid = true;
    }

    destroy() {
        const gl = this.gl;
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteProgram(this.program);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        this.gl = null;
    }

    #createProgram() {
        const gl = this.gl;
        const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
        const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const message = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`Hitodama shader link error: ${message}`);
        }

        return program;
    }

    #createVertexBuffer() {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                -1, -1,
                 1, -1,
                -1,  1,
                 1,  1,
            ]),
            gl.STATIC_DRAW,
        );
        return buffer;
    }
}
