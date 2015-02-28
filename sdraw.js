// Generated by CoffeeScript 1.7.1
var bgrect, body, candsearch, downpoint, downtime, draw, draw_mode, edit_mode, mode, modetimeout, moving, path, points, randomTimeout, recognition, resize, selected, selfunc, setTemplate, strokes, svg, timeseed,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

body = d3.select("body");

svg = d3.select("svg");

bgrect = svg.append('rect');

downpoint = null;

selected = [];

points = [];

strokes = [];

moving = false;

window.browserWidth = function() {
  return window.innerWidth || document.body.clientWidth;
};

window.browserHeight = function() {
  return window.innerHeight || document.body.clientHeight;
};

window.hypot = function(x, y) {
  return Math.sqrt(x * x + y * y);
};

window.dist = function(p1, p2) {
  return hypot(p1[0] - p2[0], p1[1] - p2[1]);
};

resize = function() {
  window.drawWidth = browserWidth() * 0.69;
  window.drawHeight = browserHeight();
  svg.attr({
    width: drawWidth,
    height: drawHeight
  }).style({
    'background-color': "#ffffff"
  });
  bgrect.attr({
    'x': 0,
    'y': 0,
    'width': window.drawWidth,
    'height': window.drawHeight,
    'fill': '#d0d0d0',
    'stroke': '#ffffff',
    'stroke-width': 0
  });
  $('#candidates').css('height', drawHeight / 2 - 30);
  return $('#suggestions').css('height', drawHeight / 2 - 30);
};

$(function() {
  resize();
  $(window).resize(resize);
  draw_mode();
  $.getJSON("kanji/kanji.json", function(data) {
    return window.kanjidata = data;
  });
  return $.getJSON("figures.json", function(data) {
    return window.figuredata = data;
  });
});

mode = 'draw';

$('#delete').on('click', function() {
  var element, _i, _len;
  for (_i = 0, _len = selected.length; _i < _len; _i++) {
    element = selected[_i];
    element.remove();
  }
  return selected = [];
});

$('#dup').on('click', function() {
  var attr, cloned, e, element, newselected, node_name, parent, x, y, _i, _j, _len, _len1;
  newselected = [];
  for (_i = 0, _len = selected.length; _i < _len; _i++) {
    element = selected[_i];
    attr = element.node().attributes;
    node_name = element.property("nodeName");
    parent = d3.select(element.node().parentNode);
    cloned = parent.append(node_name);
    x = 0.0;
    y = 0.0;
    for (_j = 0, _len1 = attr.length; _j < _len1; _j++) {
      e = attr[_j];
      cloned.attr(e.nodeName, e.value);
      if (e.nodeName === 'xx') {
        x = Number(e.value);
      }
      if (e.nodeName === 'yy') {
        y = Number(e.value);
      }
    }
    element.attr('stroke', 'blue');
    cloned.attr("xx", x + 30);
    cloned.attr("yy", y + 30);
    cloned.attr("transform", "translate(" + (x + 30) + "," + (y + 30) + ")");
    if (node_name === 'text') {
      cloned.text(element.text());
    }
    cloned.on('mousedown', function() {
      if (mode !== 'edit') {
        return;
      }
      downpoint = d3.mouse(this);
      return moving = true;
    });
    cloned.on('mousemove', selfunc(cloned));
    newselected.push(cloned);
  }
  return selected = newselected;
});

$('#repeat').on('click', function() {});

candsearch = function() {
  var query;
  query = $('#searchtext').val();
  if (query.length > 0) {
    return bing_search(query, function(data) {
      return data.map(function(url, i) {
        var cand, img;
        cand = $("#cand" + i);
        cand.children().remove();
        img = $("<img>");
        img.attr('class', 'candimage');
        img.attr('src', url);
        return cand.append(img);
      });
    });
  }
};

$('#searchbutton').on('click', candsearch);

$('#searchtext').on('keydown', function(e) {
  if (e.keyCode === 13) {
    return candsearch();
  }
});

window.line = d3.svg.line().interpolate('cardinal').x(function(d) {
  return d[0];
}).y(function(d) {
  return d[1];
});

window.template = svg.append("g");

