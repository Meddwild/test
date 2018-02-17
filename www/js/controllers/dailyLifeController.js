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

}]).controller('dailyLifeController', function ($scope, dataService, $http) {
    app.initialize();

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

    $scope.user = dataService.getCurrentUser();
    console.info($scope.user);

    $scope.transition = function () {
        //console.log($("body").children());
        $("body").children().eq(0).show();
        $('body').children().eq(1).hide();
    };

    $scope.showMenstruation = function() {
        return ! $scope.user.sex;
    };

    $scope.showACTInfo = function() {
        alert(" Alcohol: Aantal glazen bier van 25 cl \n Koffie: Aantal koppen van 20 cl \n Tabak: Aantal sigaretten");
    }

    var datum = new Date();
    $scope.city = "Gent";
    $scope.sportHours = new Date(datum.setHours(00,30,0,0));
    $scope.endSleep = new Date(datum.setHours(6,30,0,0));
    $scope.breakfastTime = new Date(datum.setHours(8,30,0,0));
    $scope.lunchTime = new Date(datum.setHours(12,0,0,0));
    $scope.dinnerTime = new Date(datum.setHours(18,30,0,0));
    $scope.beginSleep = new Date(datum.setHours(22,30,0,0));
    $scope.alcohol = 0;
    $scope.cafeine = 0;
    $scope.tobacco = 0;
    $scope.depression = false;
    $scope.menstruationDate = datum;
    $scope.menstruationDuration = 28;

    $scope.submitDailyLife = function () {

        dataService.setDailyLife($scope.city, $scope.sportHours, $scope.endSleep, $scope.beginSleep, $scope.alcohol, $scope.tobacco, $scope.cafeine, $scope.breakfastTime, $scope.lunchTime, $scope.dinnerTime, $scope.depression, $scope.menstruationDate, $scope.menstruationDuration);

        // update user with dailylife
        var user = {
            "firstName": $scope.user.firstname,
            "lastName": $scope.user.lastname,
            "birthDate": $scope.user.birthdate,
            "email": sha3_512($scope.user.email),
            "password": $scope.user.passwordHash,
            "isMale": $scope.user.sex,
            "relation": $scope.user.status.toUpperCase(),
            "advice": dataService.getAdvice(),
            "isEmployed": $scope.user.employment,
            "diagnosis": "",
            "patientID": $scope.user.patientID,
            "city": $scope.city,
            "sportHours": $scope.sportHours,
            "endSleep": $scope.endSleep,
            "beginSleep": $scope.beginSleep,
            "alcohol": $scope.alcohol,
            "tobacco": $scope.tobacco,
            "cafeine": $scope.cafeine,
            "breakfastTime": $scope.breakfastTime,
            "lunchTime": $scope.lunchTime,
            "dinnerTime": $scope.dinnerTime,
            "depression": $scope.depression,
            "menstruationDate": $scope.menstruationDate,
            "menstruationDuration": $scope.menstruationDuration
        };

        console.log(JSON.stringify(user));


        $http.post('http://tw06v033.ugent.be/Chronic1/rest/PatientService/patients/update', JSON.stringify(user), {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': dataService.getAuthorization()
            }
        }).
        success(function (data, status, headers, config) {
            location.href = "dashboard.html";
        }).
        error(function (data, status, headers, config) {
            $scope.foutmelding = "Geen verbinding met de REST service";
            console.log(status);
            console.log(data);
            $('.error').show();
        });
    };
});