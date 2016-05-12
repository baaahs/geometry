function LabelViewer(panels, container) {
    this.panels = panels;
    this.container = container;
    this.labels = [];
    this.labelPerDistance = 0;

    this.draw();
}

LabelViewer.prototype.draw = function () {
    this.container.innerHTML = '';
    this.panels.all().forEach(function (panel) {
        //if (panel.name == '7P') {
        panel.edges().forEach(function(edge) {
            var count = this.labelPerDistance == 0 ? 1 : Math.ceil(edge.length() / this.labelPerDistance);
            if (count < 1) count = 1;

            for (var i = 0; i < count; i++) {
                var label = new Label(edge);
                this.labels.push(label);
                this.container.appendChild(label.dom);
            }
        }.bind(this));
        //}
    }.bind(this));
};

LabelViewer.prototype.filterLabels = function(re) {
    this.labels.forEach(function(label) {
        var matchesPanel = re.test(label.panel.name);
        label.dom.classList.toggle('invisible', !matchesPanel);
    });
};

LabelViewer.prototype.labelsEvery = function(distance) {
    this.labelPerDistance = distance;
    this.draw();
};

function Label(edge) {
    this.edge = edge;
    this.panel = edge.panel;
    var angle = edge.angle();

    var upperEdge = false;

    this.dom = this.createDiv('label');

    //var borderLeft = this.createDiv('label-border-left');
    //borderLeft.innerText = "x: 14'4 1/2\"\n" +
    //    "y:  7'11 3/8\"\n" +
    //    "z:  4' 3 1/3\"";
    //this.dom.appendChild(borderLeft);

    var nameDiv = this.createDiv('name');
    var re = this.panel.name.match(/^(.+?)([DP]?)$/);
    var nameClass = 'name' + this.panel.name.length;
    var side = re[2];
    this.dom.classList.add('side-' + side.toLowerCase());
    nameDiv.innerHTML = '<div class="name ' + nameClass + '">' + re[1] + '<span class="side">' + side + '</span></div>';
    if (this.panel.info) {
        var sectionClass = 'section';
        if (this.panel.info.section.length > 10) {
            sectionClass = 'section section10';
        } else if (this.panel.info.section.length > 6) {
            sectionClass = 'section section8';
        }
      nameDiv.innerHTML += '<div class="' + sectionClass + '">(' + this.panel.info.section + ')</div>';
    }

    nameDiv.style.transform = 'rotate(' + angle + 'deg)';

    // show label rotated:
    var isUpsideDownsy = angle > 90 || angle < -90;
    if (false) {
        this.dom.style.transform = 'rotate(' + (0 - angle) + 'deg)';
    } else if (isUpsideDownsy) {
        // make text be printed right-side-up…
        this.dom.style.transform = 'rotate(180deg)';
    }

    if (edge.otherPanel && edge.otherPanel.isPanel()) {
        var otherPanelName = edge.otherPanel ? edge.otherPanel.name : '';
        var otherPanelDiv = this.createDiv('other', otherPanelName);
        if (!upperEdge) otherPanelDiv.classList.add('lower');
        otherPanelDiv.style.transform = 'rotate(' + angle + 'deg)';
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
    upDiv.style.transform = 'rotate(' + angle + 'deg)';
    this.dom.appendChild(upDiv);

    var logo = document.createElement('img');
    logo.classList.add('logo');
    logo.src = 'BAAAHS2015LogoWithBorder-320x272.png';
    logo.style.transform = 'rotate(' + angle + 'deg)';
    this.dom.appendChild(logo);

    var edgeLength = MeasurementUtils.toPrettyFeetAndInches(edge.length());
    var edgeLengthDiv = this.createDiv('edge-length', "⇤ " + edgeLength + " ⇥");
    if (isUpsideDownsy) {
        // make text be printed right-side-up…
        edgeLengthDiv.style.transform = 'rotate(180deg)';
    }
    this.dom.appendChild(edgeLengthDiv);

    var outerCircle = this.createDiv('circle');
    outerCircle.classList.add('outer');
    this.dom.appendChild(outerCircle);

    var innerCircle = this.createDiv('circle');
    innerCircle.classList.add('inner');
    innerCircle.style.backgroundColor = '#' + this.panel.color.getHexString();
    this.dom.appendChild(innerCircle);
}

Label.prototype.createDiv = function (clazz, innerText) {
    var div = document.createElement('div');
    div.classList.add(clazz);
    if (innerText != null) {
        div.innerText = innerText;
    }
    return div;
};