/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();

// onSuccess Callback
// This method accepts a Position object, which contains the
// current GPS coordinates
//
var onSuccess = function(position) {
    
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

            //Geo-located marker based off phone
            var marker = new google.maps.Marker({
                position: {lat: position.coords.latitude , lng: position.coords.longitude},
                map: map,
                draggable: true,
                animation: google.maps.Animation.DROP,
                title: 'Welcome to my City!'
            }); 

            //Pulled from database
            $.ajax({
                method:     'GET',
                dataType:   'json',
                url: 'https://skipatrolproductiondatabase.herokuapp.com/groups/1/skiers/current_checkin/pings/last',
                success: function(response) {
                    var image = 'img/skiing.svg' //Oddly, my custom images don't work.
                    for(var i = 0; i<response[0].length; i++) {
                        var groupMarker = new google.maps.Marker({
                            position: {lat: response[0][i].lat , lng: response[0][i].long},
                            map: map,
                            icon: image
                            // icon: image
                            // This doesn't work yet!
                            // map_icon_label: '<span class="map-icon map-icon-skiing"></span>'       
                        }); 
                    }      
                }       
            });
        }
    });
};

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}


// navigator.geolocation.getCurrentPosition(onSuccess, onError);



