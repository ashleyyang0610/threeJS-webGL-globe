const world = './images/world.jpg';
const bg = './images/galaxy_starfield.png';

const tempShader = {
    'earth': {
        uniforms: {
            'texture': { type: 't', value: null }
        },
        vertexShader: [
            'varying vec3 vNormal;',
            'varying vec2 vUv;',
            'void main() {',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            'vNormal = normalize( normalMatrix * normal );',
            'vUv = uv;',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform sampler2D texture;',
            'varying vec3 vNormal;',
            'varying vec2 vUv;',
            'void main() {',
            'vec3 diffuse = texture2D( texture, vUv ).xyz;',
            'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
            'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
            'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
            '}'
        ].join('\n')
    },
    'atmosphere': {
        uniforms: {},
        vertexShader: [
            'varying vec3 vNormal;',
            'void main() {',
            'vNormal = normalize( normalMatrix * normal );',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),
        fragmentShader: [
            'varying vec3 vNormal;',
            'void main() {',
            'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
            'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
            '}'
        ].join('\n')
    }
};

const EARTH_EQUATORIAL_ROTATION_VELOCITY = (4651 * 0.001); // km/s
const EARTH_RADIUS = 6371; // km
const GALAXY_DISTANCE = 99999; // km
const ELEVATION_HEIGHT = 600; // km

const zoomFactor = 0.001;

let scene;
let camera;
let ambientLight;
let directionalLight;
let renderer;
let cameraControls;
let controls;
let galaxy;
let earth;
let delta;
let mouse;
let earthContainer;
let point;
let pointGeo;
let threedObj;
const paths = [];
const movingPoints = [];
let t = 0;
let curveIndex = 0;
let curveObj;
const pathGeometry = [];
let mode = 0;
let prevMode = 0;
