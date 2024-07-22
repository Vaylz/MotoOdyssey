var map = L.map("map").setView([46.603354, 1.888334], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      document
        .getElementById("file-input")
        .addEventListener("change", function (e) {
          var file = e.target.files[0];
          if (file && file.name.endsWith(".gpx")) {
            var reader = new FileReader();
            reader.onload = function (event) {
              var gpxData = event.target.result;
              var parser = new DOMParser();
              var gpx = parser.parseFromString(gpxData, "application/xml");
              var geojson = toGeoJSON.gpx(gpx);
              var gpxLayer = L.geoJSON(geojson, {
                onEachFeature: function (feature, layer) {
                  layer.bindPopup("Point: " + feature.geometry.coordinates);
                },
              }).addTo(map);
              map.fitBounds(gpxLayer.getBounds());
            };
            reader.readAsText(file);
          } else {
            alert("Please upload a valid GPX file.");
          }
        });