window.drawline = function(x1, y1, x2, y2) {
  return template.append("polyline").attr({
    points: [[x1, y1], [x2, y2]],
    stroke: "#d0d0d0",
    fill: "none",
    "stroke-width": "3"
  });
};

timeseed = 0;

randomTimeout = null;

setTemplate = function(id, template) {
  d3.select("#" + id).on('click', function() {
    return template.draw();
  });
  d3.select("#" + id).on('mousedown', function() {
    d3.event.preventDefault();
    downpoint = d3.mouse(this);
    if (randomTimeout) {
      clearTimeout(randomTimeout);
    }
    return srand(timeseed);
  });
  d3.select("#" + id).on('mousemove', function() {
    var i, j, x, y, _ref;
    if (downpoint) {
      d3.event.preventDefault();
      _ref = d3.mouse(this), x = _ref[0], y = _ref[1];
      template.change(x - downpoint[0], y - downpoint[1]);
      i = Math.floor((x - downpoint[0]) / 10);
      j = Math.floor((y - downpoint[1]) / 10);
      return srand(timeseed + i * 100 + j);
    }
  });
  return d3.select("#" + id).on('mouseup', function() {
    return downpoint = null;
  });
};

setTemplate("template0", meshTemplate);

setTemplate("template1", parseTemplate);

setTemplate("template2", kareobanaTemplate);

setTemplate("template3", kareobanaTemplate3);

path = null;

draw = function() {
  return path.attr({
    d: line(points),
    stroke: 'blue',
    'stroke-width': 8,
    fill: "none"
  });
};

selfunc = function(element) {
  return function() {
    if (mode === 'edit') {
      if (!downpoint) {
        return;
      }
      element.attr("stroke", "yellow");
      if (__indexOf.call(selected, element) < 0) {
        return selected.push(element);
      }
    }
  };
};

modetimeout = null;

downtime = null;

draw_mode = function() {
  mode = 'draw';
  strokes = [];
  template.selectAll("*").remove();
  svg.selectAll("*").attr("stroke", 'blue');
  bgrect.attr("fill", "#ffffff");
  svg.on('mousedown', function() {
    d3.event.preventDefault();
    downpoint = d3.mouse(this);
    downtime = new Date();
    modetimeout = setTimeout(function() {
      selected = [];
      return edit_mode();
    }, 1000);
    path = svg.append('path');
    points = [downpoint];
    path.on('mousedown', function() {
      var attr, e, element, x, y, _i, _j, _len, _len1;
      if (mode !== 'edit') {
        return;
      }
      downpoint = d3.mouse(this);
      for (_i = 0, _len = selected.length; _i < _len; _i++) {
        element = selected[_i];
        attr = element.node().attributes;
        x = 0.0;
        y = 0.0;
        for (_j = 0, _len1 = attr.length; _j < _len1; _j++) {
          e = attr[_j];
          if (e.nodeName === 'xx') {
            x = Number(e.value);
          }
          if (e.nodeName === 'yy') {
            y = Number(e.value);
          }
        }
        element.attr("xx", x);
        element.attr("yy", y);
      }
      return moving = true;
    });
    path.on('mousemove', selfunc(path));
    return path.on('mouseup', function() {});
  });
  svg.on('mouseup', function() {
    var uppoint, uptime;
    if (!downpoint) {
      return;
    }
    d3.event.preventDefault();
    uppoint = d3.mouse(this);
    uptime = new Date();
    clearTimeout(modetimeout);
    points.push(uppoint);
    draw();
    strokes.push([downpoint, uppoint]);
    downpoint = null;
    moving = false;
    return recognition();
  });
  return svg.on('mousemove', function() {
    var movepoint;
    if (!downpoint) {
      return;
    }
    movepoint = d3.mouse(this);
    if (dist(movepoint, downpoint) > 20.0) {
      clearTimeout(modetimeout);
    }
    d3.event.preventDefault();
    points.push(movepoint);
    return draw();
  });
};

