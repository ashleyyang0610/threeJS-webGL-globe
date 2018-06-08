const map = (x, inMin, inMax, outMin, outMax) => {
    return ((((x - inMin) * (outMax - outMin)) / (inMax - inMin)) + outMin);
};

const getVector = (lat, lng) => {
    const phi = (lat * Math.PI) / 180;
    const theta = ((lng + 90) * Math.PI) / 180;

    const distance = (EARTH_RADIUS + ELEVATION_HEIGHT) * zoomFactor;

    const x = distance * Math.cos(phi) * Math.sin(theta);
    const y = distance * Math.sin(phi);
    const z = distance * Math.cos(phi) * Math.cos(theta);
    const vector = new THREE.Vector3(x, y, z);
    return vector;
};

const getColor = (index) => {
    const color = new THREE.Color();
    color.setHSL((255 * (index * 0.001)), 1.0, 0.5);
    return color;
};

const getRandomInt = (min, max) => {
    const minVal = Math.ceil(min);
    const maxVal = Math.floor(max);
    return Math.floor(Math.random() * (maxVal - minVal)) + minVal;
};
