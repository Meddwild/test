angular.module('Chronic').controller('adviceController', function($scope, dataService){

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

    //TODO: replace by DB call
    $scope.advice = dataService.getAdvice();

});