edit_mode = function() {
  mode = 'edit';
  template.selectAll("*").remove();
  bgrect.attr("fill", "#e0e0e0");
  svg.on('mousedown', function() {
    d3.event.preventDefault();
    downpoint = d3.mouse(this);
    return downtime = new Date();
  });
  svg.on('mousemove', function() {
    var attr, e, element, movepoint, x, y, _i, _j, _len, _len1, _results;
    if (!downpoint) {
      return;
    }
    if (!moving) {
      return;
    }
    movepoint = d3.mouse(this);
    if (dist(movepoint, downpoint) > 20.0) {
      clearTimeout(modetimeout);
    }
    $('#searchtext').val("move-move selected = " + selected.length);
    _results = [];
    for (_i = 0, _len = selected.length; _i < _len; _i++) {
      element = selected[_i];
      attr = element.node().attributes;
      x = 0.0;
      y = 0.0;
      for (_j = 0, _len1 = attr.length; _j < _len1; _j++) {
        e = attr[_j];
        if (e.nodeName === 'xx') {
          x = Number(e.value);
        }
        if (e.nodeName === 'yy') {
          y = Number(e.value);
        }
      }
      _results.push(element.attr("transform", "translate(" + (x + movepoint[0] - downpoint[0]) + "," + (y + movepoint[1] - downpoint[1]) + ")"));
    }
    return _results;
  });
  return svg.on('mouseup', function() {
    var attr, e, element, uppoint, uptime, x, y, _i, _j, _k, _len, _len1, _len2;
    if (!downpoint) {
      return;
    }
    d3.event.preventDefault();
    uppoint = d3.mouse(this);
    if (moving) {
      for (_i = 0, _len = selected.length; _i < _len; _i++) {
        element = selected[_i];
        attr = element.node().attributes;
        x = 0.0;
        y = 0.0;
        for (_j = 0, _len1 = attr.length; _j < _len1; _j++) {
          e = attr[_j];
          if (e.nodeName === 'xx') {
            x = Number(e.value);
          }
          if (e.nodeName === 'yy') {
            y = Number(e.value);
          }
        }
        element.attr('xx', x + uppoint[0] - downpoint[0]);
        element.attr('yy', y + uppoint[1] - downpoint[1]);
      }
    }
    downpoint = null;
    moving = false;
    uptime = new Date();
    if (uptime - downtime < 300) {
      if (selected.length === 0) {
        selected = [];
        strokes = [];
        return draw_mode();
      } else {
        for (_k = 0, _len2 = selected.length; _k < _len2; _k++) {
          element = selected[_k];
          element.attr("stroke", "blue");
        }
        return selected = [];
      }
    }
  });
};

