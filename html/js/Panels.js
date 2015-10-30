function Panels() {
    this.panels = {};
    this.vertices = [];
    this.verticesByKey = {};
    this.panelsByEdge = {};
}

Panels.prototype.all = function () {
    var panels = this.panels;
    var all = [];
    Object.keys(panels).forEach(function (name) {
        all.push(panels[name]);
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
        var segmentIds = [localVertexIds[v1], localVertexIds[v2]].sort();
        var segmentKey = segmentIds[0] + "," + segmentIds[1];
        segmentsByKey[segmentKey] = segmentIds;
        if (seenSegments[segmentKey]) {
            var i = outlineSegments.indexOf(segmentKey);
            if (i != -1) outlineSegments.splice(i, 1);
        } else {
            outlineSegments.push(segmentKey);
            seenSegments[segmentKey] = true;
        }
    }

    panel.geometry.faces.forEach(function (face) {
        check(face.a, face.b);
        check(face.b, face.c);
        check(face.c, face.a);
    });

//    console.log("Outline for " + panel.name + ":", outlineSegments);

    var lineGroup = new THREE.Group();
    var lineColor = panel.color.clone().multiplyScalar(0.1);
    var material = new THREE.LineBasicMaterial({color: lineColor, linewidth: 4});
    outlineSegments.forEach(function (segmentKey) {
        var outlineGeometry = new THREE.Geometry();
        var segmentIds = segmentKey.split(",");
        var v1 = self.getVertexByLocalId(segmentIds[0]);
        var v2 = self.getVertexByLocalId(segmentIds[1]);
        outlineGeometry.vertices.push(v1);
        outlineGeometry.vertices.push(v2);
        lineGroup.add(new THREE.Line(outlineGeometry, material));
    });
    panel.outline = lineGroup;

    outlineSegments.forEach(function (segmentKey) {
        var panelsForEdge = self.panelsByEdge[segmentKey];
        if (panelsForEdge == null) {
            panelsForEdge = [];
            self.panelsByEdge[segmentKey] = panelsForEdge;
        }
        panelsForEdge.push(panel);
    });
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
