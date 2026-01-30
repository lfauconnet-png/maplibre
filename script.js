const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);


// Configuration de la carte
var map = new maplibregl.Map({
container: 'map',
style: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json', // Fond de carte
customAttribution : '<a href="https://sites-formations.univ-rennes2.fr/mastersigat/"target="_blank">Master SIGAT</a>',
center: [-1.67, 48.11], // lat/long
zoom: 12, // zoom
pitch: 0, // Inclinaison
bearing: 0, // Rotation
minZoom: 11
});

// Boutons de navigation
var nav = new maplibregl.NavigationControl();
map.addControl(nav, 'top-left');

// Ajout Echelle cartographique
map.addControl(new maplibregl.ScaleControl({
maxWidth: 120,
unit: 'metric'}));


// appel du flux osm
map.on('load', function () {
map.addSource('mapbox-streets-v8', {
type: 'vector',
url: 'mapbox://mapbox.mapbox-streets-v8'});
  
// PLUI
map.addSource("PLUIsource", {
type: "vector",
url: "pmtiles://https://raw.githubusercontent.com/lfauconnet-png/datasigat/main/PLUIRM.pmtiles"
});
map.addLayer({
id: "PLUI",
type: "fill",
source: "PLUIsource",
"source-layer": "PLUIRM",
'layout': {'visibility': 'none'},
paint: {"fill-color": ['match',['get', 'typezone'],
                      'A', '#ffff00',
                      'Ah', 'orange',
                      'N', '#56aa02',
                      'U', '#e60000',
              '#ccc'], 
 "fill-outline-color": 'white',
  "fill-opacity": 0.5,}
});
   
  
// AJOUT DU CADASTRE ETALAB
map.addSource('Cadastre', {
type: 'vector',
url: 'https://openmaptiles.geo.data.gouv.fr/data/cadastre.json' });
map.addLayer({
'id': 'Cadastre',
'type': 'line',
'source': 'Cadastre',
'source-layer': 'parcelles',
'layout': {'visibility': 'none'},
'paint': {'line-color': '#8F4242'},
'minzoom':14, 'maxzoom':19 });
map.setPaintProperty('communeslimites', 'line-width', ["interpolate",["exponential",1],["zoom"],16,0.3,18,1]);

  
// PLUI contour
map.addLayer({
id: "PLUIcontour",
type: "line",
source: "PLUIsource",
"source-layer": "PLUIRM",
'layout': {'visibility': 'none'},
paint: {'line-color': 'white',
       "line-width": {'stops' : [[13,0.1],[20,5]]}}
});  
  
// Ajout ADMIN_EXPRESS
map.addSource('ADMIN_EXPRESS', {
type: 'vector',
url: 'https://data.geopf.fr/tms/1.0.0/ADMIN_EXPRESS/metadata.json',
minzoom: 1,
maxzoom: 19
});  
map.addLayer({
'id': 'Commune',
'type': 'line',
'source': 'ADMIN_EXPRESS',
'source-layer': 'commune',
'layout': {'visibility' : 'visible'},
'paint': {'line-color': 'grey',"line-width": {'stops' : [[1,1],[20,2]]}}
});
    

 // Ajout lignes de metros
map.addSource('lignes', {
type: 'geojson',
data: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/metro-du-reseau-star-traces-de-laxe-des-lignes/exports/geojson?lang=fr&timezone=Europe%2FBerlin'
});
map.addLayer({
'id': 'lignesmetros',
'type': 'line',
'source': 'lignes',
'layout': {'visibility': 'visible'},
'paint': {'line-opacity': 0.7, 'line-width': 4,
'line-color': ['match',['get', 'ligne'],
              'a', 'red',
              'b', 'green',
              '#ccc']}
});

  
// Ajout BDTOPO
map.addSource('BDTOPO', {
type: 'vector',
url: 'https://data.geopf.fr/tms/1.0.0/BDTOPO/metadata.json',
minzoom: 14,
maxzoom: 19
});
map.addLayer({
'id': 'vegetation',
'type': 'fill',
'source': 'BDTOPO',
'layout': {'visibility': 'none'}, 
'source-layer': 'zone_de_vegetation',
'paint': {'fill-color': '#A5C299',
'fill-opacity': 0.90}
});
  
 map.addLayer({
'id': 'batiments',
'type': 'fill-extrusion',
'source': 'BDTOPO',
'layout': {'visibility': 'visible'},   
'source-layer': 'batiment',
'paint': {'fill-extrusion-color': '#D9CABF',
'fill-extrusion-height':{'type': 'identity','property': 'hauteur'},
'fill-extrusion-opacity': 0.90,
'fill-extrusion-base': 0},
'minzooom':15
});
  
  
  
// ajout parc relais 
$.getJSON('https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/tco-parcsrelais-star-etat-tr/records?limit=20',
function(data) {var geojsonData4 = {
type: 'FeatureCollection',
features: data.results.map(function(element) {
return {type: 'Feature',
geometry: {type: 'Point',
coordinates: [element.coordonnees.lon, element.coordonnees.lat]},
properties: { name: element.nom,
capacity: element.jrdinfosoliste}};
})
};
map.addLayer({ 'id': 'Parcrelais',
'type':'circle',
'source': {'type': 'geojson',
'data': geojsonData4},
'paint': {'circle-color': '#627CCB', 'circle-stroke-width': 2, 'circle-stroke-color': '#3753A5'}
});
});  
  
  // ajout VLS
$.getJSON('https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/vls-stations-etat-tr/records?limit=57',
function(data) {var geojsonData4 = {
type: 'FeatureCollection',
features: data.results.map(function(element) {
return {type: 'Feature',
geometry: {type: 'Point',
coordinates: [element.coordonnees.lon, element.coordonnees.lat]},
properties: { name: element.nom,
              nbvelo: element.nombrevelosdisponibles,
              nbsocle: element.nombreemplacementsdisponibles}};
})
};
map.addLayer({ 'id': 'VLS',
'type':'circle',
'source': {'type': 'geojson',
'data': geojsonData4},
'layout': {'visibility': 'none'},
'paint': {'circle-color': '#3CB095', 'circle-radius':4}
});
});
  
  
var previousZoom = map.getZoom();
map.on('zoomend', () => {
  var currentZoom = map.getZoom();
  if (currentZoom >= 15 && currentZoom > previousZoom) {
    map.easeTo({ pitch: 60, duration: 700 });
  }
  else if (currentZoom < 15 || currentZoom < previousZoom) { // Zoom out OU < 15 → revient plat comme au début
    map.easeTo({ pitch: 0, duration: 700 });
  previousZoom = currentZoom;}
});    
  
  //fin du map ON
});

