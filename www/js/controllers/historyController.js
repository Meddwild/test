/*!
 Chronicals, v1.0
 Created by Kiani Lannoye & Gilles Vandewiele, commissioned by UZ Ghent
 https://github.com/kianilannoye/Chronicals

 This file contains the controller for the history views.
 */

angular.module('Chronic').controller("historyController", function($scope, dataService) {

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

    $scope.getTimeDateString = function(tijdstip){
        var datum = new Date(tijdstip);
        return ""+(datum.getDate())+"/"+(datum.getMonth()+1)+" "+(datum.getHours()<10?'0':'')+datum.getHours()+":"+(datum.getMinutes()<10?'0':'')+datum.getMinutes();
    };

    $scope.objTracker = function(object){
        if(object.hasOwnProperty('end')){
            return Math.random() + object.intensityValues + object.end + object.location + object.symptoms + object.triggers;
        } else {
            return Math.random() + object.drug + object.quantity + object.date;
        }
    };

    $scope.listItems =[];
    if($scope.listItems.length>0){
        $scope.listItems = [];
    }

    $scope.loadEvents = function(){
        Array.prototype.push.apply($scope.listItems,dataService.getHeadacheList());
        Array.prototype.push.apply($scope.listItems, dataService.getMedicineList());

        if($scope.listItems != null && $scope.listItems.length>0)
            $scope.listItems.sort(function(a,b){ //sort the list on their start dates // date of consumption

                if(a.hasOwnProperty('end')){//if it is a headache it has property end
                    dateA = a.intensityValues[0].key;
                }else{
                    dateA = a.date;
                }

                if(b.hasOwnProperty('end')){//if it is a headache it has property end
                    dateB = b.intensityValues[0].key;
                }else{
                    dateB = b.date;
                }
                return (new Date(dateB.toString())) - (new Date(dateA.toString()));
            });

        //console.log("listIems legnth"+ $scope.listItems.length);
    };

    $scope.loadEvents();

    /* Onload fill event list of the calendar */
    $scope.fillEvents = function () {

        var dateA = null;
        var dateB = null;



        // page is now ready, initialize the calendar...
        $('#calendar').fullCalendar({
            /* Identify the structure for the header*/
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,basicWeek,basicDay'
            },
            ignoreTimezone: false,
            height: $('#calendar').height() - 2,

            nextDayThreshold: "00:00:01"
        });

        document.getElementById('calendar').style.display = 'block';
        if(!$scope.listItems) { $('#loadingImg').hide(); return; }
        for(i =0; i<$scope.listItems.length; i++){
            if($scope.listItems[i].hasOwnProperty("end")){
            	//console.log(moment.parseZone($scope.listItems[i].intensityValues[0].key));
            	var today = new Date();
            	var _start = moment($scope.listItems[i].intensityValues[0].key);
            	var _end = moment($scope.listItems[i].end);
            	_start._tzm = today.getTimezoneOffset()/60;
            	_end._tzm = today.getTimezoneOffset()/60;
                $('#calendar').fullCalendar('renderEvent',
                    {
                        title: "Hoofdpijn"
                        , start: _start.format()
                        , end: _end.format()
                        , intensity: $scope.listItems[i].intensityValue
                        , color: '#f9332f'
                        , object: $scope.listItems[i]
                        ,ignoreTimezone: false
                    }, true);
            }else{
            	var today = new Date();
            	var _start = moment($scope.listItems[i].date);
            	_start._tzm = today.getTimezoneOffset()/60;
            	var _end = _start;
                $('#calendar').fullCalendar('renderEvent',
                    {
                        title: "Medicijn"
                        , start: _start.format()
                        , end: _end.format()
                        , medicine: $scope.listItems[i].drug.name
                        , quantity: $scope.listItems[i].quantity
                        , color: '#0cc80c'
                        , object: $scope.listItems[i]
                        ,ignoreTimezone: false
                    }, true);
            }
        }

        $('.loadingImg').hide();
    };

    ons.ready(function() {
        $('.hidden').removeClass("hidden");

        historyNavigator.on('postpush', function(event) {

            // page is now ready, initialize the calendar...
            $('#calendar').fullCalendar({
                /* Identify the structure for the header*/
                header: {
                    left: 'today',
                    center: 'prev, title, next',
                    right: 'month,basicWeek,basicDay'
                },
                ignoreTimezone: false,
                height: $('#calendar').height() - 2,
                nextDayThreshold: "00:00:01",

                eventRender: function (event, element) {
                    element.attr('href', 'javascript:void(0);');
                    element.click(function() {
                        $scope.listClick(event);
                    });
                },

                dayClick: function(date, jsEvent, view) {

                    console.log('Clicked on: ' + date.format());

                    // change the day's background color just for fun
                    $(this).css('background-color', 'red');

                    $scope.transition();
                    dataService.setCurrentDiaryDate( date.format());
                    dataService.getCurrentDiaryDate();
                    location.href = 'diary.html';

                }
            });
            $scope.fillEvents();
        });
        $scope.goNextPage();
    });

    $scope.goNextPage = function(){
        historyNavigator.pushPage('calendarView.html', {onTransitionEnd: '$scope.fillEvents()'});
    };

    $scope.listClick = function(obj){
        //console.log("listClick event:", obj);
        if(obj.title == "Hoofdpijn" || obj.hasOwnProperty('intensityValues')){
            if(obj.hasOwnProperty('title')){
                dataService.setCurrentHeadache(obj.object);
            }else{
                dataService.setCurrentHeadache(obj);
            }
            //console.log("De geklikte dinge is:",dataService.getCurrentHeadache());
            $scope.transition();
            location.href='detailedHeadache.html';
        }else{
            if(obj.hasOwnProperty('title')){
                dataService.setCurrentMedicine(obj.object);
            }else{
                dataService.setCurrentMedicine(obj);
            }
            $scope.transition();
            location.href = 'detailedMedicine.html';
        }

    };
});



