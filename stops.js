var map;
var mapProp = {
    center: new google.maps.LatLng(42.3600, -71.0589),
    zoom: 12,
};
var myLat = 0;
var myLng = 0;
var dotIcon = "dot.png";
var infowindow = new google.maps.InfoWindow();


function myMap() {
    map = new google.maps.Map(document.getElementById("map"), mapProp);
    loadUserLocation();
    loadTrains();
}

function loadUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            myLat = position.coords.latitude;
            myLng = position.coords.longitude;
            addUserToMap();
        })
    } else { 
        document.getElementById("location").innerHTML = "Geolocation is not supported by this browser.";
    }
}

function addUserToMap() {
    //me = new google.maps.LatLng(myLat, myLng);
    //map.panTo(me);    // pans map to user location
    addToMap(myLat, myLng, "User");
}

function addToMap(lat, lng, name) {
    if (name == "User"){
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            title: name,
            icon: dotIcon
        });
    } else {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            title: name,
        });

    }
    marker.setMap(map);

    google.maps.event.addListener(marker, 'click', function() {
        //infowindow.setContent(this.title);
        //infowindow.open(map, this);
        if(name != 'User'){
            getStopInfo(this.title);
        }
    });
}

function loadTrains(){
    request = new XMLHttpRequest();
    request.open("GET", "http://realtime.mbta.com/developer/api/v2/stopsbyroute?api_key=wX9NwuHnZU2ToO7GmGR9uw&route=Red&format=json", true);

    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200){
            var list = JSON.parse(request.responseText);
            var stop;

            for (var i = 0; i < list.direction.length; i++){
                for (var j = 0; j < list.direction[i].stop.length; j++){
                    stop = list.direction[i].stop[j];

                    var label = stop.parent_station;
                    addToMap(stop.stop_lat, stop.stop_lon, label);
                }
            }
        }
    };
    request.send();
}

function getStopInfo(stop_string){

    var stoprequest = new XMLHttpRequest();
    var req_string = ('http://realtime.mbta.com/developer/api/v2/predictionsbystop?api_key=wX9NwuHnZU2ToO7GmGR9uw&stop='
        + stop_string + '&format=json');

    stoprequest.open("GET", req_string, true);
    stoprequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    stoprequest.onreadystatechange = displayStopInfo;
    stoprequest.send();
}

function displayStopInfo(){
    if (this.readyState == 4 && this.status == 200){
        var responseObject = JSON.parse(this.responseText);

        for (i in responseObject.mode){
            if (responseObject.mode[i].mode_name == "Subway"){
                for (j in responseObject.mode[i].route){
                    if (responseObject.mode[i].route[j].route_id == 'Red'){
                        postRouteText(responseObject.mode[i].route[j]);
                    }
                }
            }
        }
        postAlerts(responseObject, responseObject.stop_name);
    } else {
        document.getElementById("stop-info-south").innerHTML = 
        document.getElementById("stop-info-north").innerHTML = "<p>No Trains Available</p>";
        document.getElementById("stop-name").innerHTML = "Station";
    }
}

function postAlerts(responseObject, stop_name){
    document.getElementById("stop-name").innerHTML = stop_name;
    if (responseObject.alert_headers.length != 0){
        document.getElementById("alerts").innerHTML = '<p class="center">ALERTS</p>';
    }
    for (i in responseObject.alert_headers) {
        document.getElementById("alerts").innerHTML += '<p>' + 
        responseObject.alert_headers[i].header_text + '</p>';
    }

}

function postRouteText(list, stop_name){
    for (var i = 0; i < list.direction.length; i ++){
        var text = '<p>' + list.direction[i].direction_name + '</p> <ul>';

        for (var j = 0; j < list.direction[i].trip.length; j++){
            var trip = list.direction[i].trip[j];
            text += '<li>' + ('0' + getDateTime(trip).getHours()).slice(-2) + ':'
            + ('0' + (getDateTime(trip).getMinutes())).slice(-2) + '</li>';
        }
        text += '</ul>'

        if (list.direction[i].direction_id == 0){
            document.getElementById("stop-info-south").innerHTML = text;
        } else {
            document.getElementById("stop-info-north").innerHTML = text;
        }
    }
}

function getDateTime(trip){
    var dt;
    if (typeof trip.sch_dep_dt != 'undefined'){
        dt = trip.sch_dep_dt;
    } else if (typeof trip.pre_dt != 'undefined'){
        dt = trip.pre_dt;
    } else {
        dt = 0;
    }
    var time = new Date(0);
    time.setUTCSeconds(dt);
    return time;
}
