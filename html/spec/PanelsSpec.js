describe("Panels", function () {
        var panels;
        var panelFixture;

        function buildFixturePanel(name, vertices, faces) {
            var g = new THREE.Geometry();
            g.vertices = vertices.map(function (vertex) {
                return new THREE.Vector3(vertex[0], vertex[1], vertex[2]);
            });
            g.faces = faces.map(function (face) {
                return new THREE.Face3(face[0], face[1], face[2]);
            });
            return new Panel({name: name, geometry: g, material: {}, position: new THREE.Vector3()}, null);
        }

        beforeEach(function () {
            panels = new Panels();

            panelFixture = {};
            panelFixture['1D'] = buildFixturePanel('1D', [[39, 119, 152], [17, 161, 128], [-1, 91, 117]], [[0, 1, 2]]);
            panelFixture['2D'] = buildFixturePanel('2D', [[39, 119, 152], [-1, 91, 117], [36, 75, 152]], [[0, 1, 2]]);
            panelFixture['3D'] = buildFixturePanel('3D', [[-1, 91, 117], [33, 18, 128], [36, 75, 152]], [[0, 1, 2]]);
            panelFixture['5D'] = buildFixturePanel('5D', [[86, 185, 116], [17, 161, 128], [39, 119, 152]], [[0, 1, 2]]);
            panelFixture['6D'] = buildFixturePanel('6D', [[86, 185, 116], [39, 119, 152], [76, 127, 152]], [[0, 1, 2]]);
            panelFixture['7D'] = buildFixturePanel('7D', [[109, 95, 152], [39, 119, 152], [36, 75, 152], [39, 119, 152], [109, 95, 152], [76, 127, 152]], [[0, 1, 2], [3, 4, 5]]);
            panelFixture['8D'] = buildFixturePanel('8D', [[109, 95, 152], [36, 75, 152], [56, 26, 140], [56, 26, 140], [36, 75, 152], [33, 18, 128]], [[0, 1, 2], [3, 4, 5]]);
            panelFixture['9D'] = buildFixturePanel('9D', [[109, 95, 152], [56, 26, 140], [87, 22, 128]], [[0, 1, 2]]);
            panelFixture['10D'] = buildFixturePanel('10D', [[56, 26, 140], [33, 18, 128], [42, 1, 120], [75, 1, 120], [56, 26, 140], [42, 1, 120], [87, 22, 128], [56, 26, 140], [75, 1, 120]], [[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
            panelFixture['11D'] = buildFixturePanel('11D', [[109, 163, 140], [122, 177, 116], [86, 185, 116]], [[0, 1, 2]]);
            panelFixture['12D'] = buildFixturePanel('12D', [[109, 163, 140], [86, 185, 116], [76, 127, 152]], [[0, 1, 2]]);
            panelFixture['13D'] = buildFixturePanel('13D', [[109, 163, 140], [76, 127, 152], [109, 95, 152]], [[0, 1, 2]]);
            panelFixture['14D'] = buildFixturePanel('14D', [[146, 13, 120], [109, 95, 152], [87, 22, 128]], [[0, 1, 2]]);
            panelFixture['15D'] = buildFixturePanel('15D', [[158, 138, 140], [109, 163, 140], [156, 111, 152], [158, 138, 140], [122, 177, 116], [109, 163, 140]], [[0, 1, 2], [3, 4, 5]]);
            panelFixture['16D'] = buildFixturePanel('16D', [[156, 111, 152], [109, 163, 140], [109, 95, 152]], [[0, 1, 2]]);
            panelFixture['17D'] = buildFixturePanel('17D', [[190,68,152],[156,111,152],[109,95,152]], [[0,1,2]]);
            panelFixture['18D'] = buildFixturePanel('18D', [[190, 68, 152], [109, 95, 152], [146, 13, 120]], [[0, 1, 2]]);
            panelFixture['20D'] = buildFixturePanel('20D', [[250, 144, 128], [158, 138, 140], [156, 111, 152]], [[0, 1, 2]]);
            panelFixture['21D'] = buildFixturePanel('21D', [[12, 9, 0], [15, 5, 0], [17, 7, 1], [19, 9, 2], [21, 11, 3]], [[0, 1, 2], [0, 2, 3], [0, 3, 4]]);
            panelFixture['23D'] = buildFixturePanel('23D', [[215,27,116],[190,68,152],[146,13,120]], [[0,1,2]]);
        });


        function vertices(edges) {
            return edges.map(function (edge) {
                return [[edge.v1.x, edge.v1.y, edge.v1.z], [edge.v2.x, edge.v2.y, edge.v2.z]];
            });
        }

        function edgeAngles(edges) {
            return edges.map(function (edge) {
                return (edge.otherPanel ? edge.otherPanel.name : "?") + " @ " + edge.angle().toFixed(0) + "°";
            });
        }

        describe("edge calculation", function () {
            beforeEach(function () {
                Object.keys(panelFixture).forEach(function (key) {
                    panels.add(panelFixture[key]);
                });
            });

            it("calculates neighboring panel for each edge", function () {
                var edges = panelFixture['6D'].edges(panels);
                console.log(edges);
            });

            it("calculates length edge", function () {
                var edges = panelFixture['6D'].edges(panels);
                expect(edges.map(function (edge) {
                    return edge.otherPanel.name + " @ " + MeasurementUtils.toPrettyFeetAndInches(edge.length());
                })).toEqual(["12D @ 5'9\"", "7D @ 3'2\"", "5D @ 7'5\""]);
            });

            it("calculates panel outer edges for 6D", function () {
                var edges = panelFixture['6D'].edges(panels);
                expect(vertices(edges)).toEqual([
                    [[86, 185, 116], [76, 127, 152]],
                    [[76, 127, 152], [39, 119, 152]],
                    [[39, 119, 152], [86, 185, 116]]
                ]);

                expect(edgeAngles(edges)).toEqual(['12D @ 95°', '7D @ 168°', '5D @ 303°']);
            });

            it("calculates panel outer edges for 7D", function () {
                var edges = panelFixture['7D'].edges(panels);

                expect(vertices(edges)).toEqual([
                    [[39, 119, 152], [76, 127, 152]],
                    [[76, 127, 152], [109, 95, 152]],
                    [[109, 95, 152], [36, 75, 152]],
                    [[36, 75, 152], [39, 119, 152]]
                ]);

                expect(edgeAngles(edges)).toEqual(['6D @ 348°', '13D @ 44°', '8D @ 165°', '2D @ 274°']);
            });

            it("calculates panel outer edges for 9D", function () {
                var edges = panelFixture['9D'].edges(panels);

                expect(vertices(edges)).toEqual([
                    [[109, 95, 152], [56, 26, 140]],
                    [[56, 26, 140], [87, 22, 128]],
                    [[87, 22, 128], [109, 95, 152]]
                ]);

                expect(edgeAngles(edges)).toEqual(['8D @ 304°', '10D @ 187°', '14D @ 101°']);
            });

            it("calculates panel outer edges for 14D", function () {
                var edges = panelFixture['14D'].edges(panels);

                expect(vertices(edges)).toEqual([
                    [[146, 13, 120], [109, 95, 152]],
                    [[109, 95, 152], [87, 22, 128]],
                    [[87, 22, 128], [146, 13, 120]]
                ]);

                expect(edgeAngles(edges)).toEqual(['18D @ 64°', '9D @ 285°', '? @ 189°']);
            });

            it("calculates panel outer edges for 15D", function () {
                var edges = panelFixture['15D'].edges(panels);
                expect(edgeAngles(edges)).toEqual(['16D @ 52°', '20D @ 282°', '? @ 236°', '11D @ 145°']);
            });

            it("calculates panel outer edges for 18D", function () {
                var edges = panelFixture['18D'].edges(panels);

                expect(vertices(edges)).toEqual([
                    [[190, 68, 152], [109, 95, 152]],
                    [[109, 95, 152], [146, 13, 120]],
                    [[146, 13, 120], [190, 68, 152]]
                ]);

                expect(edgeAngles(edges)).toEqual(['17D @ 19°', '14D @ 249°', '23D @ 131°']);
            });

            xit("calculates compound edge length for 21D", function () {
                var edges = panelFixture['21D'].edges(panels);

                expect(vertices(edges)).toEqual([
                    [[86, 185, 116], [76, 127, 152]],
                    [[76, 127, 152], [39, 119, 152]],
                    [[39, 119, 152], [86, 185, 116]]
                ]);

                expect(edges.map(function (edge) {
                    return MeasurementUtils.toPrettyFeetAndInches(edge.length()) + " @ " + edge.angle().toFixed(0) + "°";
                })).toEqual(['12D @ 95°', '7D @ 168°', '5D @ -57°']);

                expect(edges.map(function (edge) {
                    return "edge " + MeasurementUtils.toPrettyFeetAndInches(edge.length())
                        + " compound " + MeasurementUtils.toPrettyFeetAndInches(edge.compoundLength());
                })).toEqual(['12D @ 95°', '7D @ 168°', '5D @ -57°']);
            });
        });
    }
)
;