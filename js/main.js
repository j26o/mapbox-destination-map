$(function() {
    var map = new Map('map', 'singaporeairline.h2m51k5n');
});

var Map = function (element, mapid, options){
    var _t = this;

    var defaults = {
        animationSpeed : 700,
        initPosition : [1.3, 103.8],
        zoom: 2
    };

    this.count = 1;

    // extend passed options and defaults
    this.options = $.extend({}, options, defaults);

    this.startPt = _t.options.initPosition;

    this.markers = [];

    this.map = L.mapbox.map(element)
    .setView(_t.options.initPosition, _t.options.zoom)
    .addLayer(L.mapbox.tileLayer(mapid , {
        detectRetina: false
    }));

    this.map.on({
        click: function(e){
            // multicity maximum is 6
            if(_t.count < 7) {
                var b = new R.BezierAnim([_t.startPt, e.latlng], {'stroke': '#333', 'alongBezier': 0, 'stroke-width': 1, 'stroke-dasharray': "- " }, function(){}, {}, 1000);

                var p = new R.Pulse(
                    e.latlng, 
                    19,
                    {'stroke': 'rgba(0,0,0,0)'},
                    {'stroke': '#cbcbcb', 'stroke-width': 1},
                    {}, 600
                );

                var marker = L.marker(e.latlng, {
                        icon: L.divIcon({
                            className: 'marker-style',
                            html: _t.count,
                            iconSize: [40, 40]
                        })
                    });

                marker.addTo(_t.map);

                _t.startPt = e.latlng;

                _t.count++;

                _t.map.addLayer(p);
                _t.map.addLayer(b);

                _t.markers.push([marker,p,b]);
            }
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

            // _t.map.setView([position.coords.latitude, position.coords.longitude]);

            console.log(position);
        },
        geoError : function(e){
            console.log('this error occured:', e);
        }
    }

    this.methods.getGeo();
};

var BookingMap = function(){
};