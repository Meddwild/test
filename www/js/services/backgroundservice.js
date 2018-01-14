angular.module('Chronic').config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
    $httpProvider.defaults.headers.common["Accept"] = "application/json";

    $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
    $httpProvider.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};
}]).service('backgroundservice', function ($http, $q) {

    var gpsList = [];

    var setGPSList = function (newObj) {
        localStorage.setItem("gpsList", JSON.stringify(newObj));
        gpsList = newObj;
    };

    var getGPSList = function () {
        return JSON.parse(localStorage.getItem("gpsList"));
    };

    var addGPSLocation = function (newObj) {
        if (JSON.parse(localStorage.getItem("gpsList")) != null) {
            gpsList = JSON.parse(localStorage.getItem("gpsList"));
            gpsList.push(newObj);
            localStorage.setItem("gpsList", JSON.stringify(gpsList));
        }
        else {
            localStorage.setItem("gpsList", JSON.stringify([newObj]));
            gpsList = [newObj];
        }
    };

    var getHistory = function() {
        backgroundGeoLocation.getLocations(
            function (locations) {
                setGPSList(locations);
            }
        );
    };

    var deleteHistory = function() {
        backgroundGeoLocation.deleteAllLocations(
            function () {
                setGPSList([]);
            }
        );
    }

    var callbackFn = function(location) {
            //postLocation(location);
            backgroundGeoLocation.finish();
        },
        failureFn = function(error) {
            console.log('BackgroundGeoLocation ' + JSON.stringify(error));
        },

        //Enable background geolocation
        start = function () {
            //save settings (background tracking is enabled) in local storage
            window.localStorage.setItem('bgGPS', 1);
            backgroundGeoLocation.configure(callbackFn, failureFn, {
                desiredAccuracy: 10,
                stationaryRadius: 20,
                distanceFilter: 30,
                locationProvider: 'ANDROID_DISTANCE_FILTER',
                interval: 300000,
                fastestInterval: 150000,
                stopOnStillActivity: false,
                debug: false,
                stopOnTerminate: false,
                startOnBoot: true,
                notificationTitle: "Chronicals",
                notificationText: "Wij houden momenteel uw locatie bij",
                notificationIconColor: "#606468",
                notificationIconLarge: "icon"
            });
            backgroundGeoLocation.start();
        };
    // Send location to a backend server, e.g. for location tracking
    postLocation = function post(location) {
        return $http(
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                url: 'http://<location server DNS>/location',
                data: {
                    lat : location.latitude,
                    lng : location.longitude
                }
            }).then(function (response) {
            return response.data;
        });
    }

    return {
        start: start,
        // Stop data tracking
        // Initialize service and enable background geolocation by default
        init: function () {
            var bgGPS = window.localStorage.getItem('bgGPS');
            if (bgGPS == 1 || bgGPS == null) {
                start();
            }
        },
        stop: function () {
            window.localStorage.setItem('bgGPS', 0);
            backgroundGeoLocation.stop();
        },

        setGPSList: setGPSList,
        getGPSList: getGPSList,
        addGPSLocation: addGPSLocation,
        getHistory: getHistory,
        deleteHistory: deleteHistory
    };

});
