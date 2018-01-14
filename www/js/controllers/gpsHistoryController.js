/*!
 Chronicals, v1.0
 Created by Kiani Lannoye & Gilles Vandewiele, commissioned by UZ Ghent
 https://github.com/kianilannoye/Chronicals

 */

angular.module('Chronic').controller('gpsHistoryController', function ($scope, dataService, backgroundservice, $http, $q) {

    ons.ready(function () {
        $('.hidden').removeClass("hidden");
        $('#loadingImg').hide();
        ons.disableDeviceBackButtonHandler();
        document.addEventListener("deviceready", onDeviceReady, false);

        // device APIs are available
        function onDeviceReady() {
            document.addEventListener("backbutton", onBackKeyPress, false);
            backgroundservice.getHistory();
        }

        function onBackKeyPress(e) {
            e.preventDefault();
        }
    });

    $scope.gpsList = backgroundservice.getGPSList();

    $scope.getTimeDateString = function (timestamp) {
        var datum = new Date(timestamp);
        return "" + (datum.getDate()) + "/" + (datum.getMonth() + 1) + " " + (datum.getHours() < 10 ? '0' : '') + datum.getHours() + ":" + (datum.getMinutes() < 10 ? '0' : '') + datum.getMinutes();
    };

    $scope.deleteGPSLocations = function() {
        backgroundservice.deleteHistory();
    };
});
