function MapViewer(container) {
    this.lookAt = new THREE.Vector3(0, 0, 0);
    console.log('lookat', this.lookAt);

    var windowX = window.innerWidth;
    var windowY = window.innerHeight - 200;

    this.panels = new Panels();

    // This <div> will host the canvas for our scene.
    this.container = container;

    // You can adjust the cameras distance and set the FOV to something
    // different than 45°. The last two values set the clippling plane.
    this.camera = new THREE.PerspectiveCamera(45, windowX / windowY, 1, 2000);
    this.camera.position.z = 400;
//    this.camera.position.x = 200;
//    this.camera.position.y = -100;

    // This is the scene we will add all objects to.
    this.scene = new THREE.Scene();

    // You can set the color of the ambient light to any value.
    // I have chose a completely white light because I want to paint
    // all the shading into my texture. You propably want something darker.
    var ambient = new THREE.AmbientLight(0xcccccc);
    this.scene.add(ambient);

    var light = new THREE.HemisphereLight(0x666666, 0x080820, 1);
    this.scene.add(light);


    // Uncomment these lines to create a simple directional light.
    // var directionalLight = new THREE.DirectionalLight( 0xffeedd );
    // directionalLight.position.set( 0, 0, 1 ).normalize();
    // this.scene.add( directionalLight );

    /*** Texture Loading ***/
    var manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {
        console.log(item, loaded, total);
    };

    /*** OBJ Loading ***/
    var loader = new THREE.OBJLoader(manager);

    // We set the renderer to the size of the window and
    // append a canvas to our HTML page.
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setSize(windowX, windowY);
    this.container.appendChild(this.renderer.domElement);

    // These variables set the camera behaviour and sensitivity.
    this.controls = new THREE.TrackballControls(this.camera, this.container);
    this.controls.rotateSpeed = 5.0;
    this.controls.zoomSpeed = 5;
    this.controls.panSpeed = 2;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactor = 0.3;

    // As soon as the OBJ has been loaded this function looks for a mesh
    // inside the data and applies the texture to it.
    var modelUrl = 'export-from-model.obj';
    if (document.location.hostname.indexOf("github") != 0) modelUrl = '../' + modelUrl;
    loader.load(modelUrl, function (event) {
        var object = event;
//      console.log(object);

        object.traverse(function (child) {
//        console.log(child);
            if (child instanceof THREE.Mesh) {
                child.geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);
                child.geometry.computeFaceNormals();

                var info = this.panels.infos[child.name];
                var panel = new Panel(child, info);
                this.container.appendChild(panel.label);
                this.panels.add(panel);
            }
        }.bind(this));

        this.panels.all().forEach(function (panel) {
            panel.updateStyle();
        });

        // My initial model was too small, so I scaled it upwards.
//      object.scale = new THREE.Vector3(25, 25, 25);

        // You can change the position of the object, so that it is not
        // centered in the view and leaves some space for overlay text.

//      centroid.divideScalar(vertexCount);

        var bounds = new THREE.Box3().setFromObject(object);
        var objCenter = bounds.center();
        console.log('bounding box:', bounds, 'center:', objCenter);

        object.position.x = 0 - objCenter.x;
        object.position.y = 0;
        object.position.z = 0 - objCenter.z;
        this.lookAt.y = objCenter.y;

        console.log("Sheep origin is", object.position);

        this.camera.position.y = objCenter.y;
//      this.camera.lookAt(this.lookAt);
        this.controls.target = this.lookAt;

        this.scene.add(object);
    }.bind(this));
}

MapViewer.prototype.animate = function() {
    // On every frame we need to calculate the new camera position
    // and have it look exactly at the center of our scene.
    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    function fmtFloat(f, left, right) {
        var str = f.toFixed(right);
        while (str.length < left + right + 1) str = ' ' + str;

        return str;
    }
    function vectorToString(vector) {
        return "x: " + fmtFloat(vector.x, 3, 2) + "; y: " + fmtFloat(vector.y, 3, 2) + "; z: " + fmtFloat(vector.z, 3, 2);
    }

    document.getElementById('camera-position').innerText = vectorToString(this.camera.position);
    document.getElementById('camera-direction').innerText = vectorToString(this.camera.getWorldDirection());

    var frustum = new THREE.Frustum();
    var cameraViewProjectionMatrix = new THREE.Matrix4();

// every time the camera or objects change position (or every frame)

    this.camera.updateMatrixWorld(); // make sure the camera matrix is updated
    this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
    cameraViewProjectionMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    frustum.setFromMatrix(cameraViewProjectionMatrix);

// frustum is now ready to check all the objects you need

    this.panels.all().forEach(function (panel) {
//        if (frustum.intersectsObject(panel.mesh)) {
        panel.positionLabel(this);
//        } else {
//          panel.hideLabel();
//        }
    }.bind(this));

    // This function calls itself on every frame. You can for example change
    // the objects rotation on every call to create a turntable animation.
    if (this.renderAgain) {
        requestAnimationFrame(MapViewer.prototype.animate.bind(this));
    }
};

MapViewer.prototype.startRendering = function() {
    if (this.renderAgain != true) {
        this.renderAgain = true;

        this.animate();
    }
};

MapViewer.prototype.stopRendering = function() {
    this.renderAgain = false;
};

MapViewer.prototype.toScreenPosition = function(vector) {
//    var vector = new THREE.Vector3();

//    obj.updateMatrixWorld();
//    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(this.camera);

    var widthHalf = 0.5 * this.renderer.context.canvas.width;
    var heightHalf = 0.5 * this.renderer.context.canvas.height;
    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = -( vector.y * heightHalf ) + heightHalf;

    return {x: vector.x, y: vector.y};
};
