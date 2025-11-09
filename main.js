// Autó Szimulátor - BeamNG Style
// Készítette: Claude

// Global variables
let scene, camera, renderer;
let world; // Cannon.js physics world
let vehicle, chassisBody;
let groundBody;
let keys = {};
let cameraMode = 0; // 0: follow, 1: first person, 2: cinematic
let cameraModes = ['Követő', 'Első személy', 'Kinematikus'];

// Vehicle parameters
const vehicleParams = {
    chassisWidth: 1.8,
    chassisHeight: 0.6,
    chassisLength: 4,
    wheelRadius: 0.4,
    wheelThickness: 0.3,
    maxSteerVal: Math.PI / 8,
    maxForce: 1500,
    brakeForce: 100,
    mass: 800
};

// Initialize the scene
function init() {
    // Setup Three.js scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 0, 500);

    // Setup camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Setup renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Setup Cannon.js physics world
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    world.defaultContactMaterial.friction = 0.4;

    // Add lights
    addLights();

    // Create environment
    createEnvironment();

    // Create vehicle
    createVehicle();

    // Event listeners
    setupEventListeners();

    // Start animation loop
    animate();
}

function addLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Directional light (sun)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    scene.add(dirLight);

    // Hemisphere light for sky/ground ambient
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x545454, 0.4);
    scene.add(hemiLight);
}

function createEnvironment() {
    // Create ground
    const groundShape = new CANNON.Plane();
    groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(groundBody);

    // Create ground mesh with texture
    const groundGeometry = new THREE.PlaneGeometry(500, 500, 50, 50);
    const groundMaterial = new THREE.MeshLambertMaterial({
        color: 0x6B8E23,
        side: THREE.DoubleSide
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;

    // Add some variation to ground
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = Math.random() * 0.3;
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();

    scene.add(groundMesh);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(500, 100, 0x888888, 0x444444);
    scene.add(gridHelper);

    // Create some obstacles/ramps
    createObstacles();
}

function createObstacles() {
    // Create a ramp
    const rampGeometry = new THREE.BoxGeometry(10, 0.5, 15);
    const rampMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const ramp = new THREE.Mesh(rampGeometry, rampMaterial);
    ramp.position.set(20, 0, -10);
    ramp.rotation.x = -0.2;
    ramp.castShadow = true;
    ramp.receiveShadow = true;
    scene.add(ramp);

    // Ramp physics
    const rampShape = new CANNON.Box(new CANNON.Vec3(5, 0.25, 7.5));
    const rampBody = new CANNON.Body({ mass: 0 });
    rampBody.addShape(rampShape);
    rampBody.position.copy(ramp.position);
    rampBody.quaternion.copy(ramp.quaternion);
    world.addBody(rampBody);

    // Add some boxes
    for (let i = 0; i < 5; i++) {
        const size = 1 + Math.random() * 2;
        const boxGeometry = new THREE.BoxGeometry(size, size, size);
        const boxMaterial = new THREE.MeshPhongMaterial({
            color: Math.random() * 0xffffff
        });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.set(
            (Math.random() - 0.5) * 50,
            size / 2,
            (Math.random() - 0.5) * 50
        );
        box.castShadow = true;
        box.receiveShadow = true;
        scene.add(box);

        // Box physics
        const boxShape = new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2));
        const boxBody = new CANNON.Body({ mass: 50 });
        boxBody.addShape(boxShape);
        boxBody.position.copy(box.position);
        world.addBody(boxBody);

        // Store reference for updating
        box.userData.physicsBody = boxBody;
    }
}

