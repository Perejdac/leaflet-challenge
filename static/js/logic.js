// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


d3.json(queryUrl, function (data) {
  Feature(data.features);
  console.log(data.features)
});

function Feature(earthquakeData) {

  // Define a function that runs once for each feature
  // Give each feature a popup 
  function eachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // function w/circle radius based on magnitude
  function radiusSize(magnitude) {
    return magnitude * 20000;
  }

  // Define function to set the circle color based on the magnitude
  function circleColor(magnitude) {
    if (magnitude < 1) {
      return "cyan"
    }
    else if (magnitude < 2) {
      return "blue"
    }
    else if (magnitude < 3) {
      return "yellow"
    }
    else if (magnitude < 4) {
      return "purple"
    }
    else if (magnitude < 5) {
      return "green"
    }
    else {
      return "red"
    }
  }

  // Create a GeoJSON 
  // Run the onEachFeature
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 1
      });
    },
    eachFeature: eachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define outdoormap, satellitemap, and grayscalemap layers
  var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create the faultline layer
  var faultLine = new L.LayerGroup();

  // baseMaps object 
  var baseMaps = {
    "Outdoor Map": outdoorsmap,
    "Greyscale Map": grayscalemap,
    "Satellite Map": satellitemap
  };

  // overlay object 
  var overlayMaps = {
    Earthquakes: earthquakes,
    FaultLines: faultLine
  };

  // Create map, streetmap and earthquakes layers
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [outdoorsmap, earthquakes, faultLine]
  });

  // Create a layer control
  
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // faultline data
  var faultlinequery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

  // Create the faultlines and add them to the faultline layer
  d3.json(faultlinequery, function (data) {
    L.geoJSON(data, {
      style: function () {
        return { color: "black", fillOpacity: 0 }
      }
    }).addTo(faultLine)
  })

  // color function to be used when creating the legend
  function getColor(d) {
    return d > 5 ? 'blue' :
      d > 4 ? 'green' :
        d > 3 ? 'purple' :
          d > 2 ? 'yellow' :
            d > 1 ? 'red' :
              'cyan';
  }

  // Add legend to the map
  var legend = L.control({ position: 'bottomleft' });

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      mags = [0, 1, 2, 3, 4, 5],
      labels = [];

    // loop through density
    for (var i = 0; i < mags.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
        mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);
}