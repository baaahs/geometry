function LabelViewer(panels, container) {
    this.panels = panels;
    this.container = container;
    this.labels = [];
    this.labelPerDistance = 0;
}

LabelViewer.prototype.qrCodes = function (start, end) {
    this.qrCodes = [start, end];
    this.labels = [];
    for (var i = start; i < end; i += 3) {
        var qrLabel = new QrLabel(i);
        qrLabel.visible = true;
        this.labels.push(qrLabel);
    }

    this.layoutLabels();
};

LabelViewer.prototype.generateLabels = function () {
    this.labels = [];
    this.panels.all().forEach(function (panel) {
        //if (panel.name == '7P') {
        panel.edges().forEach(function(edge) {
            var count = this.labelPerDistance == 0 ? 1 : Math.ceil(edge.length() / this.labelPerDistance);
            if (count < 1) count = 1;

            for (var i = 0; i < count; i++) {
                var label = new Label(edge);
                this.labels.push(label);
            }
        }.bind(this));
        //}
    }.bind(this));
};

LabelViewer.prototype.layoutLabels = function() {
    var i = 0;
    var tr = null;
    this.container.innerHTML = '';
    this.labels.forEach(function(label) {
        if (label.visible) {
            if (i % 2 == 0) {
                this.container.appendChild(tr = document.createElement("tr"))
            } else {
                var spacer = document.createElement("td");
                spacer.classList.add("column-spacer");
                tr.appendChild(spacer)
            }
            tr.appendChild(label.dom);
            i++;
        }
    }.bind(this));
};

LabelViewer.prototype.filterLabels = function(re) {
    this.labels.forEach(function(label) {
        label.visible = re.test(label.panel.name);
    });
    this.countLabels();
    this.layoutLabels();
};

LabelViewer.prototype.labelsEvery = function(distance) {
    this.labelPerDistance = distance;
    this.generateLabels();
    this.countLabels();
    this.layoutLabels();
};

LabelViewer.prototype.countLabels = function(distance) {
    var count = 0;
    this.labels.forEach(function (label) {
        if (label.visible) count++;
    });
    document.getElementById("label-count").innerText = count == 0 ? "No labels" : count + " labels";
};