function createVehicle() {
    // Create chassis
    const chassisShape = new CANNON.Box(new CANNON.Vec3(
        vehicleParams.chassisWidth / 2,
        vehicleParams.chassisHeight / 2,
        vehicleParams.chassisLength / 2
    ));

    chassisBody = new CANNON.Body({ mass: vehicleParams.mass });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(0, 4, 0);
    chassisBody.angularVelocity.set(0, 0, 0);

    // IMPORTANT: Add chassis to world first
    world.addBody(chassisBody);

    // Create vehicle
    vehicle = new CANNON.RaycastVehicle({
        chassisBody: chassisBody
    });

    // Wheel configuration - create base options
    const createWheelOptions = () => ({
        radius: vehicleParams.wheelRadius,
        directionLocal: new CANNON.Vec3(0, -1, 0),
        suspensionStiffness: 30,
        suspensionRestLength: 0.3,
        frictionSlip: 2.5,
        dampingRelaxation: 2.3,
        dampingCompression: 4.4,
        maxSuspensionForce: 100000,
        rollInfluence: 0.01,
        axleLocal: new CANNON.Vec3(-1, 0, 0),
        chassisConnectionPointLocal: new CANNON.Vec3(0, 0, 0),
        maxSuspensionTravel: 0.3,
        customSlidingRotationalSpeed: -30,
        useCustomSlidingRotationalSpeed: true
    });

    // Add wheels - Front left
    const wheelFrontLeft = createWheelOptions();
    wheelFrontLeft.chassisConnectionPointLocal.set(-vehicleParams.chassisWidth/2 + 0.3, 0, vehicleParams.chassisLength/2 - 0.5);
    vehicle.addWheel(wheelFrontLeft);

    // Front right
    const wheelFrontRight = createWheelOptions();
    wheelFrontRight.chassisConnectionPointLocal.set(vehicleParams.chassisWidth/2 - 0.3, 0, vehicleParams.chassisLength/2 - 0.5);
    vehicle.addWheel(wheelFrontRight);

    // Rear left
    const wheelRearLeft = createWheelOptions();
    wheelRearLeft.chassisConnectionPointLocal.set(-vehicleParams.chassisWidth/2 + 0.3, 0, -vehicleParams.chassisLength/2 + 0.5);
    vehicle.addWheel(wheelRearLeft);

    // Rear right
    const wheelRearRight = createWheelOptions();
    wheelRearRight.chassisConnectionPointLocal.set(vehicleParams.chassisWidth/2 - 0.3, 0, -vehicleParams.chassisLength/2 + 0.5);
    vehicle.addWheel(wheelRearRight);

    vehicle.addToWorld(world);

    // Create Three.js mesh for chassis
    const chassisGeometry = new THREE.BoxGeometry(
        vehicleParams.chassisWidth,
        vehicleParams.chassisHeight,
        vehicleParams.chassisLength
    );
    const chassisMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial);
    chassisMesh.castShadow = true;
    scene.add(chassisMesh);

    // Create Three.js meshes for wheels
    // Rotate the geometry itself so it's oriented correctly
    const wheelGeometry = new THREE.CylinderGeometry(
        vehicleParams.wheelRadius,
        vehicleParams.wheelRadius,
        vehicleParams.wheelThickness,
        32
    );
    // Rotate geometry to align with Cannon.js wheel orientation
    wheelGeometry.rotateZ(Math.PI / 2);

    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });

    const wheelMeshes = [];
    for (let i = 0; i < 4; i++) {
        const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheelMesh.castShadow = true;
        scene.add(wheelMesh);
        wheelMeshes.push(wheelMesh);
    }

    // Store references
    chassisBody.threemesh = chassisMesh;
    vehicle.wheelMeshes = wheelMeshes;

    console.log('Vehicle created successfully');
    console.log('Chassis mass:', chassisBody.mass);
    console.log('Number of wheels:', vehicle.wheelInfos.length);
}

function setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;

        // Camera switch
        if (e.key.toLowerCase() === 'c') {
            cameraMode = (cameraMode + 1) % cameraModes.length;
            document.getElementById('camera-mode').textContent = cameraModes[cameraMode];
        }

        // Reset car
        if (e.key.toLowerCase() === 'r') {
            resetVehicle();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    // Window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function resetVehicle() {
    chassisBody.position.set(0, 5, 0);
    chassisBody.quaternion.set(0, 0, 0, 1);
    chassisBody.velocity.set(0, 0, 0);
    chassisBody.angularVelocity.set(0, 0, 0);

    // Reset wheel rotations
    for (let i = 0; i < vehicle.wheelInfos.length; i++) {
        vehicle.wheelInfos[i].worldTransform.position.setZero();
        vehicle.wheelInfos[i].worldTransform.quaternion.set(0, 0, 0, 1);
    }

    console.log('Vehicle reset');
}

