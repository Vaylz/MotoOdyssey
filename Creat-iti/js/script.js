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
      var totalDistance = points.reduce((total, point, index) => {
          if (index > 0) {
              total += calculateDistance(points[index - 1], point);
          }
          return total;
      }, 0);
      document.getElementById('total-distance').textContent = 'Distance totale: ' + totalDistance.toFixed(2) + ' km';
  }

  // Fonction pour mettre à jour la polyline et la liste des points
  function updateMap() {
      polyline.setLatLngs(points);
      updateTotalDistance();
      updatePointsList();
  }

  // Mettre à jour la liste des points
  function updatePointsList() {
      var pointsList = document.getElementById('points-list');
      pointsList.innerHTML = points.map((point, index) => `
          <li>
              Point ${index + 1} <button data-index="${index}">Effacer</button>
          </li>
      `).join('');
  }

  // Ajouter un point sur la carte au clic
  map.on('click', function(e) {
      var latlng = e.latlng;
      points.push(latlng);

      var marker = L.marker(latlng)
          .bindTooltip('Point ' + points.length)
          .addTo(map)
          .on('mouseover', function() { this.openTooltip(); })
          .on('mouseout', function() { this.closeTooltip(); });
      markers.push(marker);

      if (points.length === 1) {
          marker.on('click', function() {
              if (points.length > 1) {
                  points.push(points[0]); // Fermer l'itinéraire en reliant le dernier point au premier point
                  updateMap();
              }
          });
      }

      updateMap();
  });

  // Gérer la suppression d'un point
  document.getElementById('points-list').addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON') {
          var index = e.target.getAttribute('data-index');
          points.splice(index, 1);
          map.removeLayer(markers[index]);
          markers.splice(index, 1);
          updateMap();
      }
  });

  // Effacer tous les points et l'itinéraire
  document.getElementById('clear-all').addEventListener('click', function() {
      points = [];
      markers.forEach(marker => map.removeLayer(marker));
      markers = [];
      updateMap();
  });

// Fonction pour créer le contenu du fichier GPX
function generateGPX(points) {
    let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="MotoOdyssey" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
<trk>
  <name>Itinéraire MotoOdyssey</name>
  <trkseg>`;
    
    points.forEach(point => {
        gpx += `
    <trkpt lat="${point.lat}" lon="${point.lng}">
      <ele>0</ele>
      <time>${new Date().toISOString()}</time>
    </trkpt>`;
    });

    gpx += `
  </trkseg>
</trk>
</gpx>`;
    
    return gpx;
}

// Fonction pour télécharger le fichier GPX
function downloadGPX(gpxContent) {
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'itineraire.gpx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Ajouter l'événement au bouton de téléchargement
document.getElementById('download-gpx').addEventListener('click', function() {
    const gpxContent = generateGPX(points);
    downloadGPX(gpxContent);
});