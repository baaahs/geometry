function Panels() {
    this.panels = {};
    this.vertices = [];
    this.verticesByKey = {};
    this.panelsByEdge = {};

    var panelInfos = {};

    Object.keys(BAAAHS.Geometry.PANEL_MAP).forEach(function (key) {
        var panelInfoA = BAAAHS.Geometry.PANEL_MAP[key];
        var panelInfo = new PanelInfo(panelInfoA[0], panelInfoA[1], panelInfoA[2]);
        panelInfos[panelInfo.name] = panelInfo;
    });
    this.infos = panelInfos;
}

Panels.prototype.load = function (modelUrl, callback) {
    var manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {
        console.log(item, loaded, total);
    };

    /*** OBJ Loading ***/
    var loader = new THREE.OBJLoader(manager);

    if (document.location.hostname.indexOf("github") != 0) modelUrl = '../' + modelUrl;

    loader.load(modelUrl, function (event) {
        var object = event;
        console.log('Loaded model:', object);
        this.model = object;

        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);

                // center panel on its vertices, and reposition it within the parent to compensate…
                child.geometry.computeBoundingBox();
                var offset = child.geometry.boundingBox.center();
                child.geometry.translate(-offset.x, -offset.y, -offset.z);
                child.position.add(offset);

                var info = this.infos[child.name];
                var panel = new Panel(child, info);
                this.add(panel);
            }
        }.bind(this));

        this.all().forEach(function (panel) {
            panel.updateStyle();
        });

        callback();
    }.bind(this));
};

Panels.prototype.all = function () {
    var panels = this.panels;
    var all = [];
    Object.keys(panels).forEach(function (name) {
        var panel = panels[name];
        if (panel.isPanel()) all.push(panel);
    });
    return all;
};

Panels.prototype.add = function (panel) {
    if (this.panels[panel.name]) {
        throw "Huh! We already have a " + panel.name + "!";
    }
    this.panels[panel.name] = panel;

//    if (panel.name == '37D')
    this.inventory(panel);
    this.emitFixtureCodeFor(panel);
};

Panels.prototype.inventory = function (panel) {
    var self = this;
    var localVertexIds = panel.geometry.vertices.map(function (vertex) {
        return self.localVertexIdFor(vertex);
    });

    var seenSegments = {};
    var outlineSegments = [];
    var segmentsByKey = {};

    function check(v1, v2) {
        // key has vertices re-ordered, so edges have unknown directionality
        var segmentKey = localVertexIds[v1] + "," + localVertexIds[v2];
        var segmentKeyAlt = localVertexIds[v2] + "," + localVertexIds[v1];

        segmentsByKey[segmentKey] = [localVertexIds[v1], localVertexIds[v2]];
        segmentsByKey[segmentKeyAlt] = [localVertexIds[v2], localVertexIds[v1]];
        if (seenSegments[segmentKey] || seenSegments[segmentKeyAlt]) {
            var i = outlineSegments.indexOf(segmentKey);
            if (i != -1) outlineSegments.splice(i, 1);

            i = outlineSegments.indexOf(segmentKeyAlt);
            if (i != -1) outlineSegments.splice(i, 1);
        } else {
            outlineSegments.push(segmentKey);
            seenSegments[segmentKey] = true;
            seenSegments[segmentKeyAlt] = true;
        }
    }

    panel.geometry.faces.forEach(function (face) {
        check(face.a, face.b);
        check(face.b, face.c);
        check(face.c, face.a);
    });

//    console.log("Outline for " + panel.name + ":", outlineSegments);

    var lineGroup = new THREE.Object3D();
    lineGroup.position.add(panel.mesh.position);
    var lineColor = panel.color.clone().multiplyScalar(0.1);
    var material = new THREE.LineBasicMaterial({color: lineColor, linewidth: 3});
    material.overdraw = 1;

    outlineSegments.forEach(function (segmentKey) {
        var outlineGeometry = new THREE.Geometry();
        var segmentIds = segmentKey.split(",");
        var v1 = self.getVertexByLocalId(segmentIds[0]).clone();
        var v2 = self.getVertexByLocalId(segmentIds[1]).clone();
        outlineGeometry.vertices.push(v1);
        outlineGeometry.vertices.push(v2);
        //outlineGeometry.vertices.reverse();
        lineGroup.add(new THREE.Line(outlineGeometry, material));
    });

    lineGroup.position.add(panel.normal.clone().multiplyScalar(.1));

    panel.outline = lineGroup;

    outlineSegments.forEach(function (segmentKey) {
        var segmentKeyNorm = segmentsByKey[segmentKey].sort().join(",");

        var panelsForEdge = self.panelsByEdge[segmentKeyNorm];
        if (panelsForEdge == null) {
            panelsForEdge = [];
            self.panelsByEdge[segmentKeyNorm] = panelsForEdge;
        }
        panelsForEdge.push(panel);
    });

    panel.outlineSegments = outlineSegments;
};

Panels.prototype.localVertexIdFor = function (vertex) {
    var vertexKey = vertex.x + ',' + vertex.y + ',' + vertex.z;
    var localId = this.verticesByKey[vertexKey];
    if (localId == null) {
        localId = this.vertices.length;
        this.vertices.push(vertex);
        this.verticesByKey[vertexKey] = localId;
    }
    return localId;
};

Panels.prototype.getVertexByLocalId = function (id) {
    return this.vertices[id];
};


Panels.prototype.changePanelVisibility = function (type, visible) {
    this.all().forEach(function (panel) {
        if (panel.isType(type)) {
            panel.setVisibility(visible);
        }
    });
};

Panels.prototype.flipPanels = function (inverted) {
    this.all().forEach(function (panel) {
        panel.flip(inverted);
    });
};

Panels.prototype.emitFixtureCodeFor = function (panel) {
    var decimalPlaces = 0;
    var v = "[" + panel.geometry.vertices.map(function (vertex) {
            return "[" + vertex.x.toFixed(decimalPlaces) + "," + vertex.y.toFixed(decimalPlaces) + "," + vertex.z.toFixed(decimalPlaces) + "]"
        }).join(",") + "]";

    var f = "[" + panel.geometry.faces.map(function (face) {
            return "[" + face.a + "," + face.b + "," + face.c + "]"
        }).join(",") + "]";

    console.log("panelFixture['" + panel.name + "'] = buildFixturePanel('" + panel.name + "', " + v + ", " + f + ");")
};