function updateVehicle() {
    const maxSteerVal = vehicleParams.maxSteerVal;
    const maxForce = vehicleParams.maxForce;
    const brakeForce = vehicleParams.brakeForce;

    // Reset forces
    vehicle.applyEngineForce(0, 0);
    vehicle.applyEngineForce(0, 1);
    vehicle.applyEngineForce(0, 2);
    vehicle.applyEngineForce(0, 3);

    vehicle.setBrake(0, 0);
    vehicle.setBrake(0, 1);
    vehicle.setBrake(0, 2);
    vehicle.setBrake(0, 3);

    // Forward/Backward - Apply force to rear wheels (index 2 and 3)
    if (keys['w'] || keys['arrowup']) {
        vehicle.applyEngineForce(maxForce, 2);
        vehicle.applyEngineForce(maxForce, 3);
    } else if (keys['s'] || keys['arrowdown']) {
        vehicle.applyEngineForce(-maxForce, 2);
        vehicle.applyEngineForce(-maxForce, 3);
    }

    // Steering - Apply to front wheels (index 0 and 1)
    if (keys['a'] || keys['arrowleft']) {
        vehicle.setSteeringValue(maxSteerVal, 0);
        vehicle.setSteeringValue(maxSteerVal, 1);
    } else if (keys['d'] || keys['arrowright']) {
        vehicle.setSteeringValue(-maxSteerVal, 0);
        vehicle.setSteeringValue(-maxSteerVal, 1);
    } else {
        vehicle.setSteeringValue(0, 0);
        vehicle.setSteeringValue(0, 1);
    }

    // Handbrake
    if (keys[' ']) {
        vehicle.setBrake(brakeForce, 0);
        vehicle.setBrake(brakeForce, 1);
        vehicle.setBrake(brakeForce, 2);
        vehicle.setBrake(brakeForce, 3);
    }

    // Update chassis mesh position and rotation
    chassisBody.threemesh.position.copy(chassisBody.position);
    chassisBody.threemesh.quaternion.copy(chassisBody.quaternion);

    // Update wheel meshes
    for (let i = 0; i < vehicle.wheelInfos.length; i++) {
        vehicle.updateWheelTransform(i);
        const transform = vehicle.wheelInfos[i].worldTransform;
        const wheelMesh = vehicle.wheelMeshes[i];
        wheelMesh.position.copy(transform.position);
        wheelMesh.quaternion.copy(transform.quaternion);
    }

    // Update speed display
    const speed = chassisBody.velocity.length() * 3.6; // Convert to km/h
    document.getElementById('speed').textContent = Math.round(speed);
}

function updateCamera() {
    const chassisPosition = chassisBody.position;
    const chassisQuaternion = chassisBody.quaternion;

    if (cameraMode === 0) {
        // Follow camera
        const offset = new CANNON.Vec3(0, 3, 8);
        const worldOffset = chassisQuaternion.vmult(offset);
        camera.position.set(
            chassisPosition.x + worldOffset.x,
            chassisPosition.y + worldOffset.y,
            chassisPosition.z + worldOffset.z
        );
        camera.lookAt(
            chassisPosition.x,
            chassisPosition.y + 1,
            chassisPosition.z
        );
    } else if (cameraMode === 1) {
        // First person camera
        const offset = new CANNON.Vec3(0, 0.8, 1);
        const worldOffset = chassisQuaternion.vmult(offset);
        camera.position.set(
            chassisPosition.x + worldOffset.x,
            chassisPosition.y + worldOffset.y,
            chassisPosition.z + worldOffset.z
        );

        const lookOffset = new CANNON.Vec3(0, 0.5, -10);
        const worldLookOffset = chassisQuaternion.vmult(lookOffset);
        camera.lookAt(
            chassisPosition.x + worldLookOffset.x,
            chassisPosition.y + worldLookOffset.y,
            chassisPosition.z + worldLookOffset.z
        );
    } else if (cameraMode === 2) {
        // Cinematic camera
        const time = Date.now() * 0.0005;
        const radius = 15;
        camera.position.set(
            chassisPosition.x + Math.sin(time) * radius,
            chassisPosition.y + 8,
            chassisPosition.z + Math.cos(time) * radius
        );
        camera.lookAt(chassisPosition.x, chassisPosition.y, chassisPosition.z);
    }
}

function updatePhysics() {
    const timeStep = 1 / 60;
    world.step(timeStep);

    // Update dynamic objects
    scene.traverse((object) => {
        if (object.userData.physicsBody) {
            object.position.copy(object.userData.physicsBody.position);
            object.quaternion.copy(object.userData.physicsBody.quaternion);
        }
    });
}

function animate() {
    requestAnimationFrame(animate);

    // Update physics
    updatePhysics();

    // Update vehicle
    updateVehicle();

    // Update camera
    updateCamera();

    // Render scene
    renderer.render(scene, camera);
}

// Start the application
init();
