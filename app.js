var map = L.map('map').setView([48.8694901, 2.3893574], 10);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

var modal = document.querySelector('#modal');
var inputTitre = document.querySelector('#titre');
var inputDate = document.querySelector('#date');
var inputImage = document.querySelector('#image');
var inputRaconte = document.querySelector('#raconte');
var coordonnée;

var tableauMarker;

try {
    // on essaye de récupérer le tableau dans le localstorage
    tableauMarker = JSON.parse(localStorage.getItem('savetableauMarker_v2')) || [];
}
catch (error) {
    // si ça ne fonctionne pas, on crée un tableau vide
    tableauMarker = [];
    // et on ne fait rien avec l'erreur
}

function onMapClick(e) {
    coordonnée = e.latlng;
    modal.showModal();
}

map.on('click', onMapClick);

modal.addEventListener('close', function () {
    console.log(modal.returnValue)
    if (modal.returnValue === 'oui') {
        tableauMarker.push({
            titre: inputTitre.value,
            date: inputDate.value,
            image: inputImage.value,
            raconte: inputRaconte.value,
            coordonnée: coordonnée
        });
        localStorage.setItem('savetableauMarker_v2', JSON.stringify(tableauMarker));
        ajoutMarkerSurLaMap(inputTitre.value, inputDate.value, inputImage.value, inputRaconte, coordonnée);
    }
});

// on charge les marqueurs du localstorage
for (var i = 0; i < tableauMarker.length; i++) {
    ajoutMarkerSurLaMap(tableauMarker[i].titre, tableauMarker[i].date, tableauMarker[i].image, tableauMarker[i].raconte, tableauMarker[i].coordonnée);
}

function ajoutMarkerSurLaMap(titre, date, image, raconte, coordonnée) {
    var marker = new L.Marker([coordonnée.lat, coordonnée.lng]).addTo(map);
    marker.bindPopup(
        '<h2>' + titre + '</h2>'
        + '<h3>' + date + '</h3>'
        + '<p><a style="cursor: pointer" onclick="supprimeMarker('+ coordonnée.lat + ', ' + coordonnée.lng + ')">Supprimer</a></p>'
        + '<p>' + raconte + '</p>'
        + '<img src="' + image + '" alt="' + titre + '">'
    );
}

function supprimeMarker(lat, lng) {
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            if (layer.getLatLng().lat === lat && layer.getLatLng().lng === lng) {
                map.removeLayer(layer);
            }
        }
    });
    tableauMarker = tableauMarker.filter(function (marker) {
        return marker.coordonnée.lat !== lat || marker.coordonnée.lng !== lng;
    });
    localStorage.setItem('savetableauMarker_v2', JSON.stringify(tableauMarker));
}
