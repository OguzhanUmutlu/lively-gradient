#version 300 es

in vec3 aPosition;
in vec2 aTexCoord;

out vec2 vTexCoord;

void main() {
  // Convert the 3D aPosition to a 4D vector
  vec4 positionVec4 = vec4(aPosition, 1.0);

  // Convert the x and y from pixel coordinates to clip space coordinates
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

  // Set the final position of the vertex
  gl_Position = positionVec4;

  // Pass the texture coordinates to the fragment shader
  // Use aTexCoord if available, otherwise calculate from position
  vTexCoord = aTexCoord.xy;
}