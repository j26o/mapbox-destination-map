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

    var m = L.marker(_t.startPt, {
            icon: L.divIcon({
                className: 'marker-style',
                html: _t.count,
                iconSize: [40, 40]
            })
        });

    m.addTo(_t.map);

    this.map.on({
        click: function(e){
            // multicity maximum is 6
            if(_t.count < 7) {

            }

            _t.count++;

            var b = new R.BezierAnim([_t.startPt, e.latlng], {'stroke': '#333', 'alongBezier': 0, 'stroke-width': 1, 'stroke-dasharray': "- " }, function(){}, {}, 700);

            var p = new R.Pulse( e.latlng,  19, {'stroke': 'rgba(0,0,0,0)'}, {'stroke': '#333', 'stroke-width': 1}, {}, 600 );

            var shape = 'M63.344,48.233c2.219,0.004,2.219,3.343-0.062,3.346h-9.287l-7.833,13.007H42.74l4.25-12.944h-6.94l-2.345,2.986H35l1.423-4.613L35,45.389h2.705l2.345,2.97h6.94l-4.252-12.944h3.424l7.833,12.819L63.344,48.233L63.344,48.233z';

            var plane = new R.AlongPath( shape, [_t.startPt, e.latlng], { fill : '#333', stroke : '0' }, function(){}, {}, 2000 );

            var marker = L.marker(e.latlng, {
                    icon: L.divIcon({
                        className: 'marker-style',
                        html: _t.count,
                        iconSize: [40, 40]
                    })
                });

            marker.addTo(_t.map);

            _t.startPt = e.latlng;

            _t.map.addLayer(p);
            _t.map.addLayer(b);
            _t.map.addLayer(plane);

            _t.markers.push([marker,p,b,plane]);
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