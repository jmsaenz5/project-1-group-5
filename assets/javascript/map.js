        jQuery.ajaxPrefilter(function (options) {
            if (options.crossDomain && jQuery.support.cors) {
                options.url = "https://cors-anywhere.herokuapp.com/" + options.url;
            }
        });
        //create variables
        var map, infoWindow, brewSearch, brewResult, brewInfo, moreInfo, webBrew, descriptBrew, contentString;
        $(document).ready(function () {
            function useBoth() {
                $.ajax({
                    url: brewSearch,
                    method: "GET"
                }).done(function (response) {
                    brewResult = response.data[0];
                    console.log("brewResult " + brewResult.name);
                    console.log("Response: " + response.data[0].name)
                    console.log("Website: " + brewResult.website);
                })

            }
            //Begin function by defining the map with initial coordinates.
            function initMap() {
                map = new google.maps.Map(document.getElementById("map"), {
                    center: { lat: 29.7680, lng: -95.3980 },
                    zoom: 12
                });
                //Initialize info window
                infoWindow = new google.maps.InfoWindow;
                //geolocation.
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        var pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        infoWindow.setPosition(pos);
                        infoWindow.setContent("You are here");
                        infoWindow.open(map);
                        map.setCenter(pos);
                        var request = {
                            location: map.getCenter(),
                            radius: "500",
                            query: "brewery"
                        };
                        var service = new google.maps.places.PlacesService(map);
                        service.textSearch(request, callback);
                    }, function () {
                        handleLocationError(true, infoWindow, map.getCenter());
                    });
                } else {
                    // Browser doesn't support Geolocation
                    handleLocationError(false, infoWindow, map.getCenter());
                };
            }
            function callback(results, status) {
                service = new google.maps.places.PlacesService(map);
                var details = google.maps.places.PlaceResult;
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < 20; i += 1) {
                        createMarker(results[i]);
                        console.log('HERE:'+results[i].name)
                        //useBoth(brewResult[i]);
                    }
                };
                function createMarker(place) {
                    var marker = new google.maps.Marker({
                        map: map,
                        place: {
                            placeId: results[i].place_id,
                            location: results[i].geometry.location
                        }
                    })
                    console.log(marker);
                    var placeWindow = new google.maps.InfoWindow({
                        place: {
                            placeId: results[i].place_id,
                            name: results[i].name,
                            address: results[i].formatted_address
                        },
                    })
                    //useBoth();
                    var brewTrim = placeWindow.place.name.replace(/\s/g, "+");
                    brewSearch = "http://api.brewerydb.com/v2/search?q=" + brewTrim + "&type=brewery&key=35eff59e52d0da84d5ba657eab46cc81";
                    console.log("brewSearch " + brewSearch);
                    console.log("placeWindow " + placeWindow);
                    $.ajax({
                    url: brewSearch,
                    method: "GET"
                }).done(function (response) {
                    brewResult = response.data[0];
                    $("#brewery-name").append("<li onclick = 'getBreweryInfo('"+brewResult.id+"')'>"+brewResult.name+"</li>");

                    moreInfo ="http://api.brewerydb.com/v2/brewery/" + brewResult.id + "?key=35eff59e52d0da84d5ba657eab46cc81";
                    if (brewResult.status === "verified") {
                    placeWindow.setContent("<div><strong>" + placeWindow.place.name + "</strong><br>" +
                            placeWindow.place.address + "<br>" + brewResult.website + "<br>" + brewResult.description +"</div>");
                    } else {placeWindow.setContent("We're sorry, but the information about the brewery you've selected is not available at this time. We will update this listing as soon as the information becomes available to us.")
                    }

                })
                    google.maps.event.addListener(marker, "click", function () {
                        
                        placeWindow.open(map, this)
                    });
                    
                } // createMarker
                
            };
            google.maps.event.addDomListener(window, "load", initMap);
            function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                infoWindow.setPosition(pos);
                infoWindow.setContent(browserHasGeolocation ?
                    'Error: The Geolocation service failed.' :
                    'Error: Your browser doesn\'t support geolocation.');
                infoWindow.open(map);
            }
        })

        function storeFunction(string){
            localStorage.setItem("name",string);

        }


function getBreweryInfo(bId){


var queryUrlBrewery = "http://api.brewerydb.com/v2/brewery/" + bId + "?key=35eff59e52d0da84d5ba657eab46cc81";
    $.ajax({
        url: queryUrlBrewery,
        method: "GET"
      }).done(function (response) {
        var breweryResult = response.data;

      
      $("#brewery-img").html("<img src='" + breweryResult.images.squareMedium + "'>");
    

    if (breweryResult.description === undefined){
      $("#brewery-desc").html();
    } else {
      $("#brewery-desc").html("<p>" + breweryResult.description +"</p>");
    };

    if (breweryResult.website === undefined){
      $("#brewery-website").html();
    } else {
      $("#brewery-website").html("<p>Website: <a href='"+breweryResult.website+"'>"+breweryResult.name + "</a></p>");
    }  
     getBeers(bId);
  });
};

function getBeers(bId){
  queryURLbeers = "http://api.brewerydb.com/v2/brewery/" + bId + "/beers?key=35eff59e52d0da84d5ba657eab46cc81";
        $.ajax({
          url: queryURLbeers,
          method: "GET"
        })
                // After the data comes back from the API
                .done(function (response) {
                    // Storing an array of results in the results variable
                    var results = response.data;
                    console.log(results);

                    if (results != undefined){
                      $("#beers-by-brewery").text("Beers by "+ breweryName);
                    for (var i = 0; i < results.length; i += 1) {
                      if (results[i].labels != undefined) {
                        $("#beer-list").append("<div class = 'col-4'><img id = 'beer-" + i + "' src = '" + results[i].labels.medium + "'><br><p>" + results[i].name + "</p></div>");
                      } else {
                        $("#beer-list").append("<div class = 'col-4'><img id = 'beer-" + i + "' src = 'assets/images/beer_PNG2388.png'><br><p>" + results[i].name + "</p></div>");
                      }
                    }
                  }

                  });
}