//Interactivité HOVER
var popup = new maplibregl.Popup({
className: "Parcpopup",
closeButton: false,
closeOnClick: false });
map.on('mousemove', function(e) {
var features = map.queryRenderedFeatures(e.point, { layers: ['Parcrelais'] });
// Change the cursor style as a UI indicator.
map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
if (!features.length) {
popup.remove();
return; }
var feature = features[0];
popup.setLngLat(feature.geometry.coordinates)
.setHTML(
  `<b>${feature.properties.name}</b><br>` +
    `Places disponibles : ${feature.properties.capacity}`
  )
.addTo(map);
});

//Interactivité CLICK
map.on('click', function (e) {
var features = map.queryRenderedFeatures(e.point, { layers: ['VLS'] });
if (!features.length) {
return;
}
var feature = features[0];
var popup = new maplibregl.Popup({className : 'VLSpopup', offset: [0, -15] })
.setLngLat(feature.geometry.coordinates)
.setHTML('<h2>' + feature.properties.name + '</h2><h3>'
+"Vélos disponibles : " + feature.properties.nbvelo + '</h3><p>'
+"Socles disponibles : " + feature.properties.nbsocle + '</p>' )
.addTo(map);
});
map.on('mousemove', function (e) {
var features = map.queryRenderedFeatures(e.point, { layers: ['VLS'] });
map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
});

switchlayer = function (lname) {
            if (document.getElementById(lname).checked) {
                map.setLayoutProperty(lname, 'visibility', 'visible');
            } else {
                map.setLayoutProperty(lname, 'visibility', 'none');
           }
        }

// Configuration onglets géographiques 

document.getElementById('Rennes').addEventListener('click', function () 
{ map.flyTo({zoom: 12,
           center: [-1.672, 48.1043],
	          pitch: 0,
            bearing:0 });
});

document.getElementById('Gare').addEventListener('click', function () 
{ map.flyTo({zoom: 16,
           center: [-1.672, 48.1043],
	          pitch: 20,
            bearing: -197.6 });
});


document.getElementById('Rennes1').addEventListener('click', function () 
{ map.flyTo({zoom: 16,
           center: [-1.6396, 48.1186],
	          pitch: 20,
            bearing: -197.6 });
});

document.getElementById('Rennes2').addEventListener('click', function () 
{ map.flyTo({zoom: 16,
           center: [-1.7023, 48.1194],
	          pitch: 30,
            bearing: -197.6 });
});