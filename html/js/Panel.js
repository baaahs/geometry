function Panel(mesh, info) {
    this.mesh = mesh;
    this.name = mesh.name;
    this.info = info;
    if (this.info == null) {
        console.log('No info for ' + this.name + '.');
    }

    this.geometry = mesh.geometry;

    if (this.isPanel()) {
        var label = document.createElement('div');
        label.className = 'panel-label';
        label.innerHTML = '<div class="name">' + this.name + "</div>";
        if (this.info) {
            label.innerHTML += '<div class="section">' + this.info.section + '</div>';
        }

        // invert sides
        //this.geometry.vertices = this.geometry.vertices.map(function(v) {
        //    v = v.clone();
        //    v.z = v.z < 0 ? -200 - v.z : 200 - v.z;
        //    return v;
        //});

        // transparent panels
        //this.mesh.material.transparent = true;
        //this.mesh.material.opacity = 0.9;

        this.label = label;

    }
    if (this.info) {
        this.color = new THREE.Color(BAAAHS.Geometry.SECTION_COLORS[this.info.section]);
    } else if (BAAAHS.Geometry.SECTION_COLORS[this.name]) {
        this.color = new THREE.Color(BAAAHS.Geometry.SECTION_COLORS[this.name]);
    } else {
        this.color = new THREE.Color("#ffffff");
    }

    this.mesh.material.color = this.color;

    this.mesh.geometry.computeFaceNormals();
    var v = new THREE.Vector3(0);
    this.mesh.geometry.faces.forEach(function (face) {
        v.add(face.normal);
    });
    v.divideScalar(this.mesh.geometry.faces.length);
    this.normal = v;

    this.flipped = false;
}

Panel.prototype.isPanel = function () {
    return this.name != 'Face' && this.name != 'Tail' && this.name.indexOf('Ear') == -1 && this.name.indexOf('Eye') == -1;
};

Panel.prototype.isSide = function () {
    return this.name.indexOf('F') == -1 && this.name.indexOf('R') == -1;
};

// some combination of F(ront), R(ear), S(ide), D(river), and (P)assenger
Panel.prototype.isType = function (type) {
    var myType = (this.isSide() ? 'S' : '') + this.name.replace(/[0-9AB]+/, '');
    return myType.indexOf(type) != -1;
};

Panel.prototype.setVisibility = function (visible) {
    this.mesh.visible = visible;
    this.outline.visible = visible;
    if (visible) {
        this.label.classList.remove('invisible');
    } else {
        this.label.classList.add('invisible');
    }
};

Panel.prototype.flip = function(inverted) {
    this.geometry.faces.forEach(function(face) {
        var verts = [face.a, face.b, face.c];
        face.a = verts[2];
        face.c = verts[0];
        console.log(face);
    });
    if (this.mesh.material.side == THREE.FrontSide) {
        this.mesh.material.side = THREE.BackSide;
    } else if (this.mesh.material.side == THREE.BackSide) {
        this.mesh.material.side = THREE.FrontSide;
    }
    //this.mesh.needsUpdate = true;

    this.flipped = !this.flipped;
};

Panel.prototype.updateStyle = function () {
    this.mesh.material.side = THREE.FrontSide;

    this.mesh.material.color = this.color;

    if (this.outline) this.mesh.parent.add(this.outline);
};

Panel.prototype.getCentroid = function () {
    //return this.geometry.vertices[0].clone();

    //var box = new THREE.Box3();
    //box.setFromPoints(this.geometry.vertices);
    //return box.max.clone().sub(box.min).multiplyScalar(.5).add(box.min);

    var centroid = new THREE.Vector3();
    var vertexCount = 0;
    for (var i = 0; i < this.geometry.vertices.length; i++) {
        centroid.add(this.geometry.vertices[i]);
        vertexCount++;
    }
    centroid.divideScalar(vertexCount);
    return centroid;
};

Panel.prototype.hideLabel = function () {
    //if (!this.label.classList.contains('hidden')) {
        this.label.classList.add('hidden');
    //}
};

Panel.prototype.showLabel = function () {
    //if (this.label.classList.contains('hidden')) {
        this.label.classList.remove('hidden');
    //}
};

