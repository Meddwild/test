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

}]).controller('fitnessController', function ($scope, dataService, $http) {
    app.initialize();

    var activityCollection = {"Biking": "Fietsen", "Elevator": "In de lift", "In vehicle": "In de wagen", "On foot": "Te voet", "Running": "Lopen", "Jogging": "Joggen", "Still (not moving)": "Stilzitten", "Walking": "Wandelen"}
    var months = ["filler", "jan.", "feb.", "mrt.", "apr.", "mei", "jun.", "jul.", "aug.", "sept.", "okt.", "nov.", "dec."];
    var datum = moment();
    $scope.options = {
        scaleBeginAtZero : true
    };

    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };

    $scope.user = dataService.getCurrentUser();

    $scope.transition = function () {
        $("body").children().eq(0).show();
        $('body').children().eq(1).hide();
    };

    $scope.getDateString = function(currentDate) {
        return ""+(currentDate.format("D"))+" "+months[currentDate.format("M")]+" "+currentDate.format("YYYY");
    };

    $scope.goYesterday = function() {
        datum = datum.subtract(1, 'day');
        $scope.fillPage(datum);
    };

    $scope.goTomorrow = function() {
        datum = datum.add(1, 'day');
        $scope.fillPage(datum);
    };

    // sort function for sleep segments
    function custom_sort(a,b) {
        return new Date(a.time).getTime() - new Date(b.time).getTime();
    }

    $scope.fillPage = function(date) {
        var datumdiv = document.getElementById('datum');
        datumdiv.innerHTML = $scope.getDateString(datum);
        $scope.labels = [];
        $scope.data = [];

        var sleepmsg = document.getElementById("sleepmsg");
        var sportmsg = document.getElementById("sportmsg");
        var graph = document.getElementById("line");
        var contentdiv = document.getElementById("content");

        dataService.getSleepData(date.format("DD/MM/YYYY")).then(function(result) {
            $scope.labels = [];
            $scope.data = [];
            // var result = { "_id" : "5acc9bebe4b0ca8bb4ea5d8f", "sleepID" : 182, "segments" : [ { "startTime" : "2018-04-08T22:54:00.00Z", "endTime" : "2018-04-09T05:51:00.00Z", "sleepID" : 182, "type" : "LIGHT_SLEEP", "duration" : 18600000, "times" : 8 }, { "startTime" : "2018-04-08T23:46:00.00Z", "endTime" : "2018-04-09T05:40:00.00Z", "sleepID" : 182, "type" : "DEEP_SLEEP", "duration" : 6240000, "times" : 5 }, { "startTime" : "2018-04-08T23:05:00.00Z", "endTime" : "2018-04-08T23:45:00.00Z", "sleepID" : 182, "type" : "AWAKE", "duration" : 240000, "times" : 2 } ], "date" : "09/04/2018", "patientID" : 60 };
            if(result === "") {
                // show "no data" message
                sleepmsg.style.display = "block";
                graph.style.display="none";
            } else {
                sleepmsg.style.display = "none";
                graph.style.display="block";
                // var result2 = { "_id" : "5acc9bebe4b0ca8bb4ea5d8f", "sleepID" : 182, "segments" : [ { "startTime" : "2018-04-08T22:54:00.00Z", "endTime" : "2018-04-09T05:51:00.00Z", "sleepID" : 182, "type" : "LIGHT_SLEEP", "duration" : 18600000, "times" : 8 }, { "startTime" : "2018-04-08T23:46:00.00Z", "endTime" : "2018-04-09T05:40:00.00Z", "sleepID" : 182, "type" : "DEEP_SLEEP", "duration" : 6240000, "times" : 5 }, { "startTime" : "2018-04-08T23:05:00.00Z", "endTime" : "2018-04-08T23:45:00.00Z", "sleepID" : 182, "type" : "AWAKE", "duration" : 240000, "times" : 2 } ], "date" : "09/04/2018", "patientID" : 60 };

                // get total duration of the sleep
                var duration = getSleepDuration(result.segments);

                // make array of data points
                var dataPoints = []
                // fill data points
                var segments = result.segments;
                for (var index in segments) {
                    if (segments[index].type === "LIGHT_SLEEP") {
                        dataPoints.push({time: segments[index].startTime, score: 70});
                        dataPoints.push({time: segments[index].endTime, score: 70});
                    } else if (segments[index].type === "DEEP_SLEEP") {
                        dataPoints.push({time: segments[index].startTime, score: 100});
                        dataPoints.push({time: segments[index].endTime, score: 100});
                    } else {
                        dataPoints.push({time: segments[index].startTime, score: 40});
                        dataPoints.push({time: segments[index].endTime, score: 40});
                    }
                }

                // make labels and data array
                var times = []
                for (var index in dataPoints.sort(custom_sort)) {
                    $scope.labels.push(moment.utc(dataPoints[index].time).format("H u mm"));
                    times.push(dataPoints[index].score);
                }
                $scope.data = [
                    times
                ];

                $scope.data = {
                    labels: $scope.labels, datasets: [{
                        data: times, fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)"
                    }]
                };

                $('canvas').css('opacity', '0.99');
                var ctx = $('canvas').get(0).getContext("2d");
                var myNewChart = new Chart(ctx).Line($scope.data, $scope.options);
                myNewChart.update();
                $('canvas').css('opacity', '1.0');
            }
        });

        dataService.getSportData(date.format("DD/MM/YYYY")).then(function(result) {
            contentdiv.innerHTML += " ";
            if(result === "") {
                // show "no data" message
                sportmsg.style.display = "block";
                contentdiv.style.display = "none";
            } else {
                sportmsg.style.display = "none";
                contentdiv.style.display = "block";
                // var htmlstring = '<ons-row> <ons-col><p>Soort activiteit</p></ons-col><ons-col><p>Duratie</p></ons-col></ons-row>'

                var htmlstring = '<ons-row style="margin-left: 2%; margin-top: 2%;" class="row ons-row-inner">\n' +
                    '                    <ons-col width="45%" class="col ons-col-inner"><p class="label">Soort activiteit</p></ons-col>\n' +
                    '                    <ons-col class="col ons-col-inner"><p class="label">Duratie</p></ons-col>\n' +
                    '                </ons-row>'
                contentdiv.innerHTML += htmlstring

                for(var key in result.sportSegments) {
                    var duration = msToTime(result.sportSegments[key].duration);
                    var activityType = result.sportSegments[key].type.replace('*','');
                    if(activityType in activityCollection) {
                        var activityType = activityCollection[activityType];
                    }


                    var htmlstring = '<ons-row style="margin-left: 2%; margin-top: 2%;" class="row ons-row-inner">\n' +
                        '                    <ons-col width="45%" class="col ons-col-inner"><p class="label">' + activityType +'</p></ons-col>\n' +
                        '                    <ons-col class="col ons-col-inner"><p class="label">' + duration + '</p></ons-col>\n' +
                        '                </ons-row>'
                    contentdiv.innerHTML += htmlstring;
                }
            }

        });



        // fill the sleep data
        // dataService.getSleepData(date).then(function(result) {
        //     console.log(result);
        //     var sleepmsg = document.getElementById("msg");
        //     var sportmsg = document.getElementById("sportmsg");
        //     if(result === "") {
        //         // show "no data" message
        //         sleepmsg.style.display = "block";
        //     } else {
        //         sleepmsg.style.display = "none";
        //         // var result2 = { "_id" : "5acc9bebe4b0ca8bb4ea5d8f", "sleepID" : 182, "segments" : [ { "startTime" : "2018-04-08T22:53:00.00Z", "endTime" : "2018-04-09T05:51:00.00Z", "sleepID" : 182, "type" : "LIGHT_SLEEP", "duration" : 18600000, "times" : 8 }, { "startTime" : "2018-04-08T23:46:00.00Z", "endTime" : "2018-04-09T05:40:00.00Z", "sleepID" : 182, "type" : "DEEP_SLEEP", "duration" : 6240000, "times" : 5 }, { "startTime" : "2018-04-08T23:05:00.00Z", "endTime" : "2018-04-08T23:45:00.00Z", "sleepID" : 182, "type" : "AWAKE", "duration" : 240000, "times" : 2 } ], "date" : "09/04/2018", "patientID" : 60 };
        //         console.log(result.segments.length);
        //
        //         // get total duration of the sleep
        //         var duration = getSleepDuration(result.segments);
        //
        //         // make array of data points
        //         var dataPoints = []
        //         // fill data points
        //         var segments = result.segments;
        //         for(var index in segments) {
        //             if (segments[index].type === "LIGHT_SLEEP") {
        //                 dataPoints.push({time: segments[index].startTime, score: 70});
        //                 dataPoints.push({time: segments[index].endTime, score: 70});
        //             } else if(segments[index].type === "DEEP_SLEEP") {
        //                 dataPoints.push({time: segments[index].startTime, score: 100});
        //                 dataPoints.push({time: segments[index].endTime, score: 100});
        //             } else {
        //                 dataPoints.push({time: segments[index].startTime, score: 40});
        //                 dataPoints.push({time: segments[index].endTime, score: 40});
        //             }
        //         }
        //
        //         // make labels and data array
        //         var times = []
        //         for(var index in dataPoints.sort(custom_sort)) {
        //             $scope.labels.push(moment.utc(dataPoints[index].time).format("H u mm"));
        //             times.push(dataPoints[index].score);
        //         }
        //         $scope.data = [
        //             times
        //         ];
        //         console.log($scope.labels);
        //         console.log($scope.data);
        //     }
        //
        // });


        // fill the sport data

        var sportmsg = document.getElementById("sportmsg");
        sportmsg.style.display = "block";

        // var result2 = { "_id" : "5acc9bebe4b0ca8bb4ea5d8f", "sleepID" : 182, "segments" : [ { "startTime" : "2018-04-08T22:53:00.00Z", "endTime" : "2018-04-09T05:51:00.00Z", "sleepID" : 182, "type" : "LIGHT_SLEEP", "duration" : 18600000, "times" : 8 }, { "startTime" : "2018-04-08T23:46:00.00Z", "endTime" : "2018-04-09T05:40:00.00Z", "sleepID" : 182, "type" : "DEEP_SLEEP", "duration" : 6240000, "times" : 5 }, { "startTime" : "2018-04-08T23:05:00.00Z", "endTime" : "2018-04-08T23:45:00.00Z", "sleepID" : 182, "type" : "AWAKE", "duration" : 240000, "times" : 2 } ], "date" : "09/04/2018", "patientID" : 60 };

        // get total duration of the sleep
        // var duration = getSleepDuration(result.segments);
    };

    function msToTime(duration) {
        var seconds = parseInt((duration / 1000) % 60),
            minutes = parseInt((duration / (1000 * 60)) % 60),
            hours = parseInt((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds;
    }



    function getSleepDuration(segments) {
        var startDate = moment();
        var endDate = moment('1-1-1999')
        for (var index in segments) {
            var curStart = moment(segments[index].startTime);
            var curEnd = moment(segments[index].endTime);
            if (curStart.isBefore(startDate)) {
                startDate = curStart;
            }
            if(curEnd.isAfter(endDate)) {
                endDate = curEnd;
            }
        }
        var duration = moment.duration(endDate.diff(startDate));
        return duration;
    }



    ons.ready(function () {
        $scope.fillPage(datum)
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

});