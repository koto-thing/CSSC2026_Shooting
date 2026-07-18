export class EnemyBulletGlowFilter extends createjs.Filter {
    constructor() {
        super();
        
        this.FRAG_SHADER_BODY = `
            void main() {
                vec2 uv = vRenderCoord;
                vec4 source = texture2D(uSampler, uv);
                vec2 p = uv * 2.0 - 1.0;
                float r = length(p);
                
                if (r > 1.0) {
                    discard;
                }
                
                vec3 core = vec3(1.0, 1.0, 1.0);
                vec3 mid = vec3(0.32, 0.42, 1.0);
                vec3 edge = vec3(0.02, 0.04, 0.35);
                
                float coreAmount = smoothstep(0.45, 0.0, r);
                float edgeAmount = smoothstep(0.55, 1.0, r);
                
                vec3 color = mix(mid, core, coreAmount);
                color = mix(color, edge, edgeAmount);
                
                float alpha = smoothstep(1.0, 0.72, r);
                alpha = max(alpha, coreAmount);
                alpha = max(alpha, source.a);
                
                gl_FragColor = vec4(color, alpha);
            }
        `;
    }    
}
