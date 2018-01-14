/*!
 Chronicals, v1.0
 Created by Kiani Lannoye & Gilles Vandewiele, commissioned by UZ Ghent
 https://github.com/kianilannoye/Chronicals

 This file contains the controller for the history views.
 */


angular.module('Chronic').controller("detailedMedicineController", function($scope, dataService) {


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

    $scope.deleteEntry = function(){
        if (confirm('Ben je zeker dat je deze medicijn consumptie wil verwijderen?')){
            $scope.transition();
            dataService.removeMedicine().then(function(result){
                location.href = "history.html";
            }, function(result){
                //location.href = "history.html";
            });
        }
    };

    $scope.current = dataService.getCurrentMedicine();

    var current = dataService.getCurrentMedicine();
    var months = ["jan.", "feb.", "mrt.", "apr.", "mei", "jun.", "jul.", "aug.", "sept.", "okt.", "nov.", "dec."];


    if(current == null){
        current = dataService.getCurrentMedicine();
        if(current==null){
            dataService.setCurrentMedicine(dataService.getMedicineList()[0]);
            current = dataService.getCurrentMedicine();
        }
    }

    $scope.onClick = function (points, evt) {
        //console.log(points, evt);
    };


    $scope.getTimeDateString = function(tijdstip){
        var datum = new Date(tijdstip);
        //console.log(tijdstip);
        return ""+(datum.getDate())+"/"+(datum.getMonth()+1)+" "+(datum.getHours()<10?'0':'')+datum.getHours()+":"+(datum.getMinutes()<10?'0':'')+datum.getMinutes();
    };

});


//window.onload = $scope.fillEvents;
//});



