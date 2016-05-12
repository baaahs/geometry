function PackingViewer(panels, container, text) {
    this.panels = panels;
    this.container = container;

    this.lookAt = new THREE.Vector3(0, 0, 0);

    var windowX = window.innerWidth;
    var windowY = window.innerHeight;

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
    this.scene.add(new THREE.AmbientLight(0xcccccc));
    this.scene.add(new THREE.HemisphereLight(0x666666, 0x080820, 1));


    // Uncomment these lines to create a simple directional light.
    // var directionalLight = new THREE.DirectionalLight( 0xffeedd );
    // directionalLight.position.set( 0, 0, 1 ).normalize();
    // this.scene.add( directionalLight );

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

    this.panels.all().forEach(function (panel) {
        this.container.appendChild(panel.label);
    }.bind(this));

    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( geometry, material );
    this.scene.add( cube );

    this.draw(text);
}

PackingViewer.prototype.draw = function (text) {
    var index = 0;
    var maxX = 0;
    var maxY = 0;

    this.panels.all().forEach(function (panel) {
        var flatGeometry = panel.flattened();

        var material = new THREE.LineBasicMaterial({color: panel.mesh.material.color, linewidth: 2});
        material.overdraw = 1;
        var flatPanelObj = new THREE.Line(flatGeometry, material);
        flatPanelObj.position.set(index % 10 * 50, Math.round(index / 10) * 50, 0);
        // flatPanelObj.position.copy(panel.mesh.position);
        this.scene.add(flatPanelObj);
        // panel.mesh.geometry.faces.forEach(function (face) {
        //     face.normal;
        // });

        text.innerHTML += panel.name + ": " + flatGeometry.vertices.map(function (vertex) {
            return vertex.x + "," + vertex.y;
        }.bind(this)).join(" ") + "\n";

        var box = flatGeometry.boundingBox;
        var width = box.max.x - box.min.x;
        var height = box.max.y - box.min.y;
        if (width > maxX) maxX = width;
        if (height > maxY) maxY = height;

        index++;
    }.bind(this));
    text.innerHTML = "Max: " + maxX + " x " + maxY + "\n\n" + index + "\n" + text.innerHTML;
};


PackingViewer.prototype.animate = function () {
    if (document.visibilityState == 'visible') {
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

        // this.panels.all().forEach(function (panel) {
//        if (frustum.intersectsObject(panel.mesh)) {
//             panel.positionLabel(this);
//        } else {
//          panel.hideLabel();
//        }
//         }.bind(this));
    }

    // This function calls itself on every frame. You can for example change
    // the objects rotation on every call to create a turntable animation.
    if (this.renderAgain) {
        requestAnimationFrame(PackingViewer.prototype.animate.bind(this));
    }
};

PackingViewer.prototype.startRendering = function () {
    if (this.renderAgain != true) {
        this.renderAgain = true;

        this.animate();
    }
};

PackingViewer.prototype.stopRendering = function () {
    this.renderAgain = false;
};