Panel.prototype.positionLabel = function (mapViewer) {
//    if (this.name.indexOf('P') > -1) {
//      this.hideLabel();
//      return;
//    }

    var center = this.mesh.localToWorld(this.getCentroid());
    var centerPixels = mapViewer.toScreenPosition(center);

    var box = new THREE.Box2();
    this.geometry.vertices.forEach(function(v) {
        var position = mapViewer.toScreenPosition(this.mesh.localToWorld(v.clone()));
        box.expandByPoint(position);
    }.bind(this));
    var boxMin = box.min;
    var boxMax = box.max;

    //this.geometry.computeBoundingBox();
    //var box = this.geometry.boundingBox;
    //var boxMin = mapViewer.toScreenPosition(this.mesh.localToWorld(box.min));
    //var boxMax = mapViewer.toScreenPosition(this.mesh.localToWorld(box.max));
    var xDiff = Math.abs(boxMax.x - boxMin.x);
    var yDiff = Math.abs(boxMax.y - boxMin.y);
    //var boxSize = Math.min(xDiff, yDiff);
    var boxSize = (xDiff + yDiff + Math.min(xDiff, yDiff)) / 3;
    //boxSize = Math.max(boxSize, 40);
    //boxMin = new THREE.Vector2(boxMin.x, boxMin.y);
    //boxMax = new THREE.Vector2(boxMax.x, boxMax.y);
    //var boxSize = Math.sqrt(boxMax.distanceToSquared(boxMin));

    if (this.name == '7D') {
        document.getElementById('panel-misc-info-1').innerText =
            'topleft: ' + boxMin.x.toFixed(4) + ", " + boxMin.y.toFixed(4) + " " +
            'botrght: ' + boxMax.x.toFixed(4) + ", " + boxMax.y.toFixed(4) + " " +
            'dist: ' + boxSize;
    } else if (this.name == 'F3P') {
        document.getElementById('hrule').style.top = parseInt(boxMin.y) + 'px';
        document.getElementById('vrule').style.left = parseInt(boxMin.x) + 'px';
        document.getElementById('hrule2').style.top = parseInt(boxMax.y) + 'px';
        document.getElementById('vrule2').style.left = parseInt(boxMax.x) + 'px';

        document.getElementById('panel-misc-info-2').innerText =
            'topleft: ' + boxMin.x.toFixed(4) + ", " + boxMin.y.toFixed(4) + " " +
            'botrght: ' + boxMax.x.toFixed(4) + ", " + boxMax.y.toFixed(4) + " " +
            'dist: ' + boxSize;
    }

    var fontSize = (boxSize / 12).toFixed();
    //fontSize = Math.min(fontSize, 36);
//    var size = box.max.clone().sub(box.min);

    this.label.style.left = centerPixels.x + 'px';
    this.label.style.top = centerPixels.y + 'px';

    var normalMatrix = new THREE.Matrix3().getNormalMatrix(this.mesh.matrixWorld);

    var panelNormal = this.normal;
    var worldNormal = panelNormal.clone().applyMatrix3(normalMatrix).normalize();
    var cameraDirection = mapViewer.camera.getWorldDirection();
    var dot = worldNormal.clone().dot(cameraDirection);
    var visible = dot > -0.5;
    if (this.flipped ? visible : !visible) {
        this.showLabel();
    } else {
        this.hideLabel();
    }

//    if (this.name == '7D') {
//      document.getElementById('panel-7d-direction').innerText = dot;
//    } else if (this.name == '7P') {
//      document.getElementById('panel-7p-direction').innerText = dot;
//    } else if (this.name == '17D') {
//      document.getElementById('panel-17d-direction').innerText = dot;
//    } else if (this.name == '17P') {
//      document.getElementById('panel-17p-direction').innerText = dot;
//    }

    //var camDist = mapViewer.camera.position.clone().distanceToSquared(center);
//    var fontSize = 1000000.0 / camDist / 18;
//    if (this.name == '7D') console.log("world normal for " + this.name + ":", v, cameraDirection, '...', dot, '__', fontSize);
//    if (this.name == '7D') console.log('cam dist for ' + this.name + ' is ' + camDist / 1000, boxSize, fontSize);
    this.label.style.fontSize = fontSize + 'pt';
};

Panel.prototype.edges = function (panels) {
    return this.outlineSegments.map(function(segment) {
        var segmentIds = segment.split(",");
        var v1 = panels.getVertexByLocalId(segmentIds[0]).clone();
        var v2 = panels.getVertexByLocalId(segmentIds[1]).clone();

        return new Edge(this, v1, v2, panels.panelsByEdge[segmentIds.sort().join(",")]);
    }.bind(this));
};

function Edge(panel, v1, v2, allPanels) {
    this.panel = panel;
    this.v1 = v1;
    this.v2 = v2;
    this.allPanels = allPanels;

    if (allPanels.length == 2) {
        if (allPanels[0].name == panel.name) {
            this.otherPanel = allPanels[1];
        } else {
            this.otherPanel = allPanels[0];
        }
    }
}

Edge.prototype.angle = function() {
    var quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(this.panel.normal, new THREE.Vector3(0, 0, 1));

    //console.log(edge.panel.name, 'v1', edge.v1, 'v2', edge.v2);
    var v1 = this.v1.clone().applyQuaternion(quaternion);
    var v2 = this.v2.clone().applyQuaternion(quaternion);
    //console.log(edge.panel.name, 'v1', v1, 'v2', v2, '*** rotated');

    var vector = v1.clone().sub(v2);
    return Math.atan2(vector.y, -vector.x) / (2 * Math.PI) * 360;
    //console.log('endpoints of edge between ', edge.panel.name, 'and', edge.otherPanel.name, ':', v1, v2, 'angle:', angle);
};