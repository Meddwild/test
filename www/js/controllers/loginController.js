/*!
 Chronicals, v1.0
 Created by Kiani Lannoye & Gilles Vandewiele, commissioned by UZ Ghent
 https://github.com/kianilannoye/Chronicals

 */

angular.module('Chronic').controller('loginController', function ($scope, dataService, backgroundservice, $http, $q) {


    var VERSION_NUMBER = '1.0';
    var googleResponse;

    ons.ready(function () {
        $('.hidden').removeClass("hidden");
        $('#loadingImg').hide();
        ons.disableDeviceBackButtonHandler();
        document.addEventListener("deviceready", onDeviceReady, false);

        // device APIs are available
        function onDeviceReady() {
            document.addEventListener("backbutton", onBackKeyPress, false);
            backgroundservice.start();
            var diaries = dataService.getDiaryMap();
        }

        function onBackKeyPress(e) {
            e.preventDefault();
        }
    });

    $scope.transition = function () {
        $("body").children().eq(0).show();
        $('body').children().eq(1).hide();
    };

    $scope.email = dataService.getEmail();
    if ($scope.email != null) {
        $scope.email = $scope.email.toLowerCase();
    }

    $scope.password = "";

    //Focus on the correct field
    $('#login__password').focus();

    var array_compare = function (array1, array2) {
        return (array1.length == array2.length) && array1.every(function (element, index) {
            return element === array2[index];
        });
    };

    var checkVersion = function () {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", "http://tw06v033.ugent.be/Chronic1/rest/VersionService/version", false); // false for synchronous request
        xmlHttp.send(null);
        return xmlHttp.responseText;
    };

    $scope.setNotifications = function () {
        cordova.plugins.notification.local.schedule([
            {
                id: 1,
                title: 'Vergeet uw dagboek niet in te vullen',
                text: 'Vult u even uw dagboek in? Zo kunnen we u nog beter helpen.',
                trigger: {every: {hour: 21, minute: 0}},
                foreground: true,
                sound: null
            }
        ]);
    };

    $scope.googleLogout = function () {
        window.plugins.googleplus.disconnect(
            function (msg) {
                console.log("succesfully logged out");
            },
            function (msg) {
                console.log("there was an error logging out");
            }
        );
    };

    $scope.submitLogin = function () {

        window.plugins.googleplus.login(
            {
                'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.activity.write https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.body.write https://www.googleapis.com/auth/fitness.location.read https://www.googleapis.com/auth/fitness.location.write https://www.googleapis.com/auth/fitness.nutrition.read https://www.googleapis.com/auth/fitness.nutrition.write',
                'webClientId': '175384751988-oh6m3dr3hg6i2ou68svi1rj7145lo4hf', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                'offline': true
            },
            function (obj) {
                // send response to the server
                console.info(obj);
                // handle ugent login
                googleResponse = obj;
                dataService.setGoogleResponse(obj);
                // dataService.sendGoogleResponseToDB(obj);
                $scope.email = obj.email;
                $scope.handleUGentLogin();
            },
            function (msg) {
                $scope.email = dataService.getEmail();
                $scope.handleUGentLogin();
            }
        );
    };

    $scope.handleUGentLogin = function () {
        backgroundservice.getHistory();
        var pwHash = sha3_512($scope.password);
        //try to login
        //retrieve user
        dataService.registerUser("", "", null, true, null, true, $scope.email.toLowerCase(), sha3_512($scope.password), 0);
        // We can't use getAuthorization yet from the dataservice since no user is registered yet.
        //dataService.getDBStatus().then(function(result){
        //var test = [$http.get('http://tw06v033.ugent.be/Chronic1/rest/PatientService/login', {headers: {'Authorization': dataService.getAuthorization()}})]
        //$q.all(test).then(function () {
//
  //          }
    //    );
        $http.get('http://tw06v033.ugent.be/Chronic1/rest/PatientService/login', {headers: {'Authorization': dataService.getAuthorization()}}).success(function (data, status, headers, config) {


            var user = data;
            console.log(user);

            dataService.setAdvice(data.advice);
            dataService.registerUser(user.firstName, user.lastName, user.birthDate, user.isMale, user.relation, user.isEmployed, $scope.email.toLowerCase(), sha3_512($scope.password), user.patientID);
            dataService.sendGoogleResponseToDB(googleResponse);
            dataService.sendNewHeadachesToDB();
            dataService.sendNewMedicinesToDB();
            dataService.sendNewDiariesToDB();
            dataService.sendNewLocationsToDB();
            $scope.setNotifications();

            dataService.syncDB().then(function (result) {
                $scope.transition();
                // daily life is already filled in, no need to ask it again
                if (dataService.getDailyLife() == null) {
                    location.href = "dailyLife.html";
                } else {
                    location.href = "dashboard.html";
                }
                console.log(checkVersion());
                if (VERSION_NUMBER != checkVersion()) {
                    alert("Er is een nieuwe versie beschikbaar op https://build.phonegap.com/apps/1669916/builds");
                }
            }, function (data, status, headers, config) {
                alert("Er is een fout opgetreden... ");
            });

        }).error(function (data, status, headers, config) {
            if (status == 0) {
                alert("U bent niet verbonden met het internet, of de server is offline. U werkt nu verder met lokale gegevens tot u opnieuw verbinding met de server heeft ");
                if (dataService.getCurrentUser() == null || dataService.getCurrentUser().passwordHash == null || dataService.getCurrentUser().passwordHash.length < 1) {
                    alert("Er is lokaal nog geen gebruiker ingesteld. Verbind eerst met het internet en probeer in te loggen ");
                } else {
                    if (dataService.getCurrentUser().passwordHash == pwHash.toString() && dataService.getCurrentUser().email == $scope.email.toLowerCase()) {
                        $scope.transition();
                        location.href = "dashboard.html";
                    } else {
                        $(".error_message").show();
                    }
                }
            } else {
                alert("Er is een fout opgetreden, probeer opnieuw... " + status)
            }
        });
    };

});
