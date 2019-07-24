function Panel(mesh, info) {
    this.mesh = mesh;
    this.name = mesh.name;
    this.longName = mesh.name;
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
            this.longName += "\n" + this.info.section;
            label.innerHTML += '<div class="section">' + this.info.section + '</div>';
        }

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

    this.computeFaceNormal();
    this.flipped = false;
}

Panel.prototype.computeFaceNormal = function () {
    this.mesh.geometry.computeFaceNormals();
    var v = new THREE.Vector3(0);
    this.mesh.geometry.faces.forEach(function (face) {
        v.add(face.normal);
    });
    v.divideScalar(this.mesh.geometry.faces.length);
    this.normal = v;
};

Panel.prototype.isPanel = function () {
    return !this.name.match("^(Face|Tail|Ear)");
};

Panel.prototype.isSide = function () {
    return this.name.indexOf('F') === -1 && this.name.indexOf('R') === -1;
};

// some combination of F(ront), R(ear), S(ide), D(river), and (P)assenger
Panel.prototype.isType = function (type) {
    var myType = (this.isSide() ? 'S' : '') + this.name.replace(/[0-9AB]+/, '');
    return myType.indexOf(type) !== -1;
};

Panel.prototype.setVisibility = function (visible) {
    this.mesh.visible = visible;
    if (this.outline) this.outline.visible = visible;
    this.label.classList.toggle('invisible', !visible);
};

Panel.prototype.isVisible = function () {
    return this.mesh.visible;
};

