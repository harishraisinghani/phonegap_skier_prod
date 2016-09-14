// onSuccess Callback
// This method accepts a Position object, which contains the
// current GPS coordinates
//

function initMap() {
    $.ajax({
        method:     'GET',
        dataType:   'json',
        url: 'https://skipatrolproductiondatabase.herokuapp.com/destinations/4.json',
        success: function(response) {
           var destLatLong = {lat: response.lat, lng: response.long};
            var map = new google.maps.Map(document.getElementById('map'), {
                center: destLatLong,
                zoom: 13
            });

            //Get location of signed in user from database
            var id = localStorage.getItem("user_id");
            $.ajax({
                method:     'GET',
                dataType:   'json',
                url: 'https://skipatrolproductiondatabase.herokuapp.com/skiers/'+id+'/pings',
                success: function(response) {
                    var marker = new google.maps.Marker({
                        position: {lat: response[response.length-1].lat , lng: response[response.length-1].long},
                        map: map,
                        title: 'I am here!',
                        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    });
                }       
            });

            $.ajax({
                method:     'GET',
                dataType:   'json',
                url: 'https://skipatrolproductiondatabase.herokuapp.com/groups/1/skiers/current_checkin/pings/last',
                success: function(response) {
                    $("#group-members-name tr").remove();
                    var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    var labelIndex = 0;
                    for(var i = 0; i<response[0].length; i++) {
                        var groupMarker = new google.maps.Marker({
                            position: {lat: response[0][i].lat , lng: response[0][i].long},
                            label: labels[labelIndex++ % labels.length],
                            map: map   
                        });
                        var row = "<tr><td>"+labels[i]+"</td><td>"+response[1][i]+"</td></tr>";
                        $("#group-members-name").append(row);
                    }
                }       
            });
        }
    });
}

var onSuccess = function(position) {
    var id = localStorage.getItem("user_id");
    $.ajax({
            method: 'GET',
            url: 'https://skipatrolproductiondatabase.herokuapp.com/skiers/'+id+'/request_alert',
            data: {lat: position.coords.latitude, lng: position.coords.longitude },
            success: function(response) {
               alert(response);
              }
        });
}

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}



$(function() {
   $("#ping").on("click", function() {
        initMap();
    }); 
});

$(function() {
   $("#help-me").on("click", function() { 
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }); 
});





// var onSuccess = function(position) {
    
//     $.ajax({
//         method:     'GET',
//         dataType:   'json',
//         url: 'https://skipatrolproductiondatabase.herokuapp.com/destinations/4.json',
//         success: function(response) {
//            var destLatLong = {lat: response.lat, lng: response.long};
//             var map = new google.maps.Map(document.getElementById('map'), {
//                 center: destLatLong,
//                 zoom: 13
//             });

//             //Geo-located marker based off phone
//             var marker = new google.maps.Marker({
//                 position: {lat: position.coords.latitude , lng: position.coords.longitude},
//                 map: map,
//                 animation: google.maps.Animation.DROP,
//                 title: 'Welcome to my City!'
//             }); 

//             //Pulled from database
//             $.ajax({
//                 method:     'GET',
//                 dataType:   'json',
//                 url: 'https://skipatrolproductiondatabase.herokuapp.com/groups/1/skiers/current_checkin/pings/last',
//                 success: function(response) {
//                     var image = 'img/skiing.svg' //Oddly, my custom images don't work.
//                     for(var i = 0; i<response[0].length; i++) {
//                         var groupMarker = new google.maps.Marker({
//                             position: {lat: response[0][i].lat , lng: response[0][i].long},
//                             map: map,
//                             icon: image
//                             // icon: image
//                             // This doesn't work yet!
//                             // map_icon_label: '<span class="map-icon map-icon-skiing"></span>'       
//                         }); 
//                     }      
//                 }       
//             });
//         }
//     });
// };



// navigator.geolocation.getCurrentPosition(onSuccess, onError);
