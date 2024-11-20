const colorSchemes = [
    ["#EB4679", "#051681", "#EE7F7D", "#265BC9", "#C25EA5", "#7961D3"],
    ["#92B3C9", "#C6D1D1", "#7B8E54", "#F66E56", "#F96656", "#F3F4EC"],
    ["#2483A5", "#E0B94B", "#477459", "#C45408", "#6E9091", "#EFE3D1"],
    ["#0F2F65", "#E687D8", "#347BD1", "#6890E2", "#07265C", "#A88BDF"]
].map(i => i.map(hexToRgb));

let schemeIndex = 0;
let completion = 0;

const colors = colorSchemes[0];

const warpRatio = 0.4;
const warpSize = 0.4;
const noiseRatio = 0.08;
const numberPoints = colorSchemes[0].length;
const randomNumber = 0;
const gradientTypeIndex = 1;
const warpShapeIndex = 0;

let theShader;
let positionsUniforms = [];
let points = [];

function preload() {
    theShader = loadShader("./shader.vert", "./shader.frag");
}

function setup() {
    pixelDensity(2);
    createCanvas(innerWidth, innerHeight, WEBGL);

    const gl = canvas.getContext("webgl2");
    gl.disable(gl.DEPTH_TEST);

    windowResized();
    noStroke();

    points = [];
    if (randomNumber !== 0) {
        for (let i = 0; i < numberPoints; i++) {
            points.push({
                x: random() * width,
                y: random() * height,
                color: colors[i]
            });
        }
    } else {
        const gridSize = Math.ceil(Math.sqrt(numberPoints));
        const cellSize = 1 / gridSize;
        for (let i = 0; i < numberPoints; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            points.push({
                x: (col + 0.5) * cellSize * width,
                y: (row + 0.5) * cellSize * height,
                color: colors[i]
            });
        }
    }
    updatePositionsUniforms();
}

function nextIndex() {
    return (schemeIndex + 1) % colorSchemes.length;
}

function draw() {
    background(0);
    setShaderUniforms();
    shader(theShader);
    rect(0, 0, width, height);

    completion += 0.005;

    if (completion >= 1) {
        schemeIndex = nextIndex();
        completion = 0;
    }

    const currentScheme = colorSchemes[schemeIndex];
    const nextScheme = colorSchemes[nextIndex()];

    for (let i = 0; i < numberPoints; i++) {
        const now = currentScheme[i];
        const next = nextScheme[i];
        const rgb = colors[i];
        for (let j = 0; j < 3; j++) {
            rgb[j] = now[j] + (next[j] - now[j]) * completion;
        }
    }
}

function windowResized() {
    resizeCanvas(innerWidth, innerHeight);
}

function updatePositionsUniforms() {
    positionsUniforms = points.map(point => [point.x / width, point.y / height]).flat();
}

function setShaderUniforms() {
    const actualWidth = width * pixelDensity();
    const actualHeight = height * pixelDensity();

    theShader.setUniform("u_resolution", [actualWidth, actualHeight]);
    theShader.setUniform("u_resolution", [width, height]);
    theShader.setUniform("u_bgColor", colors[0]);
    theShader.setUniform("u_colors", colors.flat());
    theShader.setUniform("u_positions", positionsUniforms);
    theShader.setUniform("u_numberPoints", numberPoints);
    theShader.setUniform("u_noiseRatio", noiseRatio);
    theShader.setUniform("u_warpRatio", warpRatio);
    theShader.setUniform("u_mouse", [mouseX / width, 1 - mouseY / height]);
    theShader.setUniform("u_warpSize", warpSize);
    theShader.setUniform("u_gradientTypeIndex", gradientTypeIndex);
    theShader.setUniform("u_warpShapeIndex", warpShapeIndex);
    theShader.setUniform("u_time", millis() / 3000);
    theShader.setUniform("u_noiseTime", 0.0);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
    ] : null;
}