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
        } else {
            document.getElementById('daily_breakfast').value = new Date($scope.data.breakfastTime).toLocaleTimeString();
            document.getElementById('daily_breakfast').type = 'time';
        }

    };

    $scope.toggleLunch = function() {
        $scope.disableLunch = !$scope.disableLunch;
        if($scope.disableLunch) {
            document.getElementById('daily_lunch').type = 'text';
            document.getElementById('daily_lunch').value = 'Overgeslagen';
        } else {
            document.getElementById('daily_lunch').value = new Date($scope.data.lunchTime).toLocaleTimeString();
            document.getElementById('daily_lunch').type = 'time';
        }

    };

    $scope.toggleDinner = function() {
        $scope.disableDinner = !$scope.disableDinner;
        if($scope.disableDinner) {
            document.getElementById('daily__dinner').type = 'text';
            document.getElementById('daily__dinner').value = 'Overgeslagen';
        } else {
            document.getElementById('daily__dinner').value = new Date($scope.data.dinnerTime).toLocaleTimeString();
            document.getElementById('daily__dinner').type = 'time';
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

    // check to see if there is already a diary entry for this date
    var diaryMap = dataService.getDiaryMap();
    $scope.data = {};
    var mapEntry = null;
    console.log(diaryMap);

    if(diaryMap !== null && diaryMap[datum] !== undefined) {
        mapEntry = JSON.parse(diaryMap[datum]);
    }

    if (mapEntry === null || mapEntry === undefined) {
        // no entry yet, so use the daily life values
        $scope.dailyLife = dataService.getDailyLife();

        $scope.data.breakfastTime = new Date($scope.dailyLife.breakfastTime);
        $scope.data.lunchTime = new Date($scope.dailyLife.lunchTime);
        $scope.data.dinnerTime = new Date($scope.dailyLife.dinnerTime);
        $scope.data.sportHours = new Date($scope.dailyLife.sportHours);
        $scope.data.bedTime = new Date($scope.dailyLife.bedTime);
        $scope.data.sleepHours = new Date($scope.dailyLife.sleepHours);
        $scope.data.alcohol = $scope.dailyLife.alcohol;
        $scope.data.cafeine = $scope.dailyLife.cafeine;
        $scope.data.tobacco = $scope.dailyLife.tobacco;
        $scope.data.stresslvl = 0;
    } else {
        // there is already an entry for this date, so reuse the data

        $scope.data.breakfastTime = new Date(mapEntry.breakfastTime);
        $scope.data.lunchTime = new Date(mapEntry.lunchTime);
        $scope.data.dinnerTime = new Date(mapEntry.dinnerTime);
        $scope.data.sportHours = new Date(mapEntry.sportHours);
        $scope.data.bedTime = new Date(mapEntry.bedTime);
        $scope.data.sleepHours = new Date(mapEntry.sleepHours);
        $scope.data.alcohol = mapEntry.alcohol;
        $scope.data.cafeine = mapEntry.cafeine;
        $scope.data.tobacco = mapEntry.tobacco;
        $scope.data.stresslvl = mapEntry.stresslvl;

        if(mapEntry.breakfastTime == null) {
            $scope.disableBreakfast = !$scope.disableBreakfast;
            document.getElementById('daily_breakfast').type = 'text';
            document.getElementById('daily_breakfast').value = 'Overgeslagen';
        }
    }


    $scope.submitDiary = function () {

        if($scope.disableBreakfast) $scope.data.breakfastTime = null;
        if($scope.disableLunch) $scope.data.lunchTime = null;
        if($scope.disableDinner) $scope.data.dinnerTime = null;

        var diary = {
            "date": datum,
            "sportHours": $scope.data.sportHours,
            "sleepHours": $scope.data.sleepHours,
            "bedTime": $scope.data.bedTime,
            "alcohol": $scope.data.alcohol,
            "tobacco": $scope.data.tobacco,
            "cafeine": $scope.data.cafeine,
            "breakfastTime": $scope.data.breakfastTime,
            "lunchTime": $scope.data.lunchTime,
            "dinnerTime": $scope.data.dinnerTime,
            "stresslvl": $scope.data.stresslvl
        };

        diaryMap[datum] = JSON.stringify(diary);
        dataService.setDiaryMap(diaryMap);
        location.href = "history.html";
    };



});



