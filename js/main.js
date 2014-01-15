$(function() {
    var map = L.mapbox.map('map', 'examples.map-9ijuk24y')
    .setView([0, 0], 3);

    // add a new line to the map, but one with no points - yet
    var polyline = L.polyline([]).addTo(map);

    // keep a tally of how many points we've added to the map
    var pointsAdded = 0;

    // start adding new points to the map
    add();

    function add() {

        // addLatLng takes a new latLng location and puts it at the end of the
        // line. You could pull points from your data or generate them - this
        // example just makes a sine wave with some math.
        polyline.addLatLng(
            L.latLng(
                Math.cos(pointsAdded / 20) * 30,
                pointsAdded));

        // pan the map along with where the line is being added. optional, of course
        map.setView([0, pointsAdded], 3);

        // then, if we haven't already added a lot of points, queue up the page
        // to call add() in a 100 milliseconds
        if (++pointsAdded < 360) window.setTimeout(add, 100);
    }
});