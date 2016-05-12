function Panels() {
    this.panels = {};
    this.allVertices = new Vertices();
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
    // this.emitFixtureCodeFor(panel);
};

Panels.prototype.inventory = function (panel) {
    var localVertexIds = panel.geometry.vertices.map(function (vertex) {
        var globalVertex = vertex.clone().add(panel.mesh.position);
        return this.allVertices.idFor(globalVertex);
    }.bind(this));

    // console.log('panel vertex global ids', panel.name, localVertexIds, panel.geometry.vertices.map(function (vertex) {
    //     return vertex.clone().add(panel.mesh.position);
    // }));


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

    var segmentMap = {};
    outlineSegments.forEach(function (segmentKey) {
        var segmentIds = segmentKey.split(",");
        if (!segmentMap[segmentIds[0]]) {
            segmentMap[segmentIds[0]] = [segmentIds[1]];
        } else {
            segmentMap[segmentIds[0]].push(segmentIds[1]);
        }
        if (!segmentMap[segmentIds[1]]) {
            segmentMap[segmentIds[1]] = [segmentIds[0]];
        } else {
            segmentMap[segmentIds[1]].push(segmentIds[0]);
        }
    });

    var orderedOutlineSegments = [];
    if (outlineSegments.length > 0) {
        var startVid = outlineSegments[0].split(",")[0];
        for (var i = 0; i < outlineSegments.length; i++) {
            var dests = segmentMap[startVid];
            if (!dests) {
                console.log("huh? discontiniuty for " + panel.name + " at " + startVid);
                break;
            }
            var nextVid;
            if (segmentMap[dests[0]]) {
                nextVid = segmentMap[startVid][0];
            } else {
                nextVid = segmentMap[startVid][1];
            }
            orderedOutlineSegments.push([startVid, nextVid]);
            delete segmentMap[startVid];
            startVid = nextVid;
        }

        // ensure we're going counter-clockwise
        var prevSegment = orderedOutlineSegments[orderedOutlineSegments.length - 1];

        var sum = 0;
        orderedOutlineSegments.forEach(function (segment) {
            var fromV = this.allVertices.getById(segment[0]);
            var toV = this.allVertices.getById(segment[1]);
            sum += (toV.x - fromV.x) * (toV.y - fromV.y);
        }.bind(this));

        var clockwise = sum > 0;
        if (clockwise) {
            // clockwise, so reverse everything…
            orderedOutlineSegments = orderedOutlineSegments.reverse();
        }

        orderedOutlineSegments = orderedOutlineSegments.map(function (segments) {
            if (clockwise) {
                return segments[1] + "," + segments[0];
            } else {
                return segments[0] + "," + segments[1];
            }
        })
    }

    outlineSegments = orderedOutlineSegments;

    console.log(panel.name, orderedOutlineSegments);

//    console.log("Outline for " + panel.name + ":", outlineSegments);

    var lineGroup = new THREE.Object3D();
    lineGroup.position.add(panel.mesh.position);
    var lineColor = panel.color.clone().multiplyScalar(0.1);
    var material = new THREE.LineBasicMaterial({color: lineColor, linewidth: 3});
    material.overdraw = 1;

    outlineSegments.forEach(function (segmentKey) {
        var outlineGeometry = new THREE.Geometry();
        var segmentIds = segmentKey.split(",");
        var v1 = this.allVertices.getById(segmentIds[0]).clone().sub(panel.mesh.position);
        var v2 = this.allVertices.getById(segmentIds[1]).clone().sub(panel.mesh.position);
        outlineGeometry.vertices.push(v1);
        outlineGeometry.vertices.push(v2);
        //outlineGeometry.vertices.reverse();
        lineGroup.add(new THREE.Line(outlineGeometry, material));
    }.bind(this));

    lineGroup.position.add(panel.normal.clone().multiplyScalar(.1));

    panel.outline = lineGroup;

    var normalizedOutlineSegments = [];
    outlineSegments.forEach(function (segmentKey) {
        var segmentKeyNorm = segmentsByKey[segmentKey].sort().join(",");
        normalizedOutlineSegments.push(segmentKeyNorm);

        var panelsForEdge = this.panelsByEdge[segmentKeyNorm];
        if (panelsForEdge == null) {
            panelsForEdge = [];
            this.panelsByEdge[segmentKeyNorm] = panelsForEdge;
        }
        panelsForEdge.push(panel);
    }.bind(this));

    // console.log('panel outline', panel.name, normalizedOutlineSegments);

    panel.outerEdges = outlineSegments.map(function (segmentKey) {
        var segmentIds = segmentKey.split(",");
        var v1 = this.allVertices.getById(segmentIds[0]).clone();
        var v2 = this.allVertices.getById(segmentIds[1]).clone();
        return new Edge(panel, v1, v2, this.panelsByEdge[segmentIds.sort().join(",")]);
    }.bind(this));
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

function Vertices() {
    this.unique = [];
    this.byKey = {};
}

Vertices.prototype.idFor = function (vertex) {
    // why is the precision off here after just addition?
    var precision = 3;
    var vertexKey = vertex.x.toFixed(precision) + ',' + vertex.y.toFixed(precision) + ',' + vertex.z.toFixed(precision);
    var localId = this.byKey[vertexKey];
    if (localId == null) {
        localId = this.unique.length;
        this.unique.push(vertex);
        this.byKey[vertexKey] = localId;
    }
    return localId;
};

Vertices.prototype.getById = function (id) {
    return this.unique[id];
};
