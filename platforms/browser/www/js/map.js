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
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

function checkForEmergency(last_ping_id){
  var last_ping_lat, last_ping_long, two_pings_lat, two_pings_long, two_pings_id;
  var lat_diff, long_diff;
  var tolerance = 0.0001;
  two_pings_id = last_ping_id - 1;
  two_pings_lat = localStorage["lat" + two_pings_id];
  two_pings_long = localStorage["long" + two_pings_id];
  last_ping_lat = localStorage["lat" + last_ping_id];
  last_ping_long = localStorage["long" + last_ping_id];
  
  lat_diff = Math.abs(two_pings_lat - last_ping_lat);
  long_diff = Math.abs(two_pings_long - last_ping_long);
  
  if (lat_diff < tolerance && long_diff < tolerance){
    if (window.confirm("You have been detected as immobile.\nDo you need help?")){
      $.post('https://skipatrolproductiondatabase.herokuapp.com/alerts.json', 
        {alert: {ping_id: last_ping_id}},
        function(){
        })
      .done(function(data){
        alert('Ski Patrol has been alerted');
      })
      .fail(function(){
        alert('post fail');
      })
    }
  }
}

function intervalPing(position){
  var cell_ping = {
  lat: position.coords.latitude,
  long: position.coords.longitude,
  checkin_id: localStorage.checkin_id
  }

  $.ajax({
    method: 'POST',
    dataType: 'json',
    data: {
      ping: cell_ping
    },
    url: 'https://skipatrolproductiondatabase.herokuapp.com/pings.json',
    success: function(ping) {
      var ping_lat, ping_long, ping_lat_key, ping_long_key
      ping_lat_key = "lat" + ping.id;
      ping_long_key = "long" + ping.id;
      ping_lat = ping.lat.toString();
      ping_long = ping.long.toString();
      localStorage.setItem("ping_id", ping.id);
      localStorage.setItem(ping_lat_key, ping_lat);
      localStorage.setItem(ping_long_key, ping_long);
      checkForEmergency(ping.id);
    },
    error: function(e){
      alert(e);
    }
  });
}

function setPingInterval(position){
    var intervalID = window.setInterval(function(){intervalPing(position)}, 5000); //delay in milliseconds
}

function createCheckin(id){
  var new_checkin = {
    destination_id: 4,
    skier_id: id, 
  }

  $.ajax({
    method: 'POST',
    dataType: 'json',
    data: {
      checkin: new_checkin
    },
    url: 'https://skipatrolproductiondatabase.herokuapp.com/checkins.json',
    success: function(checkin) {
      localStorage.setItem("checkin_id", checkin.id);
    }
  });
}

// $('.checkin_ping').on('click', function() {
//   var cell_ping = {
//     // DONT FORGET TO UPDATE WITH GEOLOCATOR VARIABLES
//     lat: 77.0,
//     long: 67.0,
//     // Skier.find(session[:id]).current_checkin_id
//     checkin_id: 10 
//   }  
//   $.ajax({
//     method: 'POST',
//     dataType: 'json',
//     data: {
//       ping: cell_ping
//     },
//     url: '/pings',
//     success: function(ping) {
//       console.log(ping)
//     },
//     error: function(e){
//       console.log(e)
//     }
//   })
// });

$(document).ready(function(){
  var uid = localStorage.user_id;
  localStorage.clear();
  localStorage.setItem("user_id", uid);

  createCheckin(localStorage.user_id);

  navigator.geolocation.getCurrentPosition(setPingInterval, onError);

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
