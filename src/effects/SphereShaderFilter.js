export class SphereShaderFilter extends createjs.Filter {
  constructor() {
    super();

    this.FRAG_SHADER_BODY = `
            void main() {
                vec2 uv = vRenderCoord;
                vec4 color = texture2D(uSampler, vRenderCoord);

                vec2 p = uv * 2.0 - 1.0;
                float r = length(p);

                if (r > 1.0) {
                    discard;
                }

                vec3 lightDir = normalize(vec3(-0.45, -0.6, 1.0));
                vec3 normal = normalize(vec3(p, sqrt(1.0 - r * r)));
                float diffuse = max(dot(normal, lightDir), 0.0);
                float rim = pow(1.0 - normal.z, 2.0) * 0.35;
                color.rgb *= 0.35 + diffuse * 0.8 + rim;

                gl_FragColor = vec4(color.rgb, color.a);
            }
        `;
  }
}
