// Generated by CoffeeScript 1.7.1
var recognize,
  __slice = [].slice;

$(function() {
  $.getJSON("kanji/kanji.json", function(data) {
    return window.kanjidata = data;
  });
  return $.getJSON("figures.json", function(data) {
    return window.figuredata = data;
  });
});

recognize = function() {
  var cands, data, entry, height, kanji_strokes, kstrokes, maxx, maxy, minx, miny, normalized_strokes, nstrokes, size, stroke, strokedata, strokes, totaldist, width, x0, x1, y0, y1, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _n, _o, _ref, _ref1, _results, _results1, _results2;
  strokes = arguments[0], strokedata = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
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
  for (_k = 0, _len2 = strokedata.length; _k < _len2; _k++) {
    data = strokedata[_k];
    for (_l = 0, _len3 = data.length; _l < _len3; _l++) {
      entry = data[_l];
      kstrokes = entry.strokes;
      if (kstrokes.length < nstrokes) {
        continue;
      }
      _ref1 = [1000, 1000, 0, 0], minx = _ref1[0], miny = _ref1[1], maxx = _ref1[2], maxy = _ref1[3];
      (function() {
        _results = [];
        for (var _m = 0; 0 <= nstrokes ? _m < nstrokes : _m > nstrokes; 0 <= nstrokes ? _m++ : _m--){ _results.push(_m); }
        return _results;
      }).apply(this).forEach(function(i) {
        var ppoints;
        ppoints = kstrokes[i];
        stroke = [];
        stroke[0] = ppoints[0];
        stroke[1] = ppoints[ppoints.length - 1];
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
        var ppoints;
        ppoints = kstrokes[i];
        stroke = [];
        stroke[0] = ppoints[0];
        stroke[1] = ppoints[ppoints.length - 1];
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
  return cands.sort(function(a, b) {
    return a[1] - b[1];
  }).map(function(e) {
    return e[0];
  });
};