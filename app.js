var map = L.map("map").setView([48.8694901, 2.3893574], 12);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors',
}).addTo(map);

//declare les icones
var greenIcon = L.icon({
  iconUrl: "img/ballon-en-coeur.png",
  iconSize: [30, 65], // size of the icon
  iconAnchor: [18, 65], // point of the icon which will correspond to marker's location
  //popupAnchor: [-18, -76], // point from which the popup should open relative to the iconAnchor
});
  
var modal = document.querySelector("#modal");
var inputTitre = document.querySelector("#titre");
var inputDate = document.querySelector("#date");
var inputImage = document.querySelector("#image");
var inputRaconte = document.querySelector("#raconte");
var coordonnée;
var markersCoords = [];
var tableauMarker;

try {
  // on essaye de récupérer le tableau dans le localstorage
  tableauMarker =
    JSON.parse(localStorage.getItem("savetableauMarker_v2")) || [];
} catch (error) {
  // si ça ne fonctionne pas, on crée un tableau vide
  tableauMarker = [];
  // et on ne fait rien avec l'erreur
}

var coordonnée;

function onMapClick(e) {
  coordonnée = e.latlng;
  modal.showModal();
}

map.on("click", onMapClick);

modal.addEventListener("close", function () {
  console.log(modal.returnValue);
  if (modal.returnValue === "oui") {
    tableauMarker.push({
      titre: inputTitre.value,
      date: inputDate.value,
      image: inputImage.value,
      raconte: inputRaconte.value,
      coordonnée: coordonnée,
    });
    localStorage.setItem("savetableauMarker_v2", JSON.stringify(tableauMarker));
    ajoutMarkerSurLaMap(
      inputTitre.value,
      inputDate.value,
      inputImage.value,
      inputRaconte.value,
      coordonnée
    );
  }
});

// on charge les marqueurs du localstorage
for (var i = 0; i < tableauMarker.length; i++) {
  ajoutMarkerSurLaMap(
    tableauMarker[i].titre,
    tableauMarker[i].date,
    tableauMarker[i].image,
    tableauMarker[i].raconte,
    tableauMarker[i].coordonnée
  );
}

function ajoutMarkerSurLaMap(titre, date, image, raconte, coordonnée) {
  var marker = new L.Marker([coordonnée.lat, coordonnée.lng],{icon:greenIcon}).addTo(map);
  marker.bindPopup(
    "<h2>" +
      titre +
      "</h2>" +
      "<p>" +
      date +
      "</p>" +
      "<p>" +
      raconte +
      "</p>" +
      '<img src=""' +
      image +
      '" alt=""' +
      titre +
      '">' +
      '<p><a style="cursor: pointer" onclick="supprimeMarker(' +
      coordonnée.lat +
      ", " +
      coordonnée.lng +
      ')">Supprimer</a></p>' +
      "<p>" ,
      {className: "popup"},
  );

  // Ajouter les coordonnées du marqueur au tableau
  markersCoords.push([coordonnée.lat, coordonnée.lng]);

  // Créer une ligne reliant tous les marqueurs existants
  if (markersCoords.length > 1) {
    var line = L.polyline(markersCoords, { color: "purple" }).addTo(map);
  }
}

function supprimeMarker(lat, lng) {
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      if (layer.getLatLng().lat === lat && layer.getLatLng().lng === lng) {
        map.removeLayer(layer);
      }
    }
    if (layer instanceof L.Polyline) {
      var latlngs = layer.getLatLngs();
      if (
        (latlngs.length === 2 &&
          latlngs[0].lat === lat &&
          latlngs[0].lng === lng) ||
        (latlngs[1].lat === lat && latlngs[1].lng === lng)
      ) {
        map.removeLayer(layer);
      }
    }
  });
  // Supprimer les coordonnées du marqueur du tableau
  markersCoords = markersCoords.filter(function (coords) {
    return coords[0] !== lat || coords[1] !== lng;
  });
  // Mettre à jour le tableau markersCoords
  var newMarkersCoords = [];
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      var coords = layer.getLatLng();
      newMarkersCoords.push([coords.lat, coords.lng]);
    }
  });
  markersCoords = newMarkersCoords;
  // Créer une ligne reliant tous les marqueurs existants
  if (markersCoords.length > 1) {
    // Remove the old polyline
    map.eachLayer(function (layer) {
      if (layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });
    // Create a new polyline with the updated markersCoords
    var line = L.polyline(markersCoords, { color: "purple" }).addTo(map);
  }
  // Supprimer la ligne reliant tous les marqueurs si un seul marqueur reste
  if (markersCoords.length === 1) {
    map.eachLayer(function (layer) {
      if (layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });
  }
  // Mettre à jour le localstorage
  tableauMarker = tableauMarker.filter(function (marker) {
    return marker.coordonnée.lat !== lat || marker.coordonnée.lng !== lng;
  });
  localStorage.setItem("savetableauMarker_v2", JSON.stringify(tableauMarker));
}