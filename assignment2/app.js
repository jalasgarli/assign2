let gl, program;
let vertexCount = 36; // Number of vertices in the cube
let modelViewMatrix;

let eye = [0, 0, 0.1]; // Initial camera position
let at = [0, 0, 0]; // Camera target
let up = [0, 1, 0]; // Up vector for the camera

onload = () => {
    let canvas = document.getElementById("webgl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert('No webgl for you');
        return;
    }

    program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0, 0, 0, 0.5);
    
    // // Define the vertices of the cube
    // let vertices = [
    //   -1, -1, 1, // Front face
    //   -1, 1, 1,
    //   1, 1, 1,
    //   1, -1, 1,
    //   -1, -1, -1, // Back face
    //   -1, 1, -1,
    //   1, 1, -1,
    //   1, -1, -1,
    // ];

    // // Define the vertex indices to create triangles
    // let indices = [
    //   // Front face
    //   0, 3, 1,
    //   1, 3, 2,
    //   // Back face
    //   4, 7, 5,
    //   5, 7, 6,
    //   // Top face
    //   3, 7, 2,
    //   2, 7, 6,
    //   // Bottom face
    //   4, 0, 5,
    //   5, 0, 1,
    //   // Left face
    //   1, 2, 5,
    //   5, 2, 6,
    //   // Right face
    //   0, 3, 4,
    //   4, 3, 7,
    // ];

    // // Define colors for each vertex
    // let colors = [
    //   0, 0, 0, // Black
    //   0, 0, 1, // Blue
    //   0, 1, 0, // Green
    //   0, 1, 1, // Cyan
    //   1, 0, 0, // Red
    //   1, 0, 1, // Magenta
    //   1, 1, 0, // Yellow
    //   1, 1, 1, // White
    // ];

    let vertices = [
      -1, -1, 1,
      -1, 1, 1,
      1, 1, 1,
      1, -1, 1,
      -1, -1, -1,
      -1, 1, -1,
      1, 1, -1,
      1, -1, -1,
  ];

  let indices = [
      0, 3, 1,
      1, 3, 2,
      4, 7, 5,
      5, 7, 6,
      3, 7, 2,
      2, 7, 6,
      4, 0, 5,
      5, 0, 1,
      1, 2, 5,
      5, 2, 6,
      0, 3, 4,
      4, 3, 7,
  ];

  let colors = [
      0, 0, 0,
      0, 0, 1,
      0, 1, 0,
      0, 1, 1,
      1, 0, 0,
      1, 0, 1,
      1, 1, 0,
      1, 1, 1,
  ];


    // You should get rid of the line below eventually
    vertices = scale(0.5, vertices); 

    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    let vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Create index buffer
    let iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    // Create color buffer
    let cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Set the vertex color attribute
    let vColor = gl.getAttribLocation(program, 'vColor');
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    modelViewMatrix = gl.getUniformLocation(program, 'modelViewMatrix');

    // adding eventlistener in order to handle camera controls
    document.addEventListener('keydown', handleKeyDown);

    // rendering loop
    render();
};

function handleKeyDown(event) {
    switch (event.key) {
        case 'T': // Top-side view
            eye = [0, 1, 0]; 
            up = [0, 0, 1];
            break;
        case 'L': // Left-side view
            eye = [-1, 0, 0]; 
            up = [0, 1, 0];
            break;
        case 'F': // Front-side view
            eye = [0, 0, 0.1];
            up = [0, 1, 0];
            break;
        case 'D': // rotating clockwise by 5 degrees
            rotateCamera(5); 
            break;
        case 'A': // counter-clockwise by -5 degrees
            rotateCamera(-5); 
            break;
    }
    render();
}

function rotateCamera(theta) {
  let radians = theta * Math.PI / 180;
  let rotationMatrix;

  if (eye[0] === 0 && eye[1] === 1 && eye[2] === 0) { // Rotate around the y-axis
    rotationMatrix = mat3(
      Math.cos(radians), 0, Math.sin(radians),
      0, 1, 0,
      -Math.sin(radians), 0, Math.cos(radians)
    );
  } else if (eye[0] === -1 && eye[1] === 0 && eye[2] === 0) { // Rotate around the x-axis
    rotationMatrix = mat3(
      1, 0, 0,
      0, Math.cos(-radians), -Math.sin(-radians),
      0, Math.sin(-radians), Math.cos(-radians)
    );
  } else { // Rotate around the z-axis
    rotationMatrix = mat3(
      Math.cos(radians), -Math.sin(radians), 0,
      Math.sin(radians), Math.cos(radians), 0,
      0, 0, 1
    );
  }

  // applying rotation
  up = vec3(
    rotationMatrix[0][0] * up[0] + rotationMatrix[0][1] * up[1] + rotationMatrix[0][2] * up[2],
    rotationMatrix[1][0] * up[0] + rotationMatrix[1][1] * up[1] + rotationMatrix[1][2] * up[2],
    rotationMatrix[2][0] * up[0] + rotationMatrix[2][1] * up[1] + rotationMatrix[2][2] * up[2]
  );
}

function render() { 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // calculating the model-view matrix based on the camera's position and orientation
    let mvm = lookAt(eye, at, up);

    // Pass the model-view matrix to the shader
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mvm));

    //drawing the cube using index triangles 
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_BYTE, 0);

    requestAnimationFrame(render);
}