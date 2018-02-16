/*!
 Chronicals, v2.0
 Created by Mitch De Wilde, commissioned by UZ Ghent
 https://github.ugent.be/Chronicals

 This file contains the controller for the diary views.
 */


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
}]).controller("diaryController", function ($scope, dataService) {

    var months = ["jan.", "feb.", "mrt.", "apr.", "mei", "jun.", "jul.", "aug.", "sept.", "okt.", "nov.", "dec."];

    $scope.transition = function () {
        $("body").children().eq(0).show();
        $('body').children().eq(1).hide();
    };

    // code to toggle the mealtimes
    $scope.disableBreakfast = false;
    $scope.disableLunch = false;
    $scope.disableDinner = false;

    $scope.toggleBreakfast = function() {
        $scope.disableBreakfast = !$scope.disableBreakfast;
        if($scope.disableBreakfast) {
            document.getElementById('daily_breakfast').type = 'text';
            document.getElementById('daily_breakfast').value = 'Overgeslagen';
            document.getElementById('daily_breakfast').disabled = true;
        } else {
            document.getElementById('daily_breakfast').value = new Date($scope.data.breakfastTime).toLocaleTimeString();
            document.getElementById('daily_breakfast').type = 'time';
            document.getElementById('daily_breakfast').disabled = false;
        }

    };

    $scope.toggleLunch = function() {
        $scope.disableLunch = !$scope.disableLunch;
        if($scope.disableLunch) {
            document.getElementById('daily_lunch').type = 'text';
            document.getElementById('daily_lunch').value = 'Overgeslagen';
            document.getElementById('daily_lunch').disabled = true;
        } else {
            document.getElementById('daily_lunch').value = new Date($scope.data.lunchTime).toLocaleTimeString();
            document.getElementById('daily_lunch').type = 'time';
            document.getElementById('daily_lunch').disabled = false;
        }

    };

    $scope.toggleDinner = function() {
        $scope.disableDinner = !$scope.disableDinner;
        if($scope.disableDinner) {
            document.getElementById('daily__dinner').type = 'text';
            document.getElementById('daily__dinner').value = 'Overgeslagen';
            document.getElementById('daily__dinner').disabled = true;
        } else {
            document.getElementById('daily__dinner').value = new Date($scope.data.dinnerTime).toLocaleTimeString();
            document.getElementById('daily__dinner').type = 'time';
            document.getElementById('daily__dinner').disabled = false;
        }

    };

    ons.ready(function () {
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

    var datum = new Date(dataService.getCurrentDiaryDate());
    $scope.getDateString = function(){
        return ""+(datum.getDate())+" "+months[datum.getMonth()]+" "+datum.getFullYear();
    };
    var datumindex = datum.getDate()+"/"+(datum.getMonth()+1)+"/"+datum.getFullYear();

    // check to see if there is already a diary entry for this date
    var diaryMap = dataService.getDiaryMap();
    $scope.data = {};
    var mapEntry = null;
    console.log(diaryMap);

    if(diaryMap !== null && diaryMap[datumindex] !== undefined) {
        mapEntry = JSON.parse(diaryMap[datumindex]);
    }

    if (mapEntry === null || mapEntry === undefined) {
        // no entry yet, so use the daily life values
        $scope.dailyLife = dataService.getDailyLife();

        $scope.data.breakfastTime = new Date($scope.dailyLife.breakfastTime);
        $scope.data.lunchTime = new Date($scope.dailyLife.lunchTime);
        $scope.data.dinnerTime = new Date($scope.dailyLife.dinnerTime);
        $scope.data.sportHours = new Date($scope.dailyLife.sportHours);
        $scope.data.beginSleep = new Date($scope.dailyLife.beginSleep);
        $scope.data.endSleep = new Date($scope.dailyLife.endSleep);
        $scope.data.alcohol = $scope.dailyLife.alcohol;
        $scope.data.cafeine = $scope.dailyLife.cafeine;
        $scope.data.tobacco = $scope.dailyLife.tobacco;
        $scope.data.stresslvl = 0;
    } else {
        // there is already an entry for this date, so reuse the data
        if(mapEntry.breakfastTime === "null") {
            $scope.disableBreakfast = true;
            $scope.data.breakfastTime = null;
        } else {
            $scope.data.breakfastTime = new Date(mapEntry.breakfastTime);
        }
        if(mapEntry.lunchTime === "null") {
            $scope.disableLunch = true;
            $scope.data.lunchTime = null;
        } else {
            $scope.data.lunchTime = new Date(mapEntry.lunchTime);
        }
        if(mapEntry.dinnerTime === "null") {
            $scope.disableDinner = true;
            $scope.data.dinnerTime = null;
        } else {
            $scope.data.dinnerTime = new Date(mapEntry.dinnerTime);
        }
        $scope.data.lunchTime = new Date(mapEntry.lunchTime);
        $scope.data.dinnerTime = new Date(mapEntry.dinnerTime);
        $scope.data.sportHours = new Date(mapEntry.sportHours);
        $scope.data.beginSleep = new Date(mapEntry.beginSleep);
        $scope.data.endSleep = new Date(mapEntry.endSleep);
        $scope.data.alcohol = mapEntry.alcohol;
        $scope.data.cafeine = mapEntry.cafeine;
        $scope.data.tobacco = mapEntry.tobacco;
        $scope.data.stresslvl = mapEntry.stresslvl;

        if(mapEntry.breakfastTime == null) {
            $scope.disableBreakfast = !$scope.disableBreakfast;
            document.getElementById('daily_breakfast').type = 'text';
            document.getElementById('daily_breakfast').value = 'Overgeslagen';
        }
        if(mapEntry.lunchTime == null) {
            $scope.disableLunch = !$scope.disableLunch;
            document.getElementById('daily_lunch').type = 'text';
            document.getElementById('daily_lunch').value = 'Overgeslagen';
        }
        if(mapEntry.dinnerTime == null) {
            $scope.disableDinner = !$scope.disableDinner;
            document.getElementById('daily_dinner').type = 'text';
            document.getElementById('daily_dinner').value = 'Overgeslagen';
        }
    }


    $scope.submitDiary = function () {

        if($scope.disableBreakfast) $scope.data.breakfastTime = "null";
        if($scope.disableLunch) $scope.data.lunchTime = "null";
        if($scope.disableDinner) $scope.data.dinnerTime = "null";

        var diary = {
            "date": datum,
            "sportHours": $scope.data.sportHours,
            "endSleep": $scope.data.endSleep,
            "beginSleep": $scope.data.beginSleep,
            "alcohol": $scope.data.alcohol,
            "tobacco": $scope.data.tobacco,
            "cafeine": $scope.data.cafeine,
            "breakfastTime": $scope.data.breakfastTime,
            "lunchTime": $scope.data.lunchTime,
            "dinnerTime": $scope.data.dinnerTime,
            "stresslvl": $scope.data.stresslvl
        };

        diaryMap[datumindex] = JSON.stringify(diary);
        dataService.setDiaryMap(diaryMap);
        console.log(diary);
        location.href = "history.html";
    };



});



