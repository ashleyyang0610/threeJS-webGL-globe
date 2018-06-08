const drawPoint = () => {
    const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        vertexColors: THREE.FaceColors,
        morphTargets: false,
        transparent: true,
        opacity: 0.7
    });
    const points = new THREE.Mesh(pointGeo, mat);
    threedObj.add(points);
};

const addPoint = (lat, lng, size, color) => {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((180 - lng) * Math.PI) / 180;

    const distance = (EARTH_RADIUS + ELEVATION_HEIGHT) * zoomFactor;

    point.position.x = distance * Math.sin(phi) * Math.cos(theta);
    point.position.y = distance * Math.cos(phi);
    point.position.z = distance * Math.sin(phi) * Math.sin(theta);

    point.lookAt(earth.position);

    point.scale.z = Math.max(size * zoomFactor * 5, zoomFactor);
    point.updateMatrix();

    point.geometry.faces.forEach((each, i) => {
        point.geometry.faces[i].color = color;
    });

    pointGeo.merge(point.geometry, point.matrix);
};

const addData = (data) => {
    let lat;
    let lng;
    let size;
    let color;

    pointGeo = new THREE.Geometry();

    Object.keys(data).forEach((key) => {
        lat = key.split(',')[0];
        lng = key.split(',')[1];
        size = data[key];
        color = getColor(size);
        addPoint(lat, lng, size, color);
    });

    drawPoint();
};

const drawStaticPath = (curve) => {
    const geometry = new THREE.Geometry();
    geometry.vertices = curve.getPoints(50);
    const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 3,
        transparent: true,
        opacity: 0.5
    });

    const curveStatic = new THREE.Line(geometry, material);

    threedObj.add(curveStatic);
};

const drawAnimatedPath = (curve) => {
    const geometry = new THREE.Geometry();
    const material = new THREE.LineBasicMaterial({
        color: getColor(getRandomInt(0, 1000)),
        linewidth: 3,
        transparent: true,
        opacity: 0.5
    });

    curveObj = new THREE.Line(geometry, material);

    pathGeometry.push(geometry);
    threedObj.add(curveObj);
};

const addSinglePath = (data) => {
    const srcLat = data.srcLat;
    const srcLng = data.srcLng;
    const desLat = data.desLat;
    const desLng = data.desLng;
    const color = 0xffffff;

    const distance = (EARTH_RADIUS + ELEVATION_HEIGHT) * zoomFactor;

    const vectorSrc = getVector(srcLat, srcLng);
    const vectorDes = getVector(desLat, desLng);

    const dist = vectorSrc.distanceTo(vectorDes);

    const controlVectorSrc = vectorSrc.clone();
    const controlVectorDes = vectorDes.clone();

    const controlX = 0.5 * (vectorSrc.x + vectorDes.x);
    const controlY = 0.5 * (vectorSrc.y + vectorDes.y);
    const controlZ = 0.5 * (vectorSrc.z + vectorDes.z);

    const midPoint = new THREE.Vector3(controlX, controlY, controlZ);

    const smoothDist = distance * (map(dist, 0, 10, 0, (15 / dist)));

    midPoint.setLength(smoothDist);

    controlVectorDes.add(midPoint);
    controlVectorSrc.add(midPoint);
    controlVectorDes.setLength(smoothDist);
    controlVectorSrc.setLength(smoothDist);

    const curve = new THREE.CubicBezierCurve3(vectorSrc, controlVectorSrc, controlVectorDes, vectorDes);
    paths.push(curve);

    drawStaticPath(curve);
    drawAnimatedPath(curve);
};

const addPathData = (data) => {
    data.forEach((each) => {
        addSinglePath(each);
        createMover();
    });
};

const handleWindowResize = () => {
    camera.aspect = earthContainer.offsetWidth / earthContainer.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(earthContainer.offsetWidth, earthContainer.offsetHeight);
};

const handleMouseMove = () => {
    mouse.x = (event.clientX / window.innerWidth) - 0.5;
    mouse.y = (event.clientY / window.innerHeight) - 0.5;
};

const bindResizeEventListener = () => {
    window.addEventListener('resize', handleWindowResize, false);
    window.addEventListener('mousemove', handleMouseMove, false);
};

const changeViewMode = (index) => {
    mode = index;
};

