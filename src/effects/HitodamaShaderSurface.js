const VERTEX_SHADER = `
    attribute vec2 aPosition;
    varying vec2 vUv;

    void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

/**
 * 旧ひとだまver1
 */
const _FRAGMENT_SHADER = `
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
         * 上が正、下が負の座標として扱う
         * Canvasの表示方向によって上下が反転する場合は、
         * 次の行を有効にする
         */
        // p.y *= -1.0;

        float time = uTime;

        /*
         * 全体がゆっくり呼吸するように横幅を変化させる
         * 上部ほど大きく変形させる
         */
        float upperAmount = smoothstep(-0.45, 0.85, p.y);

        float globalSway =
            sin(time * 2.5 + uPhase) * 0.018;

        globalSway +=
            sin(time * 4.1 + uPhase * 1.73) * 0.008;

        p.x -= globalSway * upperAmount;

        /*
         * 輪郭を少しだけ波打たせるためのドメインワープ
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
         * 下部の丸い魂
         * 完全な円ではなく、上下に複数の楕円を重ねて
         * 雫に近い形状を作る
         */
        float lowerOrb = ellipseMask(
            p,
            vec2(0.0, -0.42), // 火の粉のために少しだけ上にあげて余白
            vec2(0.39, 0.34),
            0.12
        );

        float middleOrb = ellipseMask(
            p,
            vec2(-0.015, -0.19),
            vec2(0.31, 0.36),
            0.13
        );

        float neck = ellipseMask(
            p,
            vec2(0.005, 0.05),
            vec2(0.235, 0.31),
            0.15
        );

        /*
         * 中央のメインとなる炎。
         */
        float mainFlame = flameShape(
            p,
            -0.30,
             0.96,
             0.285,
             0.018,
            -0.055,
             2.1
        );

        /*
         * 左右に出る小さな炎
         * メインの炎とは別の周期で動かす
         */
        vec2 leftP = p;
        leftP.x += 0.075;
        leftP.y -= 0.06;

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
        rightP.y -= 0.095;

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
         * 先端付近に浮かぶ短い炎片
         * 本体から離れすぎない程度に出現させる
         */
        vec2 wispPosition = vec2(
            0.10 +
            sin(time * 3.6 + uPhase) * 0.045,

            0.77 +
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
         * ベクター図形のような滑らかすぎる形を避ける
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
         * 発光部分
         */
        float orbGlow = ellipseGlow(
            p,
            vec2(0.0, -0.35),
            vec2(0.46, 0.48),
            0.90
        );

        float upperGlow = flameShape(
            p,
            -0.40,
             1.04,
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
         * 内側の白い核
         * 下部では大きく、上部へ行くほど細くする
         */
        float coreLower = ellipseMask(
            p,
            vec2(-0.025, -0.40),
            vec2(0.235, 0.255),
            0.19
        );

        float coreMiddle = ellipseMask(
            p,
            vec2(0.015, -0.15),
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
            -0.24,
             0.74,
             0.145,
             0.008,
            -0.035,
             4.8
        );

        float core = max(coreLower, coreMiddle);
        core = max(core, coreFlame * 0.78);
        core *= body;

        /*
         * 炎内部を上下に流れる明暗
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

        float sparks = 0.0;
        vec3 sparkColorSum = vec3(0.0);
        
        // TOOD: コメント変えとく
        // 8つの異なる火の粉のストリームをループで合成
        for(int i = 0; i < 8; i++) {
            float id = float(i);
            
            // 各火の粉に固有のランダムシード
            float seedX = hash21(vec2(id, 123.45 + uPhase));
            float seedY = hash21(vec2(id, 678.90 + uPhase));
            
            // 発生するライフサイクル（0.0 〜 1.0 のループ）
            // 発生時間をずらすためにseedYでオフセットを入れる
            float speed = 0.7 + seedX * 0.5;
            float life = fract(time * speed * 0.4 + seedY);
            
            // X座標：人魂の中心付近から発生し、上昇するにつれてFBMノイズで横に揺れる
            float startX = (seedX - 0.5) * 0.35;
            float drift = sin(time * 2.0 + id * 1.5) * 0.08;
            float sparkX = startX + drift * life;
            
            // Y座標：下部から上部へ直線的に上昇
            float sparkY = mix(-0.5, 1.1, life);
            
            vec2 sparkPos = vec2(sparkX, sparkY);
            
            // 各火の粉のサイズ（個別に微妙に変化させ、寿命の終わりで消える）
            float size = (0.012 + seedY * 0.015) * smoothstep(1.0, 0.4, life);
            
            // 距離を計算して円形のドットを作る
            float dist = length(p - sparkPos);
            float sparkIntensity = smoothstep(size, 0.0, dist);
            
            // ライフサイクルの最初と最後でフワッとフェードイン・アウト
            sparkIntensity *= smoothstep(0.0, 0.15, life) * smoothstep(1.0, 0.7, life);
            
            if (sparkIntensity > 0.0) {
                sparks = max(sparks, sparkIntensity);
                // 上昇するほど冷めていく（白・水色 -> 青紫）イメージのグラデーション
                vec3 col = mix(vec3(0.8, 0.95, 1.0), vec3(0.2, 0.5, 1.0), life);
                sparkColorSum = max(sparkColorSum, col * sparkIntensity);
            }
        }

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

        // 火の粉の色をブレンド
        color = mix(color, sparkColorSum * 1.5, sparks);

        color *= pulse;

        /*
         * 本体は比較的はっきり、
         * 外側の光は薄く合成する
         */
        float alpha = glow * 0.28;
        alpha = max(alpha, body * 0.93);
        alpha = max(alpha, core);
        alpha = max(alpha, sparks); // 火の粉の部分もアルファ値に反映

        /*
         * 外縁だけ若干透明にして柔らかくする
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

/**
 * 旧ひとだまver2
 * @type {string}
 */
const _REFERENCE_FRAGMENT_SHADER = `
    precision mediump float;

    varying vec2 vUv;

    uniform float uTime;
    uniform float uPhase;

    float hash21(vec2 p)
    {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
    }

    float noise(vec2 p)
    {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
            mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
            mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x),
            f.y
        );
    }

    float ellipseSdf(vec2 p, vec2 center, vec2 radius)
    {
        return (length((p - center) / radius) - 1.0) * min(radius.x, radius.y);
    }

    float softShape(float distanceValue, float blur)
    {
        return 1.0 - smoothstep(-blur, blur, distanceValue);
    }

    void main()
    {
        vec2 p = vUv * 2.0 - 1.0;
        float time = uTime;

        float lowerDrift = sin(time * 2.15 + uPhase) * 0.018;
        float middleDrift = sin(time * 2.75 + uPhase + 1.4) * 0.030;
        float upperDrift = sin(time * 3.25 + uPhase + 2.7) * 0.045;

        vec2 lowerP = p;
        lowerP.x -= lowerDrift;
        vec2 middleP = p;
        middleP.x -= middleDrift;
        vec2 upperP = p;
        upperP.x -= upperDrift;

        float edgeWarp = noise(vec2(p.y * 5.8 - time * 1.15, uPhase + 4.7));
        edgeWarp = (edgeWarp - 0.5) * 0.035;

        float lowerDistance = ellipseSdf(
            lowerP,
            vec2(0.015, -0.40),
            vec2(0.40 + edgeWarp, 0.31)
        );
        float bellyDistance = ellipseSdf(
            middleP,
            vec2(-0.045, -0.18),
            vec2(0.33 - edgeWarp * 0.4, 0.27)
        );
        float shoulderDistance = ellipseSdf(
            upperP,
            vec2(0.035, 0.02),
            vec2(0.265 + edgeWarp * 0.5, 0.23)
        );
        float headDistance = ellipseSdf(
            upperP,
            vec2(-0.025, 0.20),
            vec2(0.19, 0.19)
        );

        vec2 crownP = upperP;
        crownP.x += sin(p.y * 11.0 - time * 3.0 + uPhase) * 0.025;
        float crownProgress = clamp((crownP.y - 0.25) / 0.36, 0.0, 1.0);
        float crownCenter = -0.04 + crownProgress * 0.10;
        float crownWidth = mix(0.15, 0.018, pow(crownProgress, 0.72));
        float crownSides = abs(crownP.x - crownCenter) - crownWidth;
        float crownBottom = 0.25 - crownP.y;
        float crownTop = crownP.y - 0.61;
        float crownDistance = max(crownSides, max(crownBottom, crownTop));

        float shapeDistance = min(lowerDistance, bellyDistance);
        shapeDistance = min(shapeDistance, shoulderDistance);
        shapeDistance = min(shapeDistance, headDistance);
        shapeDistance = min(shapeDistance, crownDistance);

        float body = softShape(shapeDistance, 0.045);
        float halo = softShape(shapeDistance, 0.22);
        float wideHalo = softShape(shapeDistance, 0.42);

        float innerDistance = min(
            ellipseSdf(lowerP, vec2(0.01, -0.37), vec2(0.27, 0.22)),
            ellipseSdf(middleP, vec2(-0.025, -0.13), vec2(0.22, 0.22))
        );
        innerDistance = min(
            innerDistance,
            ellipseSdf(upperP, vec2(-0.015, 0.12), vec2(0.145, 0.21))
        );
        float core = softShape(innerDistance, 0.11) * body;

        float shimmer = noise(vec2(p.x * 4.0 + uPhase, p.y * 5.0 - time * 1.7));
        float pulse = 0.96 + 0.04 * sin(time * 4.3 + uPhase);

        vec3 haloColor = vec3(0.34, 0.61, 1.0);
        vec3 rimColor = vec3(0.70, 0.86, 1.0);
        vec3 bodyColor = vec3(0.94, 0.98, 1.0);
        vec3 coreColor = vec3(1.0);

        float haloOnly = max(halo - body * 0.72, 0.0);
        float wideOnly = max(wideHalo - halo, 0.0);
        vec3 color = haloColor * (0.42 + shimmer * 0.10);
        color = mix(color, rimColor, body);
        color = mix(color, bodyColor, smoothstep(0.18, 0.72, body));
        color = mix(color, coreColor, core * 0.94);
        color *= pulse;

        float alpha = wideOnly * 0.08 + haloOnly * 0.30;
        alpha = max(alpha, body * 0.96);
        alpha = clamp(alpha, 0.0, 1.0);

        if (alpha < 0.006)
        {
            discard;
        }

        gl_FragColor = vec4(color * alpha, alpha);
    }
`;

const VIDEO_REFERENCE_FRAGMENT_SHADER = `
    precision mediump float;

    varying vec2 vUv;

    uniform float uTime;
    uniform float uPhase;

    float hash21(vec2 p)
    {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
    }

    float valueNoise(vec2 p)
    {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
            mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
            mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x),
            f.y
        );
    }

    float ellipseDistance(vec2 p, vec2 center, vec2 radius)
    {
        return (length((p - center) / radius) - 1.0) * min(radius.x, radius.y);
    }

    void main()
    {
        vec2 p = vUv * 2.0 - 1.0;
        float t = uTime;

        float beatA = sin(t * 2.10 + uPhase);
        float beatB = sin(t * 3.05 + uPhase * 1.37 + 1.2);
        float beatC = sin(t * 4.25 + uPhase * 0.73 + 2.4);

        float progress = clamp((p.y + 0.56) / 1.43, 0.0, 1.0);
        float center =
            beatA * 0.025 +
            sin(p.y * 4.2 - t * 2.8 + uPhase) * 0.075 * progress +
            beatB * 0.065 * progress * progress;

        float width = mix(0.39, 0.018, pow(progress, 0.76));
        width +=
            sin(p.y * 8.2 - t * 3.6 + uPhase) *
            0.047 * smoothstep(0.15, 0.88, progress);
        width +=
            sin(p.y * 15.0 + t * 2.4 + uPhase * 0.5) *
            0.018 * smoothstep(0.25, 0.95, progress);

        float localX = p.x - center;
        float asymmetricWidth = width;
        asymmetricWidth +=
            sign(localX) * beatC * 0.035 *
            smoothstep(0.18, 0.82, progress);

        float flameSide = abs(localX) - asymmetricWidth;
        float flameBottom = -0.58 - p.y;
        float animatedTop = 0.86 + beatB * 0.035;
        float flameTop = p.y - animatedTop;
        float flameDistance = max(flameSide, max(flameBottom, flameTop));

        float bulbLean =
            sin(t * 1.73 + uPhase * 0.81) * 0.032 +
            sin(t * 3.91 + uPhase + 1.8) * 0.014;
        float bulbLift =
            sin(t * 2.27 + uPhase * 1.19 + 0.7) * 0.018;
        float bulbSquash =
            sin(t * 2.63 + uPhase * 0.67) * 0.022 +
            sin(t * 5.17 + 2.2) * 0.009;
        float bulbTilt =
            sin(t * 1.37 + uPhase * 1.43) * 0.085 +
            sin(t * 4.43 + 0.4) * 0.025;

        vec2 bulbP = p - vec2(bulbLean, -0.48 + bulbLift);
        bulbP.x -=
            sin(bulbP.y * 7.0 - t * 2.31 + uPhase) * 0.024 +
            sin(bulbP.y * 13.0 + t * 3.17) * 0.009;

        float tiltSin = sin(bulbTilt);
        float tiltCos = cos(bulbTilt);
        bulbP = mat2(
            tiltCos, -tiltSin,
            tiltSin,  tiltCos
        ) * bulbP;

        vec2 bulbRadius = vec2(
            0.40 + bulbSquash,
            0.34 - bulbSquash * 0.62
        );
        vec2 bulbQ = bulbP / bulbRadius;
        float bulbAngle = atan(bulbQ.y, bulbQ.x);
        float bulbRipple =
            sin(bulbAngle * 3.0 + t * 2.83 + uPhase) * 0.012 +
            sin(bulbAngle * 5.0 - t * 4.11 + uPhase * 0.6) * 0.006;
        float bulbDistance =
            (length(bulbQ) - 1.0) * min(bulbRadius.x, bulbRadius.y) -
            bulbRipple;
        float shapeDistance = min(flameDistance, bulbDistance);

        float leftNotch = ellipseDistance(
            p,
            vec2(-0.22 + beatB * 0.055, 0.25 + beatA * 0.10),
            vec2(0.12, 0.22)
        );
        float rightNotch = ellipseDistance(
            p,
            vec2(0.20 + beatA * 0.055, 0.48 + beatC * 0.08),
            vec2(0.095, 0.18)
        );

        float body = 1.0 - smoothstep(-0.018, 0.026, shapeDistance);
        float cutout = max(
            1.0 - smoothstep(-0.012, 0.025, leftNotch),
            1.0 - smoothstep(-0.012, 0.025, rightNotch)
        );
        cutout *= smoothstep(0.05, 0.30, progress);
        body *= 1.0 - cutout * 0.92;

        float hotBody = smoothstep(0.18, 0.82, body);
        float core = smoothstep(0.62, 0.96, body);

        float fineNoise = valueNoise(vec2(
            p.x * 9.0 - t * 0.55,
            p.y * 8.0 + t * 0.80 + uPhase
        ));

        float glow = 1.0 - smoothstep(0.015, 0.16, shapeDistance);
        float wideGlow = 1.0 - smoothstep(0.10, 0.32, shapeDistance);
        float halo = max(glow - body * 0.68, 0.0);
        float haze = max(wideGlow - glow, 0.0);

        float particleBody = 0.0;
        float particleHalo = 0.0;
        for (int i = 0; i < 16; i++)
        {
            float id = float(i);
            float seedA = hash21(vec2(id + uPhase, 19.37));
            float seedB = hash21(vec2(id + uPhase, 73.91));
            float seedC = hash21(vec2(id + uPhase, 41.53));

            float speed = 0.24 + seedA * 0.16;
            float life = fract(t * speed + seedB);
            float fade =
                smoothstep(0.0, 0.075, life) *
                (1.0 - smoothstep(0.76, 1.0, life));

            float side = seedA < 0.5 ? -1.0 : 1.0;
            float startX =
                side * (0.025 + seedC * 0.25) +
                sin(id * 4.17) * 0.055;
            float drift =
                sin(t * (2.0 + seedC) + id * 2.1 + uPhase) *
                (0.065 + life * 0.12);

            vec2 particlePosition = vec2(
                startX + drift,
                -0.32 + life * (1.38 + seedC * 0.30)
            );

            float particleSize =
                (0.068 + seedB * 0.072) *
                (0.82 + 0.18 * sin(t * 4.5 + id));
            vec2 particleOffset = p - particlePosition;
            particleOffset.x *= 1.12;
            particleOffset.y *= 0.82;
            float particleDistance = length(particleOffset);

            float puff =
                (1.0 - smoothstep(
                    particleSize * 0.38,
                    particleSize,
                    particleDistance
                )) * fade;
            float puffGlow =
                (1.0 - smoothstep(
                    particleSize,
                    particleSize * 3.2,
                    particleDistance
                )) * fade;

            particleBody = max(particleBody, puff);
            particleHalo = max(particleHalo, puffGlow);
        }

        float flicker =
            0.97 +
            0.025 * sin(t * 5.2 + uPhase) +
            0.015 * sin(t * 8.1 + uPhase * 1.8);

        vec3 hazeColor = vec3(0.58, 0.76, 1.0);
        vec3 edgeColor = vec3(0.84, 0.92, 1.0);
        vec3 whiteColor = vec3(1.0, 1.0, 0.985);

        vec3 bodyColor = mix(hazeColor, edgeColor, glow);
        bodyColor = mix(bodyColor, whiteColor, body * 0.92);
        bodyColor = mix(bodyColor, vec3(1.0), max(hotBody, core));
        bodyColor *= flicker * (0.985 + fineNoise * 0.015);

        vec3 particleColor = mix(
            vec3(0.72, 0.84, 1.0),
            vec3(1.0),
            particleBody
        );
        float particleAlpha = max(particleHalo * 0.38, particleBody);
        float bodyAlpha = max(haze * 0.10 + halo * 0.38, body * 0.98);
        bodyAlpha *= 1.0 - cutout * 0.84;

        float alpha = bodyAlpha + particleAlpha * (1.0 - bodyAlpha);
        vec3 premultipliedColor =
            bodyColor * bodyAlpha +
            particleColor * particleAlpha * (1.0 - bodyAlpha);
        alpha = clamp(alpha, 0.0, 1.0);

        if (alpha < 0.006)
        {
            discard;
        }

        gl_FragColor = vec4(premultipliedColor, alpha);
    }
`;

/**
 * シェーダーをコンパイルする
 * @param gl
 * @param type
 * @param source
 * @returns {WebGLShader}
 */
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

/**
 * WebGLフラグメントシェーダーの出力をCreateJS用Canvasとして提供する
 */
export class HitodamaShaderSurface {
  /**
   * コンストラクタ
   * @param param0
   * @param param0.width
   * @param param0.height
   * @param param0.phase
   */
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

  /**
   * シェーダーの更新
   * @param deltaTime
   */
  tick(deltaTime) {
    this.time += deltaTime;
    this.render();
  }

  /**
   * レンダリングする
   */
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

  /**
   * バッファ削除など
   */
  destroy() {
    const gl = this.gl;
    gl.deleteBuffer(this.vertexBuffer);
    gl.deleteProgram(this.program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    this.gl = null;
  }

  /**
   * シェーダーコンパイルとアタッチ
   * @returns {WebGLProgram}
   */
  #createProgram() {
    const gl = this.gl;
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, VIDEO_REFERENCE_FRAGMENT_SHADER);
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

  /**
   * 頂点バッファを作成する
   * @returns {AudioBuffer | GPUBuffer | WebGLBuffer}
   */
  #createVertexBuffer() {
    const gl = this.gl;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    return buffer;
  }
}
