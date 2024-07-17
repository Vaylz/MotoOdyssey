// Initialiser la carte
var map = L.map('map').setView([46.603354, 1.888334], 6); // Vue centrée sur la France

// Ajouter les différents fonds de carte
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
});

var mapboxSatellite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=YOUR_MAPBOX_ACCESS_TOKEN', {
    attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    id: 'mapbox/satellite-v9',
    tileSize: 512,
    zoomOffset: -1
});

var mapboxStreets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=YOUR_MAPBOX_ACCESS_TOKEN', {
    attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
});

// Ajouter le calque OSM par défaut
osm.addTo(map);

// Définir les calques de base
var baseLayers = {
    "OpenStreetMap": osm,
    "Topographique": topo,
    "Satellite": mapboxSatellite,
    "Mapbox Streets": mapboxStreets
};

// Ajouter un contrôle des calques
L.control.layers(baseLayers).addTo(map);

var points = [];
var markers = [];
var polyline = L.polyline(points, {color: 'blue'}).addTo(map);

// Fonction pour calculer la distance entre deux points
function calculateDistance(latlng1, latlng2) {
    return map.distance(latlng1, latlng2) / 1000; // Distance en km
}

// Fonction pour mettre à jour la distance totale
function updateTotalDistance() {
    var totalDistance = 0;
    for (var i = 1; i < points.length; i++) {
        totalDistance += calculateDistance(points[i-1], points[i]);
    }
    document.getElementById('total-distance').textContent = 'Distance totale: ' + totalDistance.toFixed(2) + ' km';
}

// Ajouter un point sur la carte au clic
map.on('click', function(e) {
    var latlng = e.latlng;
    points.push(latlng);
    var marker = L.marker(latlng).addTo(map);
    markers.push(marker);

    var listItem = document.createElement('li');
    listItem.textContent = 'Point ' + points.length;
    var removeButton = document.createElement('button');
    removeButton.textContent = 'Effacer';
    removeButton.addEventListener('click', function() {
        var index = markers.indexOf(marker);
        if (index > -1) {
            points.splice(index, 1);
            markers.splice(index, 1);
            map.removeLayer(marker);
            updatePolyline();
            updatePointsList();
            updateTotalDistance();
        }
    });
    listItem.appendChild(removeButton);
    document.getElementById('points-list').appendChild(listItem);

    polyline.setLatLngs(points);
    updateTotalDistance();
});

// Mettre à jour la polyline
function updatePolyline() {
    polyline.setLatLngs(points);
}

// Mettre à jour la liste des points
function updatePointsList() {
    var pointsList = document.getElementById('points-list');
    pointsList.innerHTML = '';
    markers.forEach(function(marker, index) {
        var listItem = document.createElement('li');
        listItem.textContent = 'Point ' + (index + 1);
        var removeButton = document.createElement('button');
        removeButton.textContent = 'Effacer';
        removeButton.addEventListener('click', function() {
            points.splice(index, 1);
            markers.splice(index, 1);
            map.removeLayer(marker);
            updatePolyline();
            updatePointsList();
            updateTotalDistance();
        });
        listItem.appendChild(removeButton);
        pointsList.appendChild(listItem);
    });
}

// Effacer tous les points et l'itinéraire
document.getElementById('clear-all').addEventListener('click', function() {
    points = [];
    markers.forEach(function(marker) {
        map.removeLayer(marker);
    });
    markers = [];
    polyline.setLatLngs(points);
    updatePointsList();
    updateTotalDistance();
});
