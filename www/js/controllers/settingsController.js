/*!
 Chronicals, v1.0
 Created by Kiani Lannoye & Gilles Vandewiele, commissioned by UZ Ghent
 https://github.com/kianilannoye/Chronicals

 This file contains the controller for the history views.
 */


angular.module('Chronic').controller("settingsController", function($scope, dataService, backgroundservice) {

    ons.ready(function() {
        $('.hidden').removeClass("hidden");
        $('#loadingImg').hide();
        ons.disableDeviceBackButtonHandler();
        document.addEventListener("deviceready", onDeviceReady, false);

        // device APIs are available
        //
        function onDeviceReady() {
            document.addEventListener("backbutton", onBackKeyPress, false);
        }
        function onBackKeyPress(e) {
            e.preventDefault();

        }
    });

    $scope.transition = function(){
        //console.log($("body").children());
        $("body").children().eq(0).show();
        $('body').children().eq(1).hide();
    };


    $scope.alert = function() {
        ons.notification.alert({
            title: 'Succes!',
            message: 'Cache en data zijn gewist!'
        });
    };

    $scope.clearCache = function(){
        console.log("Clearing cache: ");

        dataService.clearCache();
        $scope.alert();

        location.href='login.html';

    };

    $scope.stopGPSLocationTracking = function() {
        backgroundservice.stop();
    };

    $scope.fillEvents = function(){
        dataService.addHeadache({intensityValues: [{key: new Date(2015, 9, 25, 10, 00, 00,00)        , value:8},
            {key: new Date(2015, 9, 25, 10, 30, 00,00)        , value:6},
            {key: new Date(2015, 9, 25, 11, 30, 00,00)        , value:4},
            {key: new Date(2015, 9, 25, 11, 00, 00,00)        , value:8},
            {key: new Date(2015, 9, 25, 12, 30, 00,00)        , value:2}
        ],
            end: new Date(2015, 9, 25, 13, 00, 00,00), location: null, triggers: [], symptoms: []});
        dataService.addHeadache({intensityValues: [{key: new Date(2015, 9, 24, 10, 00, 00,00)        , value:8},
            {key: new Date(2015, 9, 24, 10, 30, 00,00)        , value:6},
            {key: new Date(2015, 9, 24, 11, 30, 00,00)        , value:4},
            {key: new Date(2015, 9, 24, 11, 00, 00,00)        , value:8},
            {key: new Date(2015, 9, 24, 12, 30, 00,00)        , value:2}
        ],
            end: new Date(2015, 9, 24, 13, 00, 00,00), location: null, triggers: [], symptoms: []});
        dataService.addHeadache({intensityValues: [{key: new Date(2015, 9, 23, 10, 00, 00,00)        , value:8},
            {key: new Date(2015, 9, 23, 10, 30, 00,00)        , value:6},
            {key: new Date(2015, 9, 23, 11, 30, 00,00)        , value:4},
            {key: new Date(2015, 9, 23, 11, 00, 00,00)        , value:8},
            {key: new Date(2015, 9, 23, 12, 30, 00,00)        , value:2}
        ],
            end: new Date(2015, 9, 23, 13, 00, 00,00), location: null, triggers: [], symptoms: []});

        ons.notification.alert({
            title: 'Succes!',
            message: 'Mockup data is toegevoegd!'
        });
    }




});


//window.onload = $scope.fillEvents;
//});