Panel.prototype.flip = function (inverted) {
    this.geometry.faces.forEach(function (face) {
        var verts = [face.a, face.b, face.c];
        face.a = verts[2];
        face.c = verts[0];
    });
    if (this.mesh.material.side === THREE.FrontSide) {
        this.mesh.material.side = THREE.BackSide;
    } else if (this.mesh.material.side === THREE.BackSide) {
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
    this.geometry.vertices.forEach(function (v) {
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

    // if (this.name == '7D') {
    //     document.getElementById('panel-misc-info-1').innerText =
    //         'topleft: ' + boxMin.x.toFixed(4) + ", " + boxMin.y.toFixed(4) + " " +
    //         'botrght: ' + boxMax.x.toFixed(4) + ", " + boxMax.y.toFixed(4) + " " +
    //         'dist: ' + boxSize;
    // } else if (this.name == 'F3P') {
    //     document.getElementById('hrule').style.top = parseInt(boxMin.y) + 'px';
    //     document.getElementById('vrule').style.left = parseInt(boxMin.x) + 'px';
    //     document.getElementById('hrule2').style.top = parseInt(boxMax.y) + 'px';
    //     document.getElementById('vrule2').style.left = parseInt(boxMax.x) + 'px';
    //
    //     document.getElementById('panel-misc-info-2').innerText =
    //         'topleft: ' + boxMin.x.toFixed(4) + ", " + boxMin.y.toFixed(4) + " " +
    //         'botrght: ' + boxMax.x.toFixed(4) + ", " + boxMax.y.toFixed(4) + " " +
    //         'dist: ' + boxSize;
    // }

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

Panel.prototype.edges = function () {
    return this.outerEdges;
};

Panel.prototype.edgesLinearLength = function () {
    var len = 0;
    this.outerEdges.forEach(function(edge) {
        len += edge.length();
    });
    console.log(this.name, this.outerEdges.map(function(edge) { return MeasurementUtils.toPrettyFeetAndInches(edge.length()) }),
        "=", MeasurementUtils.toPrettyFeetAndInches(len));
    return len;
};

Panel.prototype.surfaceArea = function () {
    return 0;
};

Panel.prototype.orderedOutlineSegments = function (allVertices) {
    var modelVertexIds = this.geometry.vertices.map(function (vertex) {
        var globalVertex = vertex.clone().add(this.mesh.position);
        return allVertices.idFor(globalVertex);
    }.bind(this));

    // count all segments between vertices
    var seenSegments = {};
    function recordSegment(v1, v2) {
        var normalizedPair = [modelVertexIds[v1], modelVertexIds[v2]].sort().join(",");
        if (!seenSegments[normalizedPair]) seenSegments[normalizedPair] = 0;
        seenSegments[normalizedPair]++;
    }
    this.geometry.faces.forEach(function (face) {
        recordSegment(face.a, face.b);
        recordSegment(face.b, face.c);
        recordSegment(face.c, face.a);
    });

    // take all unique segments
    var outlineSegments = [];
    function takeSegmentIfUnique(v1, v2) {
        var mv1 = modelVertexIds[v1];
        var mv2 = modelVertexIds[v2];
        var normalizedPair = [mv1, mv2].sort().join(",");
        if (seenSegments[normalizedPair] === 1) {
            outlineSegments.push([mv1, mv2]);
        }
    }
    this.geometry.faces.forEach(function (face) {
        takeSegmentIfUnique(face.a, face.b);
        takeSegmentIfUnique(face.b, face.c);
        takeSegmentIfUnique(face.c, face.a);
    });

    return outlineSegments;
};

Panel.prototype.flattened = function() {
    /// ignore dimensionality here, just get outline, normalized
    var quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(this.normal, new THREE.Vector3(0, 0, 1));

    var flatGeometry = new THREE.Geometry();
    var edges = this.edges();
    flatGeometry.vertices.push(edges[0].v1.clone().applyQuaternion(quaternion));
    edges.forEach(function (edge) {
        flatGeometry.vertices.push(edge.v2.clone().applyQuaternion(quaternion));
    });

    flatGeometry.vertices.forEach(function (vertex) {
        vertex.z = 0;
    });

    if (!flatGeometry.vertices[flatGeometry.vertices.length - 1].equals(flatGeometry.vertices[0])) {
        flatGeometry.vertices.push(flatGeometry.vertices[0].clone());
    }

    flatGeometry.center();
    return flatGeometry;




    var face0 = this.mesh.geometry.faces[0];
    var normal = face0.normal;
    var flatGeometry = this.mesh.geometry.clone();
    var vertices = new Vertices();

    for (var i = 0; i < flatGeometry.faces.length; i++) {
        var face = flatGeometry.faces[i];
        face.a = vertices.idFor(flatGeometry.vertices[face.a]);
        face.b = vertices.idFor(flatGeometry.vertices[face.b]);
        face.c = vertices.idFor(flatGeometry.vertices[face.c]);
    }
    flatGeometry.vertices = vertices.unique;


    var quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(normal, new THREE.Vector3(0, 0, 1));
    // quaternion.x = 0; // never rotate around the x axis or some angles (F10P, F11) come out wonky…
    flatGeometry.vertices.forEach(function (vertex) {
        vertex.applyQuaternion(quaternion);
        // vertex.z -= flatGeometry.vertices[0].z;
    }.bind(this));

    var vertexFace = [];
    vertexFace[face0.a] = face0;
    vertexFace[face0.b] = face0;
    vertexFace[face0.c] = face0;

    for (var i = 1; i < flatGeometry.faces.length; i++) {
        flatGeometry.computeFaceNormals();

        face = flatGeometry.faces[i];
        if (vertexFace[face.a] && vertexFace[face.b]) {
            console.log("a & b");
        } else if (vertexFace[face.b] && vertexFace[face.c]) {
            console.log("b & c");
        } else if (vertexFace[face.a] && vertexFace[face.c]) {
            console.log("a & c");
        } else {
            console.log("none!");
        }


        for (var j = i; j < flatGeometry.faces.length; j++) {
            face = flatGeometry.faces[j];
            quaternion.setFromUnitVectors(flatGeometry.faces[i].normal, new THREE.Vector3(0, 0, 1));

            flatGeometry.vertices.push(flatGeometry.vertices[face.a].clone().applyQuaternion(quaternion));
            face.a = flatGeometry.vertices.length - 1;

            flatGeometry.vertices.push(flatGeometry.vertices[face.b].clone().applyQuaternion(quaternion));
            face.b = flatGeometry.vertices.length - 1;

            flatGeometry.vertices.push(flatGeometry.vertices[face.c].clone().applyQuaternion(quaternion));
            face.c = flatGeometry.vertices.length - 1;

            // [face.a, face.b, face.c].forEach(function (vertexIdx) {
            //     flatGeometry.vertices[vertexIdx].applyQuaternion(quaternion);
            // });
        }
    }






    // flatGeometry.faces.forEach(function (face) {
    //     console.log(this.name, face.normal);
    // }.bind(this));
    // var v1 = this.v1.clone().applyQuaternion(quaternion);
    // var v2 = this.v2.clone().applyQuaternion(quaternion);
    //
    // var vector = v1.clone().sub(v2);
    // return Math.atan2(vector.y, -vector.x) / (2 * Math.PI) * 360;
    return flatGeometry;
};

function Edge(panel, v1, v2, panelsByEdge, edgeKey) {
    this.panel = panel;
    this.v1 = v1;
    this.v2 = v2;

    Object.defineProperty(this, "otherPanel", {
        get: function() {
            var allPanels = panelsByEdge[edgeKey];
            if (allPanels.length == 2) {
                return allPanels[0].name == panel.name ? allPanels[1] : allPanels[0];
            }
            return null;
        }
    });
}

Edge.prototype.angle = function () {
    if (this.computedAngle_ === undefined) {
        var quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(this.panel.normal, new THREE.Vector3(0, 0, 1));
        quaternion.x = 0; // never rotate around the x axis or some angles (F10P, F11) come out wonky…

        var v1 = this.v1.clone().applyQuaternion(quaternion);
        var v2 = this.v2.clone().applyQuaternion(quaternion);

        var vector = v1.clone().sub(v2);
        this.computedAngle_ = 180 - Math.atan2(vector.y, -vector.x) / (2 * Math.PI) * 360;

        this.computedAngle_ = 0 - this.computedAngle_;
        while (this.computedAngle_ < 0) this.computedAngle_ += 360;
        while (this.computedAngle_ >= 360) this.computedAngle_ -= 360;
    }

    return this.computedAngle_;
};

Edge.prototype.length = function () {
    return this.v1.distanceTo(this.v2);
};

Edge.prototype.compoundLength = function () {
    var computedLength = 0;
    var myAngle = this.angle();
    this.panel.edges().forEach(function (otherEdge) {
        if (Math.abs(otherEdge.angle() - myAngle) < 5) {
            computedLength += otherEdge.length();
        }
    });
    return computedLength;
};

MeasurementUtils = {};
MeasurementUtils.toPrettyFeetAndInches = function(length) {
    var negative = length < 0;
    length = Math.abs(length);
    var feet = Math.floor(length / 12);
    var inches = Math.floor(length % 12);
    var fractionalInches = length % 12 - inches;
    if (fractionalInches < .25 / 4) {
        fractionalInches = "";
    } else if (fractionalInches > .25 / 4 && fractionalInches < .25 / 2) {
        fractionalInches = "¼";
    } else if (fractionalInches < .5 / 2) {
        fractionalInches = "½";
    } else if (fractionalInches < .75 / 2) {
        fractionalInches = "¾";
    } else {
        fractionalInches = "";
        inches++;
    }

    if (inches == 12) {
        inches = 0;
        feet++;
    }
    var inchesWithFraction = inches + fractionalInches;

    return (negative ? "-" : "") + (feet > 0 ? feet + "'" : '') + inchesWithFraction + '"';
};

// THREE.Vector3.prototype.toString = function() {
//     return "Vector3[" + MeasurementUtils.toPrettyFeetAndInches(this.x) + ", " +
//         MeasurementUtils.toPrettyFeetAndInches(this.y) + ", " +
//         MeasurementUtils.toPrettyFeetAndInches(this.z) + "]";
// };