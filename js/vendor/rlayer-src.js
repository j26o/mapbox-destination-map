/*

 RaphaelLayer, a JavaScript library for overlaying Raphael objects onto Leaflet interactive maps. http://dynmeth.github.com/RaphaelLayer
 (c) 2012-2013, David Howell, Dynamic Methods Pty Ltd

 Version 0.1.3
*/

(function() {

var R, originalR;

if (typeof exports != 'undefined') {
	R = exports;
} else {
	R = {};

	originalR = window.R;

	R.noConflict = function() {
		window.R = originalR;
		return R;
	};

	window.R = R;
}

R.version = '0.1.3';

R.Layer = L.Class.extend({
	includes: L.Mixin.Events,
	
	initialize: function(options) {
		
	},

	onAdd: function (map) {
		this._map = map;
		this._map._initRaphaelRoot();
		this._paper = this._map._paper;
		this._set = this._paper.set();
		
		map.on('viewreset', this.projectLatLngs, this);
		this.projectLatLngs();
	},

	onRemove: function(map) {
		map.off('viewreset', this.projectLatLngs, this);
		this._map = null;
		this._set.forEach(function(item) {
			item.remove();
		}, this);
		this._set.clear();
	},

	projectLatLngs: function() {
		
	},

	animate: function(attr, ms, easing, callback) {
		this._set.animate(attr, ms, easing, callback);
	
		return this;
	},

	hover: function(f_in, f_out, icontext, ocontext) {
		this._set.hover(f_in, f_out, icontext, ocontext);

		return this;
	},

	attr: function(name, value) {
		this._set.attr(name, value);

		return this;
	}
});

L.Map.include({
	_initRaphaelRoot: function () {
		if (!this._raphaelRoot) {
			this._raphaelRoot = this._panes.overlayPane;
			this._paper = Raphael(this._raphaelRoot);

			this.on('moveend', this._updateRaphaelViewport);
			this._updateRaphaelViewport();
		}
	},

	_updateRaphaelViewport: function () {
		var	p = 0.02,
			size = this.getSize(),
			panePos = L.DomUtil.getPosition(this._mapPane),
			min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(p)),
			max = min.add(size.multiplyBy(1 + p*2)),
			width = max.x - min.x,
			height = max.y - min.y,
			root = this._raphaelRoot,
			pane = this._panes.overlayPane;

		this._paper.setSize(width, height);
		
		L.DomUtil.setPosition(root, min);

		root.setAttribute('width', width);
		root.setAttribute('height', height);
		
		this._paper.setViewBox(min.x, min.y, width, height, false);
		
	}
});

R.BezierAnim = R.Layer.extend({
	initialize: function(latlngs, attr, cb, options, duration) {
		R.Layer.prototype.initialize.call(this, options);

		this._latlngs = latlngs;
		this._attr = attr;
		this._cb = cb;
		this._dur = duration;
	},

	onRemove: function (map) {
		R.Layer.prototype.onRemove.call(this, map);
		
		if(this._path) this._path.remove();
		if(this._sub) this._sub.remove();
	},

	projectLatLngs: function() {
		if(this._path) this._path.remove();
		if(this._sub) this._sub.remove();
		
		var self = this,
			start = this._map.latLngToLayerPoint(this._latlngs[0]),
			end = this._map.latLngToLayerPoint(this._latlngs[1]),
			cp = this.getControlPoint(start, end),
			pathString = 'M' + start.x + ' ' + start.y + 'Q' + cp.x + ' ' + cp.y + ' ' + end.x + ' ' + end.y,
			line = this._paper.path(pathString).hide();

		this._paper.customAttributes.alongBezier = function(a) {
			var r = this.data('reverse');
			var len = this.data('pathLength');

			return {
				path: this.data('bezierPath').getSubpath(r ? (1-a)*len : 0, r ? len : a*len)
			};
		};

		var sub = this._sub = this._paper.path()
			.data('bezierPath', line)
			.data('pathLength', line.getTotalLength())
			.data('reverse', false)
			.attr(self._attr);

		sub.stop().animate({
			alongBezier: 1
		}, self._dur, function() {
			self._cb();
		});
	},

	getControlPoint: function(start, end) {
		var cp = { x: 0, y: 0 };
		cp.x = start.x + (end.x - [start.x]) / 2;
		cp.y = start.y + (end.y - [start.y]) / 2;
		var amp = 0;

		if (this.closeTo(start.x, end.x) && !this.closeTo(start.y, end.y)) {
			amp = (start.x - end.x) * 1 + 15 * (start.x >= end.x ? 1 : -1);
			cp.x = Math.max(start.x, end.x) + amp;
		} else {
			amp = (end.y - start.y) * 1.5 + 15 * (start.y < end.y ? 1 : -1);
			cp.y = Math.min(start.y, end.y) + amp;
		}
		return cp;
	},

	closeTo: function(a, b) {
		var t = 15;
  		return (a - b > -t && a - b < t);
	}
});

R.Pulse = R.Layer.extend({
	initialize: function(latlng, radius, attr, pulseAttr, options, duration) {
		R.Layer.prototype.initialize.call(this, options);

		this._latlng = latlng;
		this._radius = (typeof radius == 'number' ? radius : 6);
		this._attr = (typeof radius == 'object' ? radius : (typeof attr == 'object' ? attr : {'fill': '#30a3ec', 'stroke': '#30a3ec'}));
		this._pulseAttr = (typeof radius == 'object' ? attr : typeof pulseAttr == 'object' ? pulseAttr : {
			'stroke-width': 3,
			'stroke': this._attr.stroke
		});
		this._repeat = 3;
		this._dur = duration;
	},

	onRemove: function (map) {
		R.Layer.prototype.onRemove.call(this, map);

		if(this._marker) this._marker.remove();		
		if(this._pulse) this._pulse.remove();
	},

	projectLatLngs: function() {
		if(this._marker) this._marker.remove();
		if(this._pulse) this._pulse.remove();

		var p = this._map.latLngToLayerPoint(this._latlng);

		this._marker = this._paper.circle(p.x, p.y, this._radius).attr(this._attr);
		this._pulse = this._paper.circle(p.x, p.y, this._radius).attr(this._pulseAttr);
		var s = this;
		var anim = Raphael.animation({
						'0%': {transform: 's0.3', opacity: 1.0},
						'100%': {transform: 's3.0', opacity: 0.0, easing: '<'}
					}, s._dur);

		this._pulse.animate(anim.repeat(this._repeat));
	}
});


}());