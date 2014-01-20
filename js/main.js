$(function() {
    var map = new Map('map', 'wtfroland.gn6p6aeg');
});

var Map = function (element, mapid, options){
    var _t = this;

    var defaults = {
        animationSpeed : 700,
        initPosition : [1.3, 103.8],
        zoom: 11
    };

    // extend passed options and defaults
    this.options = $.extend({}, options, defaults);

    this.map = L.mapbox.map(element)
    .setView(_t.options.initPosition, _t.options.zoom)
    .addLayer(L.mapbox.tileLayer(mapid , {
        detectRetina: true
    }));

    this.map.on({
        click: function(e){

            var b = new R.BezierAnim2([_t.options.initPosition, e.latlng], {'stroke': '#333', 'alongBezier': 0, 'stroke-width': 3 }, {}, {}, 1000);
            var p = new R.Pulse2(
                e.latlng, 
                6,
                {'stroke': '#ffffff', 'fill': '#000000'}, 
                {'stroke': '#333333', 'stroke-width': 1},
                {}, 600
            );

            _t.map.addLayer(p);
            _t.map.addLayer(b);
        }
    });

    this.methods = {
        getGeo : function(position) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(_t.methods.geoSuccess, _t.methods.geoError);
            } else {
                console.log('not supported');
            }
        },
        geoSuccess : function(position) {
            _t.options.position = position;
            _t.map.setView([position.coords.latitude, position.coords.longitude], _t.map.getZoom() + 1, true);
        },
        geoError : function(e){
            console.log('this error occured:', e);
        }
    }

    this.methods.getGeo();
};

var BookingMap = function(){
};