function Label(edge) {
    this.edge = edge;
    this.panel = edge.panel;
    var angle = edge.angle();

    var derotate = false;
    var upperEdge = true;

    this.dom = this.createDiv('label');
    this.isVisible_ = true;

    var nameDiv = this.createDiv('name');
    var re = this.panel.name.match(/^([FR]?)(.+?)([DP]?)$/);
    var nameClass = 'name' + this.panel.name.length;
    var frontOrRear = re[1];
    var panelNumber = re[2];
    var side = re[3];
    this.dom.classList.add('side-' + side.toLowerCase());
    nameDiv.innerHTML = '<div class="name ' + nameClass + '"><span class="side">' + frontOrRear + '</span>' + panelNumber + '<span class="side">' + side + '</span></div>';
    if (this.panel.info) {
        var sectionClass = 'section';
        if (this.panel.info.section.length > 10) {
            sectionClass = 'section section10';
        } else if (this.panel.info.section.length > 6) {
            sectionClass = 'section section8';
        }
      nameDiv.innerHTML += '<div class="' + sectionClass + '">(' + this.panel.info.section + ')</div>';
    }

    // show label rotated:
    var isUpsideDownsy = angle > 90 && angle < 270;
    var upAngle = angle;

    nameDiv.style.transform = 'rotate(' + upAngle + 'deg)';

    // if (angle >= 180) {
    //     angle -= 180;
    //     isUpsideDownsy = !isUpsideDownsy;
    // } else if (angle <= -180) {
    //     angle += 180;
    //     isUpsideDownsy = !isUpsideDownsy;
    // }

    if (derotate) {
        this.dom.style.transform = 'rotate(' + upAngle + 'deg)';
    } else if (isUpsideDownsy) {
        // make text be printed right-side-up…
        this.dom.classList.add('flipped');
    }

    if (edge.otherPanel && edge.otherPanel.isPanel()) {
        var otherPanelName = edge.otherPanel ? edge.otherPanel.name : '';
        var otherPanelDiv = this.createDiv('other', otherPanelName);
        if (!upperEdge) otherPanelDiv.classList.add('lower');
        otherPanelDiv.style.transform = 'rotate(' + upAngle + 'deg)';
        this.dom.appendChild(otherPanelDiv);

        var otherArrowPanelDiv = this.createDiv('other-arrow');
        if (upperEdge) {
            otherArrowPanelDiv.innerText = '⇧';
        } else {
            otherArrowPanelDiv.innerText = '⇩';
            otherArrowPanelDiv.classList.add('lower');
        }
        this.dom.appendChild(otherArrowPanelDiv);
    }

    this.dom.appendChild(nameDiv);

    var upDiv = this.createDiv('up');
    upDiv.innerHTML = '↑<div class="u">U</div><div class="p">P</div>';
    upDiv.style.transform = 'rotate(' + upAngle + 'deg)';
    this.dom.appendChild(upDiv);

    var logo = document.createElement('img');
    logo.classList.add('logo');
    logo.src = 'BAAAHS2015LogoWithBorder-320x272.png';
    logo.style.transform = 'rotate(' + upAngle + 'deg)';
    this.dom.appendChild(logo);

    var edgeLength = MeasurementUtils.toPrettyFeetAndInches(edge.compoundLength());
    var edgeLengthDiv = this.createDiv('edge-length', "⇤ " + edgeLength + " ⇥ • Panel " + this.panel.name + " • " + angle.toFixed(0) + "°");
    console.log(edge.panel.name, "neighbor: " + (edge.otherPanel ? edge.otherPanel.name : "none"), "angle: ", angle, isUpsideDownsy);
    if (isUpsideDownsy) {
        // make text be printed right-side-up…
        edgeLengthDiv.style.transform = 'rotate(180deg)';
    }
    this.dom.appendChild(edgeLengthDiv);

    function vertexPositionNice(length) {
        var str = MeasurementUtils.toPrettyFeetAndInches(length);
        return str.indexOf("'") == 1 ? " " + str : str;
    }

    // sheep model is off center, sorry
    var globalOffset = new THREE.Vector3(0, 0, -45.5);

    function vertexPosition(vertex) {
        var loc = edge.panel.mesh.position.clone();
        loc.add(vertex);
        loc.add(globalOffset);
        return "x: " + vertexPositionNice(loc.x) + "\n" +
            "y: " + vertexPositionNice(loc.y) + "\n" +
            "z: " + vertexPositionNice(loc.z);
    }

    this.dom.appendChild(this.createDiv('label-vertex left', vertexPosition(edge.v1)));
    this.dom.appendChild(this.createDiv('label-vertex right', vertexPosition(edge.v2)));

    var outerCircle = this.createDiv('circle');
    outerCircle.classList.add('outer');
    this.dom.appendChild(outerCircle);

    var innerCircle = this.createDiv('circle');
    innerCircle.classList.add('inner');
    innerCircle.style.backgroundColor = '#' + this.panel.color.getHexString();
    this.dom.appendChild(innerCircle);

    var qrCode = document.createElement('img');
    qrCode.classList.add("qr-code");
    var url = encodeURIComponent("http://baaahs.org/a/" + edge.panel.name);
    // var url = encodeURIComponent("http://192.168.1.150:9292/a/" + edge.panel.name);
    qrCode.setAttribute("src", "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + url);
    this.dom.appendChild(qrCode);

    this.dom.appendChild(this.createDiv('fold-line'));
    this.dom.appendChild(this.createDiv('outline'));
}

Label.prototype.createDiv = function (clazz, innerText) {
    var div = document.createElement('div');
    clazz.split(" ").forEach(function (className) { div.classList.add(className); });
    if (innerText != null) {
        div.innerText = innerText;
    }
    return div;
};

function QrLabel(number) {
    this.dom = this.createDiv('qr-label');
    this.isVisible_ = true;

    // this.dom.appendChild(this.createDiv('name', '' + number));

    for (var i = 0; i < 3; i++) {
        var stickerNumber = number + i;
        var sticker = this.createDiv("sticker");
        sticker.classList.add("sticker" + i);
        this.dom.appendChild(sticker);

        sticker.appendChild(this.createDiv('name', '' + stickerNumber));
        // sticker.appendChild(this.createDiv('url', '' + assetUrl));

        var logo = document.createElement('img');
        logo.classList.add('logo');
        logo.src = 'BAAAHS2015LogoWithBorder-320x272.png';
        // logo.style.transform = 'rotate(' + upAngle + 'deg)';
        sticker.appendChild(logo);

        var qrCode = document.createElement('img');
        qrCode.classList.add("qr-code");
        var assetUrl = "http://baaahs.org/a/" + stickerNumber;
        var url = encodeURIComponent(assetUrl);
        // var url = encodeURIComponent("http://192.168.1.150:9292/a/" + edge.panel.name);
        qrCode.setAttribute("src", "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + url);
        sticker.appendChild(qrCode);
    }
}

QrLabel.prototype.createDiv = function (clazz, innerText) {
    var div = document.createElement('div');
    clazz.split(" ").forEach(function (className) { div.classList.add(className); });
    if (innerText != null) {
        div.innerText = innerText;
    }
    return div;
};

Object.defineProperty(Label.prototype, "visible", {
    get: function() {
        return this.isVisible_;
    },

    set: function(isVisible) {
        this.isVisible_ = isVisible;
        this.dom.classList.toggle('invisible', !isVisible);
    }
});