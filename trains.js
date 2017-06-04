var map;
var mapProp = {
    center: new google.maps.LatLng(42.3600, -71.0589),
    zoom: 12,
};
var myLat = 0;
var myLng = 0;
var me;
var infowindow = new google.maps.InfoWindow();


function myMap() {
    map = new google.maps.Map(document.getElementById("map"), mapProp);
    getLocation();
    loadTrains()
}

function getLocation() {
    if (navigator.geolocation) {
            //navigator.geolocation.getCurrentPosition(print);
            navigator.geolocation.getCurrentPosition(function(position) {
                myLat = position.coords.latitude;
                myLng = position.coords.longitude;
                renderMap();
            })
        } else { 
            document.getElementById("location").innerHTML = "Geolocation is not supported by this browser.";
        }
    }

    function renderMap() {
        me = new google.maps.LatLng(myLat, myLng);

        //map.panTo(me); 
        addToMap(myLat, myLng, "User");
    }

    function addToMap(lat, lng, name) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            title: name
        });
        marker.setMap(map);

        google.maps.event.addListener(marker, 'click', function() {
            var content = this.title;
            infowindow.setContent(content);
            infowindow.open(map, this);

        });
    }

    function loadTrains(){
        request = new XMLHttpRequest();
        request.open("GET", "https://realtime.mbta.com/developer/api/v2/vehiclesbyroutes?api_key=wX9NwuHnZU2ToO7GmGR9uw&routes=Red&format=json", true);

        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200){
                var response = request.responseText;
                var responseObject = JSON.parse(response);
                
                var list = responseObject.mode[0].route[0];
                var train;

                for (var i = 0; i < list.direction.length; i++){
                    for (var j = 0; j < list.direction[i].trip.length; j++){
                        train = list.direction[i].trip[j].vehicle;
                        var label = list.direction[i].direction_name;
                        
                        addToMap(train.vehicle_lat, train.vehicle_lon, label, "train");
                    }
                }
            }
        };
        
        request.send();
    }