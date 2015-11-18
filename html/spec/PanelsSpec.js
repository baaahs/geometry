describe("Panels", function () {
        var panels;
        var panelFixture;

        beforeEach(function () {
            panels = new Panels();

            panelFixture = {};
            panelFixture['1D'] = function() { var g = new THREE.Geometry(); g.vertices = [new THREE.Vector3(39,119,152),new THREE.Vector3(17,161,128),new THREE.Vector3(-1,91,117)]; g.faces = [new THREE.Face3(0,1,2)]; return new Panel({ name: '1D', geometry: g, material: {} }, null); }();
            panelFixture['2D'] = function() { var g = new THREE.Geometry(); g.vertices = [new THREE.Vector3(39,119,152),new THREE.Vector3(-1,91,117),new THREE.Vector3(36,75,152)]; g.faces = [new THREE.Face3(0,1,2)]; return new Panel({ name: '2D', geometry: g, material: {} }, null); }();
            panelFixture['3D'] = function() { var g = new THREE.Geometry(); g.vertices = [new THREE.Vector3(-1,91,117),new THREE.Vector3(33,18,128),new THREE.Vector3(36,75,152)]; g.faces = [new THREE.Face3(0,1,2)]; return new Panel({ name: '3D', geometry: g, material: {} }, null); }();
            panelFixture['5D'] = function() { var g = new THREE.Geometry(); g.vertices = [new THREE.Vector3(86,185,116),new THREE.Vector3(17,161,128),new THREE.Vector3(39,119,152)]; g.faces = [new THREE.Face3(0,1,2)]; return new Panel({ name: '5D', geometry: g, material: {} }, null); }();
            panelFixture['6D'] = function() { var g = new THREE.Geometry(); g.vertices = [new THREE.Vector3(86,185,116),new THREE.Vector3(39,119,152),new THREE.Vector3(76,127,152)]; g.faces = [new THREE.Face3(0,1,2)]; return new Panel({ name: '6D', geometry: g, material: {} }, null); }();
            panelFixture['7D'] = function() { var g = new THREE.Geometry(); g.vertices = [new THREE.Vector3(109,95,152),new THREE.Vector3(39,119,152),new THREE.Vector3(36,75,152),new THREE.Vector3(39,119,152),new THREE.Vector3(109,95,152),new THREE.Vector3(76,127,152)]; g.faces = [new THREE.Face3(0,1,2),new THREE.Face3(3,4,5)]; return new Panel({ name: '7D', geometry: g, material: {} }, null); }();
            panelFixture['8D'] = function() { var g = new THREE.Geometry(); g.vertices = [new THREE.Vector3(109,95,152),new THREE.Vector3(36,75,152),new THREE.Vector3(56,26,140),new THREE.Vector3(56,26,140),new THREE.Vector3(36,75,152),new THREE.Vector3(33,18,128)]; g.faces = [new THREE.Face3(0,1,2),new THREE.Face3(3,4,5)]; return new Panel({ name: '8D', geometry: g, material: {} }, null); }();
            panelFixture['10D'] = function() { var g = new THREE.Geometry(); g.vertices = [new THREE.Vector3(56,26,140),new THREE.Vector3(33,18,128),new THREE.Vector3(42,1,120),new THREE.Vector3(75,1,120),new THREE.Vector3(56,26,140),new THREE.Vector3(42,1,120),new THREE.Vector3(87,22,128),new THREE.Vector3(56,26,140),new THREE.Vector3(75,1,120)]; g.faces = [new THREE.Face3(0,1,2),new THREE.Face3(3,4,5),new THREE.Face3(6,7,8)]; return new Panel({ name: '10D', geometry: g, material: {} }, null); }();
            panelFixture['12D'] = function() { var g = new THREE.Geometry(); g.vertices = [new THREE.Vector3(109,163,140),new THREE.Vector3(86,185,116),new THREE.Vector3(76,127,152)]; g.faces = [new THREE.Face3(0,1,2)]; return new Panel({ name: '12D', geometry: g, material: {} }, null); }();
            panelFixture['13D'] = function() { var g = new THREE.Geometry(); g.vertices = [new THREE.Vector3(109,163,140),new THREE.Vector3(76,127,152),new THREE.Vector3(109,95,152)]; g.faces = [new THREE.Face3(0,1,2)]; return new Panel({ name: '13D', geometry: g, material: {} }, null); }();
            panelFixture['9D'] = function() { var g = new THREE.Geometry(); g.vertices = [new THREE.Vector3(109,95,152),new THREE.Vector3(56,26,140),new THREE.Vector3(87,22,128)]; g.faces = [new THREE.Face3(0,1,2)]; return new Panel({ name: '9D', geometry: g, material: {} }, null); }();
        });

        describe("edge calculation", function () {
            beforeEach(function () {
                Object.keys(panelFixture).forEach(function (key) {
                    panels.add(panelFixture[key]);
                });
            });

            it("calculates panel outer edges", function () {
                function x() {
                    var g = new THREE.Geometry();
                    g.vertices = [new THREE.Vector3(109, 95, 152), new THREE.Vector3(39, 119, 152), new THREE.Vector3(36, 75, 152), new THREE.Vector3(39, 119, 152), new THREE.Vector3(109, 95, 152), new THREE.Vector3(76, 127, 152)];
                    g.faces = [new THREE.Face3(0, 1, 2), new THREE.Face3(3, 4, 5)];
                    return new Panel({name: '7D', geometry: g, material: {}}, null);
                }

                var edges = panelFixture['7D'].edges(panels);
                var vertices = edges.map(function (edge) {
                    return [[edge.v1.x, edge.v1.y, edge.v1.z], [edge.v2.x, edge.v2.y, edge.v2.z]];
                });

                expect(vertices).toEqual([
                        [[39, 119, 152], [36, 75, 152]],
                        [[36, 75, 152], [109, 95, 152]],
                        [[109, 95, 152], [76, 127, 152]],
                        [[76, 127, 152], [39, 119, 152]]
                    ]);

                expect(edges.map(function (edge) {
                    return edge.otherPanel.name;
                })).toEqual(['2D', '8D', '13D', '6D']);
            });
        });
    }
);