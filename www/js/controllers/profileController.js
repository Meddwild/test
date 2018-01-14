/*!
 Chronicals, v1.0
 Created by Kiani Lannoye & Gilles Vandewiele, commissioned by UZ Ghent
 https://github.com/kianilannoye/Chronicals

 This file contains the controller to add and modify headaches.
 */


angular.module('Chronic').controller('profileController', function($scope, dataService, $http){

    $scope.dailyMedicines = dataService.getDailyMedicines();
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


    $scope.deleteEntry = function(item){
        $scope.dailyMedicines.splice($scope.dailyMedicines.indexOf(item), 1);
        dataService.setDailyMedicineList($scope.dailyMedicines)
    };

    $scope.user = dataService.getCurrentUser();
    $scope.dailyLife = dataService.getDailyLife();
    console.info($scope.dailyLife);

    if($scope.user != null) {
        $scope.data = {oldPin: "", newPin1: "", newPin2: "", birthdate: new Date(), relationship: "", employment: "", sex: ""};

        $scope.data.sexes = ["Man", "Vrouw"];
        if ($scope.user.sex) $scope.data.sex = $scope.data.sexes[0];
        else $scope.data.sex = $scope.data.sexes[1];

        $scope.data.birthdate = new Date($scope.user.birthdate);

        $scope.data.relationships = ["Vrijgezel", "In relatie", "Getrouwd"];
        console.log("USER STATUS = ", $scope.user.status);
        if ($scope.user.status == "VRIJGEZEL") $scope.data.relationship = $scope.data.relationships[0];
        else if ($scope.user.status == "GETROUWD") $scope.data.relationship = $scope.data.relationships[2];
        else $scope.data.relationship = $scope.data.relationships[1];

        $scope.data.employments = ["Werkende", "Niet-werkende"];
        if ($scope.user.employment) $scope.data.employment = $scope.data.employments[0];
        else $scope.data.employment = $scope.data.employments[1];

        $scope.parsedDate = new Date($scope.user.birthdate);
        //TODO parse this date and init the model of the date picker

        $scope.data.breakfastTime = new Date($scope.dailyLife.breakfastTime);
        $scope.data.lunchTime = new Date($scope.dailyLife.lunchTime);
        $scope.data.dinnerTime = new Date($scope.dailyLife.dinnerTime);
        $scope.data.sportHours = new Date($scope.dailyLife.sportHours);
        $scope.data.sleepHours = new Date($scope.dailyLife.sleepHours);
        $scope.data.bedTime = new Date($scope.dailyLife.bedTime);

    };
    console.log($scope.user);

    $scope.saveUser = function(){
        // If oldPin is not null, then the user wants to change his password
        console.log($scope.data.oldPin);
        if($scope.data.oldPin != ""){
            console.log("Saving new user...", $scope.data.oldPin);
            console.log(sha3_512($scope.data.oldPin));
            console.log($scope.user.passwordHash);
            if(sha3_512($scope.data.oldPin) != $scope.user.passwordHash || $scope.newPin1 != $scope.newPin2){
                $scope.foutmelding = "Uw oude PIN is incorrect of uw nieuwe PIN codes komen niet overeen";
                $('.error').show();
            } else {
                $scope.user = {
                    "firstName": $scope.user.firstname,
                    "lastName": $scope.user.lastname,
                    "birthDate": $scope.data.birthdate,
                    "email": sha3_512($scope.user.email),
                    "password": "" + sha3_512($scope.data.newPin1),
                    "isMale": ($scope.data.sex == "Man"),
                    "relation": $scope.data.relationship.toUpperCase(),
                    "advice": dataService.getAdvice(),
                    "isEmployed": ($scope.data.employment == "Werkende"),
                    "diagnosis": "",
                    "patientID": $scope.user.patientID,
                    "city": $scope.dailyLife.city,
                    "sportHours": $scope.data.sportHours,
                    "sleepHours": $scope.data.sleepHours,
                    "bedTime": $scope.data.bedTime,
                    "alcohol": $scope.dailyLife.alcohol,
                    "tobacco": $scope.dailyLife.tobacco,
                    "cafeine": $scope.dailyLife.cafeine,
                    "breakfastTime": $scope.data.breakfastTime,
                    "lunchtime": $scope.data.lunchTime,
                    "dinnerTime": $scope.data.dinnerTime
                };
                $http.post('http://tw06v033.ugent.be/Chronic/rest/PatientService/patients/update', JSON.stringify(user), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': dataService.getAuthorization()
                    }
                }).
                success(function (data, status, headers, config) {
                    console.log("Return van indienen user:" + status);
                    console.log(data);
                    dataService.registerUser(user.firstName, user.lastName, user.birthDate, user.isMale, user.relation, user.isEmployed, $scope.user.email, user.password, user.patientID);
                    location.reload();
                }).
                error(function (data, status, headers, config) {
                    console.log("error creating user: " + status);
                    console.log("data:" + data);
                    $scope.foutmelding = "Geen verbinding met de REST service";
                    $('.error').show();
                });
            }
        } else if($scope.data.newPin1 != "" || $scope.data.newPin2 != ""){
            $scope.foutmelding = "U moet uw oude PIN ingeven";
            $('.error').show();
        }
        else {
            $scope.user = {
                "firstName": $scope.user.firstname,
                "lastName": $scope.user.lastname,
                "birthDate": $scope.data.birthdate,
                "email": sha3_512($scope.user.email),
                "password": $scope.user.passwordHash,
                "isMale": ($scope.data.sex == "Man"),
                "relation": $scope.data.relationship.toUpperCase(),
                "advice": dataService.getAdvice(),
                "isEmployed": ($scope.data.employment == "Werkende"),
                "diagnosis": "",
                "patientID": $scope.user.patientID,
                "city": $scope.dailyLife.city,
                "sportHours": $scope.data.sportHours,
                "sleepHours": $scope.data.sleepHours,
                "bedTime": $scope.data.bedTime,
                "alcohol": $scope.dailyLife.alcohol,
                "tobacco": $scope.dailyLife.tobacco,
                "cafeine": $scope.dailyLife.cafeine,
                "breakfastTime": $scope.data.breakfastTime,
                "lunchtime": $scope.data.lunchTime,
                "dinnerTime": $scope.data.dinnerTime
            };
            dataService.setDailyLife(user.city,user.sportHours, user.sleepHours, user.bedTime, user.alcohol, user.tobacco, user.cafeine,user.breakfastTime, user.lunchtime, user.dinnerTime);
            $http.post('http://tw06v033.ugent.be/Chronic/rest/PatientService/patients/update', JSON.stringify(user), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': dataService.getAuthorization()
                }
            }).
            success(function (data, status, headers, config) {
                console.log("Return van indienen user:" + status);
                console.log(data);
                dataService.registerUser(user.firstName, user.lastName, user.birthDate, user.isMale, user.relation, user.isEmployed, $scope.user.email, user.password, user.patientID);
                location.reload();
            }).
            error(function (data, status, headers, config) {
                console.log("error creating user: " + status);
                console.log("data:" + data);
                $scope.foutmelding = "Geen verbinding met de REST service";
                $('.error').show();
            });

        }
        console.log(user);
    };
});

