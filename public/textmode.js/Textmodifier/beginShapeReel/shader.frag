#version 300 es
precision highp float;

in vec3 v_worldPosition;

uniform float u_time;
uniform vec3 u_charRamp[10];
uniform vec3 u_camPos;

// Built-in lighting uniforms automatically set by textmode.js
uniform vec3 u_tmAmbientLightColor;
uniform int u_tmPointLightCount;
uniform vec3 u_tmPointLightPositions[5];
uniform vec3 u_tmPointLightColors[5];
uniform vec3 u_tmLightFalloff;

layout(location = 0) out vec4 o_char;
layout(location = 1) out vec4 o_prim;
layout(location = 2) out vec4 o_sec;

// HSL to RGB conversion helper
vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

void main() {
    // 1. GPU Flat Shading Normal Calculation
    vec3 faceNormal = normalize(cross(dFdx(v_worldPosition), dFdy(v_worldPosition)));
    
    // 2. Point & Ambient Light Shading
    vec3 ambientColor = u_tmAmbientLightColor;
    vec3 diffuseColor = vec3(0.0);
    vec3 specularColor = vec3(0.0);
    
    vec3 viewDir = normalize(u_camPos - v_worldPosition);
    
    for (int i = 0; i < 5; i++) {
        if (i >= u_tmPointLightCount) {
            break;
        }
        vec3 lightPos = u_tmPointLightPositions[i];
        vec3 lightCol = u_tmPointLightColors[i];
        
        vec3 lightVec = lightPos - v_worldPosition;
        float lightDist = length(lightVec);
        vec3 lightDir = normalize(lightVec);
        
        // Attenuation based on distance to point light and u_tmLightFalloff
        float attenuationDenominator = u_tmLightFalloff.x + lightDist * u_tmLightFalloff.y + lightDist * lightDist * u_tmLightFalloff.z;
        float attenuation = attenuationDenominator > 0.0 ? 1.0 / attenuationDenominator : 1.0;
        
        float diff = clamp(dot(faceNormal, lightDir), 0.0, 1.0) * attenuation;
        diffuseColor += lightCol * diff;
        
        // Specular Reflection (Blinn-Phong)
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(clamp(dot(faceNormal, halfDir), 0.0, 1.0), 16.0) * attenuation;
        specularColor += lightCol * spec;
    }
    
    // 3. Dynamic Wave Intensity
    float dist = length(v_worldPosition.xyz) * 0.04;
    float wave = sin(dist - u_time * 2.5) * 0.5 + 0.5;

    // 4. Shading Brightness combining light intensity and the dynamic wave
    float totalDiffuseVal = clamp(length(diffuseColor), 0.0, 1.0);
    float L = clamp(totalDiffuseVal * 0.65 + wave * 0.15 + length(specularColor) * 0.35, 0.0, 0.99);

    // 5. Character Mapping
    int rampIndex = clamp(int(L * 10.0), 0, 9);
    vec3 glyphColor = u_charRamp[rampIndex];

    // 6. Holographic HSL Colors
    float hue = fract(dist * 0.15 - u_time * 0.05 + v_worldPosition.z * 0.01);
    
    // Base colors:
    vec3 basePrim = hsl2rgb(vec3(hue, 1.0, 0.62));
    vec3 baseSec = hsl2rgb(vec3(fract(hue + 0.5), 0.95, 0.22));

    // Modulate base colors using the actual lighting color contribution
    vec3 lightingFactor = clamp(ambientColor + diffuseColor, 0.0, 1.5);
    vec3 primColor = basePrim * lightingFactor + specularColor * 0.55;
    vec3 secColor = baseSec * lightingFactor;

    o_char = vec4(glyphColor.xy, 0.0, 1.0);
    o_prim = vec4(primColor, 1.0);
    o_sec = vec4(secColor, 1.0);
}
