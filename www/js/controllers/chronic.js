/*!
 Chronicals, v1.0
 Created by Kiani Lannoye & Gilles Vandewiele, commissioned by UZ Ghent
 https://github.com/kianilannoye/Chronicals

 This file contains the main objects.
 */


var app = angular.module('Chronic', ['onsen.directives', 'ngStorage', "chart.js"])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common["X-Requested-With"];
        $httpProvider.defaults.headers.common["Accept"] = "application/json";

        $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
        $httpProvider.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
        $httpProvider.defaults.headers.common = {};
        $httpProvider.defaults.headers.post = {};
        $httpProvider.defaults.headers.put = {};
        $httpProvider.defaults.headers.patch = {};
    }]);