recognition = function() {
  var cands, data, entry, height, kanji_strokes, kstrokes, maxx, maxy, minx, miny, normalized_strokes, nstrokes, size, stroke, totaldist, width, x0, x1, y0, y1, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _n, _o, _ref, _ref1, _ref2, _results, _results1, _results2;
  nstrokes = strokes.length;
  _ref = [1000, 1000, 0, 0], minx = _ref[0], miny = _ref[1], maxx = _ref[2], maxy = _ref[3];
  for (_i = 0, _len = strokes.length; _i < _len; _i++) {
    stroke = strokes[_i];
    minx = Math.min(minx, stroke[0][0]);
    maxx = Math.max(maxx, stroke[0][0]);
    minx = Math.min(minx, stroke[1][0]);
    maxx = Math.max(maxx, stroke[1][0]);
    miny = Math.min(miny, stroke[0][1]);
    maxy = Math.max(maxy, stroke[0][1]);
    miny = Math.min(miny, stroke[1][1]);
    maxy = Math.max(maxy, stroke[1][1]);
  }
  width = maxx - minx;
  height = maxy - miny;
  size = Math.max(width, height);
  normalized_strokes = [];
  for (_j = 0, _len1 = strokes.length; _j < _len1; _j++) {
    stroke = strokes[_j];
    x0 = (stroke[0][0] - minx) * 1000.0 / size;
    y0 = (stroke[0][1] - miny) * 1000.0 / size;
    x1 = (stroke[1][0] - minx) * 1000.0 / size;
    y1 = (stroke[1][1] - miny) * 1000.0 / size;
    normalized_strokes.push([[x0, y0], [x1, y1]]);
  }
  cands = [];
  _ref1 = [window.kanjidata, window.figuredata];
  for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
    data = _ref1[_k];
    for (_l = 0, _len3 = data.length; _l < _len3; _l++) {
      entry = data[_l];
      kstrokes = entry.strokes;
      if (kstrokes.length < nstrokes) {
        continue;
      }
      _ref2 = [1000, 1000, 0, 0], minx = _ref2[0], miny = _ref2[1], maxx = _ref2[2], maxy = _ref2[3];
      (function() {
        _results = [];
        for (var _m = 0; 0 <= nstrokes ? _m < nstrokes : _m > nstrokes; 0 <= nstrokes ? _m++ : _m--){ _results.push(_m); }
        return _results;
      }).apply(this).forEach(function(i) {
        points = kstrokes[i];
        stroke = [];
        stroke[0] = points[0];
        stroke[1] = points[points.length - 1];
        minx = Math.min(minx, stroke[0][0]);
        maxx = Math.max(maxx, stroke[0][0]);
        minx = Math.min(minx, stroke[1][0]);
        maxx = Math.max(maxx, stroke[1][0]);
        miny = Math.min(miny, stroke[0][1]);
        maxy = Math.max(maxy, stroke[0][1]);
        miny = Math.min(miny, stroke[1][1]);
        return maxy = Math.max(maxy, stroke[1][1]);
      });
      width = maxx - minx;
      height = maxy - miny;
      size = Math.max(width, height);
      kanji_strokes = [];
      (function() {
        _results1 = [];
        for (var _n = 0; 0 <= nstrokes ? _n < nstrokes : _n > nstrokes; 0 <= nstrokes ? _n++ : _n--){ _results1.push(_n); }
        return _results1;
      }).apply(this).forEach(function(i) {
        points = kstrokes[i];
        stroke = [];
        stroke[0] = points[0];
        stroke[1] = points[points.length - 1];
        x0 = (stroke[0][0] - minx) * 1000.0 / size;
        y0 = (stroke[0][1] - miny) * 1000.0 / size;
        x1 = (stroke[1][0] - minx) * 1000.0 / size;
        y1 = (stroke[1][1] - miny) * 1000.0 / size;
        return kanji_strokes.push([[x0, y0], [x1, y1]]);
      });
      totaldist = 0.0;
      (function() {
        _results2 = [];
        for (var _o = 0; 0 <= nstrokes ? _o < nstrokes : _o > nstrokes; 0 <= nstrokes ? _o++ : _o--){ _results2.push(_o); }
        return _results2;
      }).apply(this).forEach(function(i) {
        var dx, dy;
        dx = kanji_strokes[i][0][0] - normalized_strokes[i][0][0];
        dy = kanji_strokes[i][0][1] - normalized_strokes[i][0][1];
        totaldist += hypot(dx, dy);
        dx = kanji_strokes[i][1][0] - normalized_strokes[i][1][0];
        dy = kanji_strokes[i][1][1] - normalized_strokes[i][1][1];
        return totaldist += hypot(dx, dy);
      });
      cands.push([entry, totaldist]);
    }
  }
  cands = cands.sort(function(a, b) {
    return a[1] - b[1];
  });
  return [0, 1, 2, 3, 4, 5].forEach(function(i) {
    var cand, candelement, candsvg;
    cand = cands[i][0];
    candsvg = d3.select("#cand" + i);
    candsvg.selectAll("*").remove();
    candelement = candsvg.append(cand.type);
    candelement.attr(cand.attr);
    if (cand.text) {
      candelement.text(cand.text);
    }
    candelement.on('mousedown', function() {
      var attr, copied_element, target, _len4, _p, _ref3;
      d3.event.preventDefault();
      downpoint = d3.mouse(this);
      strokes = [];
      target = d3.event.target;
      copied_element = svg.append(target.nodeName);
      _ref3 = target.attributes;
      for (_p = 0, _len4 = _ref3.length; _p < _len4; _p++) {
        attr = _ref3[_p];
        copied_element.attr(attr.nodeName, attr.value);
      }
      if (target.innerHTML) {
        copied_element.text(target.innerHTML);
      }
      copied_element.on('mousemove', selfunc(copied_element));
      return copied_element.on('mousedown', function() {
        return moving = true;
      });
    });
    return candelement.on('mouseup', function() {
      if (!downpoint) {
        return;
      }
      d3.event.preventDefault();
      return downpoint = null;
    });
  });
};
