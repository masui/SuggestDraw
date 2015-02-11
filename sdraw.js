// Generated by CoffeeScript 1.7.1
var body, candsearch, downpoint, draw, draw_mode, edit_mode, i, imageheight, imagewidth, mode, mousedown, move_mode, path, points, pointx, pointy, randomTimeout, resize, selected, selfunc, setTemplate, svg, svgPos, timeseed, _i;

body = d3.select("body");

svg = d3.select("svg");

svgPos = null;

window.browserWidth = function() {
  return window.innerWidth || document.body.clientWidth;
};

window.browserHeight = function() {
  return window.innerHeight || document.body.clientHeight;
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
  $('#candidates').css('height', drawHeight / 2 - 30);
  return $('#suggestions').css('height', drawHeight / 2 - 30);
};

$(function() {
  resize();
  $(window).resize(resize);
  svgPos = $('svg').offset();
  return draw_mode();
});

mode = 'draw';

$('#draw').on('click', function() {
  return draw_mode();
});

$('#edit').on('click', function() {
  return edit_mode();
});

$('#delete').on('click', function() {
  var element, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = selected.length; _i < _len; _i++) {
    element = selected[_i];
    _results.push(element.remove());
  }
  return _results;
});

$('#dup').on('click', function() {
  var element, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = selected.length; _i < _len; _i++) {
    element = selected[_i];
    _results.push(alert(element));
  }
  return _results;
});

window.template = svg.append("g");

candsearch = function() {
  var query;
  query = $('#searchtext').val();
  if (query.length > 0) {
    return bing_search(query, function(data) {
      return data.map(function(url, i) {
        return $("#cand" + i).attr('src', url);
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

imagewidth = 400;

imageheight = 400;

mousedown = false;

pointx = 0;

pointy = 0;

for (i = _i = 0; _i <= 10; i = ++_i) {
  d3.select("#cand" + i).on('mousedown', function() {
    var image;
    d3.event.preventDefault();
    image = d3.event.target.src;
    template.selectAll("*").remove();
    template.append('image').attr({
      'xlink:href': image,
      x: 0,
      y: 0,
      width: 400,
      height: 400,
      preserveAspectRatio: "meet"
    });
    mousedown = true;
    pointx = d3.event.clientX;
    return pointy = d3.event.clientY;
  });
  d3.select("#cand" + i).on('mousemove', function() {
    if (mousedown) {
      d3.event.preventDefault();
      return d3.select("image").attr({
        x: d3.event.clientX - pointx,
        y: d3.event.clientY - pointy
      });
    }
  });
  d3.select("#cand" + i).on('mouseup', function() {
    d3.event.preventDefault();
    return mousedown = false;
  });
}

window.line = d3.svg.line().interpolate('cardinal').x(function(d) {
  return d.x;
}).y(function(d) {
  return d.y;
});

window.drawline = function(x1, y1, x2, y2) {
  return template.append("polyline").attr({
    points: [[x1, y1], [x2, y2]],
    stroke: "#d0d0d0",
    fill: "none",
    "stroke-width": "4"
  });
};

pointx = 0;

pointy = 0;

mousedown = false;

timeseed = 0;

randomTimeout = null;

setTemplate = function(id, template) {
  d3.select("#" + id).on('click', function() {
    return template.draw();
  });
  d3.select("#" + id).on('mousedown', function() {
    mousedown = true;
    d3.event.preventDefault();
    if (randomTimeout) {
      clearTimeout(randomTimeout);
    }
    pointx = d3.event.clientX;
    pointy = d3.event.clientY;
    return srand(timeseed);
  });
  d3.select("#" + id).on('mousemove', function() {
    var j;
    if (mousedown) {
      d3.event.preventDefault();
      template.change(d3.event.clientX - pointx, d3.event.clientY - pointy);
      i = Math.floor((d3.event.clientX - pointx) / 10);
      j = Math.floor((d3.event.clientY - pointy) / 10);
      return srand(timeseed + i * 100 + j);
    }
  });
  return d3.select("#" + id).on('mouseup', function() {
    mousedown = false;
    return randomTimeout = setTimeout(function() {
      return timeseed = Number(new Date());
    }, 3000);
  });
};

setTemplate("template0", meshTemplate);

setTemplate("template1", parseTemplate);

setTemplate("template2", kareobanaTemplate);

setTemplate("template3", kareobanaTemplate3);

points = [];

path = null;

draw = function() {
  return path.attr({
    d: line(points),
    stroke: 'blue',
    'stroke-width': 3,
    fill: "none"
  });
};

selected = [];

selfunc = function(path) {
  return function() {
    if (mode === 'select') {
      if (!mousedown) {
        return;
      }
      path.attr({
        stroke: 'yellow'
      });
      if (selected.indexOf(path) < 0) {
        return selected.push(path);
      }
    }
  };
};

downpoint = {};

draw_mode = function() {
  mode = 'draw';
  svg.selectAll("*").attr({
    stroke: 'blue'
  });
  svg.on('mousedown', function() {
    d3.event.preventDefault();
    mousedown = true;
    path = svg.append('path');
    points = [
      {
        x: d3.event.clientX - svgPos.left,
        y: d3.event.clientY - svgPos.top
      }
    ];
    downpoint = {
      x: d3.event.clientX - svgPos.left,
      y: d3.event.clientY - svgPos.top
    };
    path.on('mousemove', selfunc(path));
    return path.on('mousedown', function() {
      if (mode === 'select') {
        downpoint = {
          x: d3.event.clientX - svgPos.left,
          y: d3.event.clientY - svgPos.top
        };
        return move_mode();
      }
    });
  });
  svg.on('mouseup', function() {
    if (!mousedown) {
      return;
    }
    d3.event.preventDefault();
    points.push({
      x: d3.event.clientX - svgPos.left,
      y: d3.event.clientY - svgPos.top
    });
    draw();
    return mousedown = false;
  });
  return svg.on('mousemove', function() {
    if (!mousedown) {
      return;
    }
    d3.event.preventDefault();
    points.push({
      x: d3.event.clientX - svgPos.left,
      y: d3.event.clientY - svgPos.top
    });
    return draw();
  });
};

edit_mode = function() {
  selected = [];
  mode = 'select';
  svg.on('mousedown', function() {
    d3.event.preventDefault();
    return mousedown = true;
  });
  svg.on('mousemove', function() {});
  return svg.on('mouseup', function() {
    if (!mousedown) {
      return;
    }
    d3.event.preventDefault();
    return mousedown = false;
  });
};

move_mode = function() {
  mode = 'move';
  svg.on('mousedown', function() {
    return mousedown = true;
  });
  svg.on('mousemove', function() {
    var element, x, y, _j, _len, _results;
    if (!mousedown) {
      return;
    }
    x = d3.event.clientX - svgPos.left;
    y = d3.event.clientY - svgPos.top;
    _results = [];
    for (_j = 0, _len = selected.length; _j < _len; _j++) {
      element = selected[_j];
      _results.push(element.attr("transform", "translate(" + (x - downpoint.x) + "," + (y - downpoint.y) + ")"));
    }
    return _results;
  });
  return svg.on('mouseup', function() {
    if (!mousedown) {
      return;
    }
    d3.event.preventDefault();
    mousedown = false;
    return edit_mode();
  });
};