const bindButtonEventListener = () => {
    const btn0 = document.querySelector('.controls .button-0');
    const btn1 = document.querySelector('.controls .button-1');
    const btn2 = document.querySelector('.controls .button-2');
    const btn3 = document.querySelector('.controls .button-3');
    const btn4 = document.querySelector('.controls .button-4');

    btn0.addEventListener('click', changeViewMode.bind(this, 0));
    btn1.addEventListener('click', changeViewMode.bind(this, 1));
    btn2.addEventListener('click', changeViewMode.bind(this, 2));
    btn3.addEventListener('click', changeViewMode.bind(this, 3));
    btn4.addEventListener('click', changeViewMode.bind(this, 4));
};

// Galaxy
const createGalaxy = () => {
    const geometry = new THREE.SphereGeometry(GALAXY_DISTANCE * zoomFactor, 40, 30);
    const texture = new THREE.TextureLoader().load(bg);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
};

// Earth
const createEarth = () => {
    const geometry = new THREE.SphereGeometry(EARTH_RADIUS * zoomFactor, 40, 30);
    const shader = tempShader.earth;
    const uniforms = THREE.UniformsUtils.clone(shader.uniforms);
    uniforms.texture.value = new THREE.TextureLoader().load(world);

    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(1.1, 1.1, 1.1);
    return mesh;
};

const createPointUnit = () => {
    const geometry = new THREE.BoxGeometry(100 * zoomFactor, 100 * zoomFactor, 1);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -0.5));

    const mesh = new THREE.Mesh(geometry);
    return mesh;
};

const createMover = () => {
    const geometry = new THREE.SphereGeometry(100 * zoomFactor, 40, 30);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffff00
    });
    const mesh = new THREE.Mesh(geometry, material);
    movingPoints.push(mesh);
    threedObj.add(mesh);
};

const updatePathMover = () => {
    let pt;
    movingPoints.forEach((each, i) => {
        pt = paths[i].getPoint(t);
        each.position.set(pt.x, pt.y, pt.z);
    });
    t = ((t >= 1) ? 0 : t + 0.002);
};

const updateCurve = () => {
    let pt;
    pathGeometry.forEach((each, i) => {
        pt = paths[i].getPoints(50).slice(curveIndex, curveIndex + 20);
        pathGeometry[i].vertices = pt;
        pathGeometry[i].verticesNeedUpdate = true;
    });
    curveIndex = ((curveIndex > 50) ? 0 : curveIndex + 1);
};

const switchMode = () => {
    threedObj.children.forEach((each, i) => {
        if (i !== 0) {
            threedObj.children[i].visible = false;
        }

        if (mode === 0) {
            threedObj.children[i].visible = true;
        } else if (mode === 2 && i === 1) {
            threedObj.children[i].visible = true;
        } else if (mode === 3 && (((i - 2) % 3 === 0) || ((i - 2) % 3 === 2))) {
            threedObj.children[i].visible = true;
        } else if (mode === 4 & ((i - 2) % 3 === 1)) {
            threedObj.children[i].visible = true;
        }
    });
    prevMode = mode;
};

const render = () => {
    requestAnimationFrame(render);

    controls.update();
    cameraControls.update();
    updatePathMover();
    updateCurve();

    if (mode !== prevMode) switchMode();

    threedObj.rotation.y += EARTH_EQUATORIAL_ROTATION_VELOCITY * delta;
    renderer.render(scene, camera);
};

const init = (container) => {
    earthContainer = container;
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
        15, // fov, in degrees
        earthContainer.offsetWidth / earthContainer.offsetHeight, // aspect ratio
        0.01, // near
        1000 // far
    );
    cameraControls = new THREE.OrbitControls(camera);
    cameraControls.maxDistance = 200;
    cameraControls.minDistance = 30;
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 100;

    // AmbientLight - This light globally illuminates all objects in the scene equally.
    ambientLight = new THREE.AmbientLight(0x888888);
    scene.add(ambientLight);

    // DirectionalLight
    directionalLight = new THREE.DirectionalLight(0xcccccc, 1); // color, intensity
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // WebGL Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(earthContainer.offsetWidth, earthContainer.offsetHeight);
    earthContainer.appendChild(renderer.domElement);

    // Trackball Controls
    controls = new THREE.TrackballControls(camera);

    // Galaxy
    galaxy = createGalaxy();
    scene.add(galaxy);

    threedObj = new THREE.Object3D();
    // Earth
    earth = createEarth();
    threedObj.add(earth);

    point = createPointUnit();

    threedObj.position.x = 0;
    threedObj.position.y = 0;
    threedObj.position.z = 0;
    scene.add(threedObj);

    // Render
    delta = ((1 / 60) / 86400) * 3600;
    mouse = { x: 0, y: 0 };

    render();
};

init(document.querySelector('.globe'));
addData(globeSizeMock);
addPathData(globePathMock);
bindResizeEventListener();
bindButtonEventListener();
