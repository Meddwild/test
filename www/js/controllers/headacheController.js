/*!
 Chronicals, v1.0
 Created by Kiani Lannoye & Gilles Vandewiele, commissioned by UZ Ghent
 https://github.com/kianilannoye/Chronicals

 This file contains the controller to add and modify headaches.
 */

angular.module('Chronic').filter('unsafe', function ($sce) {
    return $sce.trustAsHtml;
}).controller('headacheController', function ($scope, dataService, $http) {

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

    $scope.transition = function () {
        $("body").children().eq(0).show();
        $('body').children().eq(1).hide();
    };


    $scope.locations = {
        "mandibular_right": false,
        "mandibular_left": false,
        "maxillar_right": false,
        "maxillar_left": false,
        "orbital_right": false,
        "orbital_left": false,
        "frontal_right": false,
        "frontal_mid": false,
        "frontal_left": false,
        "parietal_right": false,
        "parietal_mid": false,
        "parietal_left": false,
        "temporal_right": false,
        "temporal_left": false,
        "occipital_right": false,
        "occipital_mid": false,
        "occipital_left": false,
        "cervical_right": false,
        "cervical_mid": false,
        "cervical_left": false
    };

    $scope.advices = [

        "Geen pijn<br/><br/>" +
        "Geen hoofdpijn",

        "Heel milde pijn<br/><br/>" +
        "Geen afleiding bij gewoonlijke activiteiten",

        "Milde pijn<br/><br/>" +
        "Gewoonlijke activiteiten nog mogelijk<br/><br/>" +
        "Kunnen moeilijker zijn<br/><br/>",

        "Afleidende pijn<br/><br/>" +
        "Gewoonlijke activiteiten nog mogelijk<br/><br/>" +
        "/moeilijker zijn<br/><br/>",

        "Milde-middelmatige pijn<br/><br/>" +
        "Gewoonlijke activiteiten worden moelijker<br/><br/>",

        "Middelmatige pijn<br/><br/>" +
        "Nood om het wat rustiger aan te doen<br/><br/>" +
        "De pijn leidt meer af<br/><br/>",

        "Middelhoge pijn<br/><br/>" +
        "Limiteert dagelijkse activiteiten<br/><br/>" +
        "Sommige activiteiten krijgen lagere prioriteit<br/><br/>",

        "Hoge pijn<br/><br/>" +
        "Moeilijk om zich te concentreren<br/><br/>" +
        "Moeilijk om dagelijkste activiteiten uit te voeren<br/><br/>",

        "Hevige pijn<br/><br/>" +
        "Verhindert normale activiteiten<br/><br/>" +
        "rust aangeraden<br/><br/>",

        "Heel hevige pijn<br/><br/>" +
        "Mogelijk niet helder denken of spreken<br/><br/>" +
        "Mogelijk niet normaal functioneren<br/><br/>" +
        "bedrust aangeraden"
        ,

        "Hoogst mogelijke pijn<br/><br/>" +
        "onmogelijk om normaal te functioneren<br/><br/>" +
        "grootste indenkbare pijn<br/><br/>" +
        "bedrust aangeraden"];


    $scope.description = $scope.advices[$scope.intensityValue];
    $scope.loadAreas = function () {
        $('#img_location1').mapster(
            {
                mapKey: 'data-key',
                fillOpacity: 0.4,
                fillColor: "009999",
                stroke: true,
                strokeColor: "0066FF",
                strokeOpacity: 0.8,
                strokeWidth: 1,
                onClick: function (e) {
                    $('img').mapster('set', !$scope.headache.location[e.key], e.key);
                    $('#img_location1').mapster('set', $scope.headache.location[e.key], e.key);
                    $scope.headache.location[e.key] = !$scope.headache.location[e.key];
                }
            });

        $('#img_location2').mapster(
            {
                mapKey: 'data-key',
                fillOpacity: 0.4,
                fillColor: "009999",
                stroke: true,
                strokeColor: "0066FF",
                strokeOpacity: 0.8,
                strokeWidth: 1,
                onClick: function (e) {
                    $('img').mapster('set', !$scope.headache.location[e.key], e.key);
                    $('#img_location2').mapster('set', $scope.headache.location[e.key], e.key);
                    $scope.headache.location[e.key] = !$scope.headache.location[e.key];
                }
            });

        $('#img_location3').mapster(
            {
                mapKey: 'data-key',
                fillOpacity: 0.4,
                fillColor: "009999",
                stroke: true,
                strokeColor: "0066FF",
                strokeOpacity: 0.8,
                strokeWidth: 1,
                onClick: function (e) {
                    $('img').mapster('set', !$scope.headache.location[e.key], e.key);
                    $('#img_location3').mapster('set', $scope.headache.location[e.key], e.key);
                    $scope.headache.location[e.key] = !$scope.headache.location[e.key];
                }
            });

        $('#img_location4').mapster(
            {
                mapKey: 'data-key',
                fillOpacity: 0.4,
                fillColor: "009999",
                stroke: true,
                strokeColor: "0066FF",
                strokeOpacity: 0.8,
                strokeWidth: 1,
                onClick: function (e) {
                    $('img').mapster('set', !$scope.headache.location[e.key], e.key);
                    $('#img_location4').mapster('set', $scope.headache.location[e.key], e.key);
                    $scope.headache.location[e.key] = !$scope.headache.location[e.key];
                }
            });

        $scope.setAreas();
    };

    $scope.headache = dataService.getCurrentHeadache();

    //console.log($scope.headache);

    if ($scope.headache == null) {
        $scope.headache = {
            id: -1,
            intensityValues: [],
            end: null,
            location: $scope.locations,
            triggers: dataService.getTriggers(),
            symptoms: dataService.getSymptoms()
        };
    }



    $scope.categories = dataService.getCategories();
    console.log("We hebben de volgende categorieen:" + $scope.categories);

    $scope.setEnd = function (endDate, endTime) {
        //console.log(endDate, endTime);
        if (endDate != null && endTime != null) {
            $scope.headache.end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), endTime.getHours(), endTime.getMinutes(), endTime.getSeconds());
        }
        //console.log("nieuw eind =", $scope.headache.end);
    };

    $scope.setAreas = function(){
        //console.log("setting areas..");
            if($scope.headache.location != null){
                for (var loc in $scope.headache.location) {
                    //console.log("teset1");
                    if ($scope.headache.location.hasOwnProperty(loc) && $scope.headache.location[loc]) {
                        //console.log("test21");
                        $('img').mapster('set', $scope.headache.location[loc], loc);
                    }
                }
            }
    };

    $scope.setAreas();

    if ($scope.headache != null) {
        if ($scope.headache.end != null) {
            $scope.end = new Date($scope.headache.end);
            $scope.endDate = $scope.end;
            $scope.endTime = $scope.end;
            //console.log("hallo!", $scope.end);
        }
    } else $scope.end = null;

    $scope.setEndDate = function (endDate) {
        if (endDate != null) {
            if ($scope.end == null) $scope.end = new Date();
            $scope.end.setFullYear(endDate.getFullYear());
            $scope.end.setMonth(endDate.getMonth());
            $scope.end.setDate(endDate.getDate());
        }
    };

    $scope.setEndTime = function (endTime) {
        if (endTime != null) {
            if ($scope.end == null) $scope.end = new Date();
            $scope.end.setHours(endTime.getHours());
            $scope.end.setMinutes(endTime.getMinutes());
            $scope.end.setSeconds(endTime.getSeconds());
        }
    };

    $scope.getIndexOfHeadache = function () {
        headaches = dataService.getHeadacheList();
        if (headaches == null || headaches.length == 0) {
            return -1;
        }
        for (headache in headaches) {
            equalIntensityValues = true;
            for (value in headaches[headache].intensityValues) {
                if (headaches[headache].intensityValues.length != $scope.headache.intensityValues.length) {
                    equalIntensityValues = false;
                    break;
                }
                if (headaches[headache].intensityValues[value].key != $scope.headache.intensityValues[value].key ||
                    headaches[headache].intensityValues[value].value != $scope.headache.intensityValues[value].value) {
                    equalIntensityValues = false;
                }
            }
            equalEnd = $scope.headache.end == headaches[headache].end;
            equalLocation = true;
            for (var location in headaches[headache].location) {
                if (headaches[headache].location.hasOwnProperty(location)) {
                    if($scope.headache.location[location] != headaches[headache].location[location]){
                        equalLocation = false;
                    }
                }
            }
            equalSymptoms = true;
            for (symptom in headaches[headache].symptoms) {
                if (symptom == null || headaches == null || headaches[headache] == null || headaches[headache].symptoms == null || headaches[headache].symptoms[symptom] == null) {
                    equalSymptoms = false;
                }
                if (headaches[headache].symptoms[symptom].id != $scope.headache.symptoms[symptom].id ||
                    headaches[headache].symptoms[symptom].name != $scope.headache.symptoms[symptom].name ||
                    headaches[headache].symptoms[symptom].description != $scope.headache.symptoms[symptom].description) {
                    equalSymptoms = false;
                }
            }
            equalTriggers = true;
            for (trigger in headaches[headache].triggers) {
                if (headaches[headache].triggers[trigger].id != $scope.headache.triggers[trigger].id ||
                    headaches[headache].triggers[trigger].name != $scope.headache.triggers[trigger].name ||
                    headaches[headache].triggers[trigger].description != $scope.headache.triggers[trigger].description) {
                    equalTriggers = false;
                }
            }
            if (equalIntensityValues && equalEnd && equalLocation && equalSymptoms && equalTriggers) {
                return headache;
            }
        }
        return -1;
    };

    $scope.headacheIndex = $scope.getIndexOfHeadache();

    /* Create a nice short time string from the start date and time */

    $scope.toggle_visibility = function(id) {
        var e = document.getElementById(id);
        var icon = document.getElementById(id+"Icon");
        console.log(icon);
        if(e.style.display != 'none') {
            e.style.display = 'none';
            icon.className = "fa fa-chevron-right";
        }
        else {
            e.style.display = 'block';
            icon.className = "fa fa-chevron-down";
        }
    };

    $scope.updateStartTimeString = function () {
        if ($scope.headache.intensityValues[0] == null) {
            $scope.startTimeString = "";
            return;
        }
        var months = ["jan.", "feb.", "mrt.", "apr.", "mei", "jun.", "jul.", "aug.", "sept.", "okt.", "nov.", "dec."];
        var month = months[(new Date($scope.headache.intensityValues[0].key).getMonth())];
        var day = (new Date($scope.headache.intensityValues[0].key).getDate().toString());
        var hour = (new Date($scope.headache.intensityValues[0].key).getHours().toString());
        if (hour < 10) hour = "0" + hour;
        var minute = new Date($scope.headache.intensityValues[0].key).getMinutes().toString();
        if (minute < 10) minute = "0" + minute;
        $scope.startTimeString = day + " " + month + " " + hour + ":" + minute;
    };

    $scope.showTimeField = function(symptom){
        if(symptom.category == "Aurasymptomen") {
            var time = document.getElementById(symptom.name.replace(" ", "")+"Duration");

            if(time.style.display != 'none') time.style.display = 'none';
            else time.style.display = 'block';
        }
    }

    $scope.$watch('headache.intensityValues[0]', $scope.updateStartTimeString);

    /* closeAndSave is called when the user pressed the "Sla op" button */

    $scope.closeAndSave = function () {

        if ($scope.headacheIndex != -1) {

            dataService.sendHeadacheToDB($scope.headache).then(function(result){
                //console.log("result:"+JSON.stringify(result));
                //console.log("Return van indienen hoofdpijn:"+status);

                dataService.setCurrentHeadache(null);
                var list = dataService.getHeadacheList();
                $scope.headache.id = result.headacheID;
                list[$scope.headacheIndex] = $scope.headache;
                dataService.setHeadacheList(list);
                $scope.transition();
                location.href = "dashboard.html";
            }, function(result){
                //console.log("Rest fout");
                //console.log($scope.headache);
                dataService.setCurrentHeadache(null);
                var list = dataService.getHeadacheList();
                $scope.headache.id = 0;
                list[$scope.headacheIndex] = $scope.headache;
                dataService.setHeadacheList(list);
                location.href="dashboard.html";
            });
        } else{
            dataService.sendHeadacheToDB($scope.headache).then(function(result){
                var list = dataService.getHeadacheList();
                //console.log("Nieuwe id:",result.headacheID);
                $scope.headache.id = result.headacheID;
                list[$scope.headacheIndex] = $scope.headache;
                dataService.setHeadacheList(list);
                dataService.addHeadache($scope.headache);
                console.log($scope.headache);
                $scope.transition();
                location.href = "dashboard.html";
            }, function(result){
                var list = dataService.getHeadacheList();
                //console.log("Nieuwe id:",result.headacheID);
                $scope.headache.id = 0;
                list[$scope.headacheIndex] = $scope.headache;
                dataService.setHeadacheList(list);
                dataService.addHeadache($scope.headache);
                location.href = "dashboard.html";
            });
        }



    };

    $scope.cancel = function () {
        dataService.setCurrentHeadache(null);
        location.href = "dashboard.html";
    };

    /* Some ugly hack with jQuery to link a popover the the corresponding help buttons */
    $scope.message = "";

    var searchIndexById = function (list, id) {
        // Search the index of an id in a list of objects with ids
        for (object in list) {
            if (list[object].id == id) return object;
        }
        return -1;
    };

    for (trigger in $scope.headache.triggers) { // Close your eyes and pretend this is not here ;)
        // Initialize function on each helpButton for each trigger
        $(document).on("click", '#helpButtonTrigger' + $scope.headache.triggers[trigger].id, function () {
            var id = ($(this)[0].id).split('helpButtonTrigger');
            var index = searchIndexById($scope.headache.triggers, id[1]);
            $scope.message = $scope.headache.triggers[index].description;
            $scope.popover.show("#" + $(this)[0].id);
        });
    }
    ;

    for (symptom in $scope.headache.symptoms) { // Close your eyes and pretend this is not here ;)
        // Initialize function on each helpButton for each trigger
        $(document).on("click", '#helpButtonSymptom' + $scope.headache.symptoms[symptom].id, function () {
            var id = ($(this)[0].id).split('helpButtonSymptom');
            var index = searchIndexById($scope.headache.symptoms, id[1]);
            $scope.message = $scope.headache.symptoms[index].description;
            $scope.popover.show("#" + $(this)[0].id);
        });
    }
    ;

    $(document).on("click", '.popover', function () {
        $scope.popover.hide();
    });

    ons.createPopover('popover.html').then(function (popover) {
        // Create a popover for the help buttons
        $scope.popover = popover;
    });

    /* All variables and functions used to add intensity values and delete them */

    $scope.newHeadacheValue;
    $scope.newHeadacheDate;
    $scope.newHeadacheTime;

    $scope.deleteEntry = function (item) {
        if (confirm('Ben je zeker dat je deze intensiteit wil verwijderen?')) {
            $scope.headache.intensityValues.splice($scope.headache.intensityValues.indexOf(item), 1);
            $scope.$broadcast('endDateValidation');
            if ($scope.headache.intensityValues.length == 0) $("#endDateForm").hide();
        } else {
            // Do nothing!
        }
    };

    $scope.setNewHeadacheValue = function (newValue) {
        $scope.newHeadacheValue = newValue;
    };

    $scope.addIntensityValue = function () {
        /* This function is called when we want to add an Intensity Value (it doesn't add it to the list yet...) */
        $scope.newHeadacheValue = 5;
        $scope.newHeadacheDate = new Date();
        $scope.newHeadacheTime = $scope.newHeadacheDate;
    };

    $scope.saveIntensityValue = function (navigator, page) {
        var start = new Date($scope.newHeadacheDate.getFullYear(), $scope.newHeadacheDate.getMonth(), $scope.newHeadacheDate.getDate(), $scope.newHeadacheTime.getHours(), $scope.newHeadacheTime.getMinutes(), $scope.newHeadacheTime.getSeconds());
        $scope.headache.intensityValues.push({key: start, value: $scope.newHeadacheValue});
        $scope.headache.intensityValues.sort(function (a, b) {
            if (a.key < b.key) return -1;
            if (a.key > b.key) return 1;
            else return 0;
        });
        if ($scope.headache.intensityValues.length == 1) $("#endDateForm").show();
        $scope.$broadcast('endDateValidation');
        navigator.popPage(page); // We're in the add intensity form. Popping a page will return to the list intensity form
    };

    $scope.setValues = function (v, d, t) {
        $scope.newHeadacheValue = v;
        $scope.newHeadacheDate = d;
        $scope.newHeadacheTime = t;
    };


});

angular.module('Chronic').directive('ngModel', function ($filter) {
    // This is used to remove seconds and milliseconds in time pickers
    return {
        require: '?ngModel',
        link: function (scope, elem, attr, ngModel) {
            if (!ngModel)
                return;
            if (attr.type !== 'time')
                return;

            ngModel.$formatters.unshift(function (value) {
                return value.replace(/(:\d\d)(:.*)$/, '\$1');
            });
        }
    };
});
