/*!
 	Chronicals, v1.0
 	Created by Kiani Lannoye & Gilles Vandewiele, commissioned by UZ Ghent
    https://github.com/kianilannoye/Chronicals

    This file contains the controller to add and modify medicines.
 */

angular.module('Chronic').controller('medicineController', function($scope, dataService){
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

    $scope.drugDate;
    $scope.drugTime;

    $scope.transition = function(){
        $("body").children().eq(0).show();
        $('body').children().eq(1).hide();
    };

    $scope.addMedicineForm = {};

    // Initialize all fields on default values or on the values of current medicine (when modifying)
	$scope.medicine = dataService.getCurrentMedicine();
    //console.log("Current Medicine = ", $scope.medicine);

	if($scope.medicine != null && $scope.medicine.drug != null){
		$scope.selectedDrug = $scope.medicine.drug;
	}
	if($scope.medicine != null && $scope.medicine.date != null){
		$scope.drugDate = new Date($scope.medicine.date);
	}else {
    	$scope.drugDate = new Date();
    }
	$scope.drugTime = $scope.drugDate;
    if($scope.medicine != null && $scope.medicine.quantity != null){
    	$scope.drugQuantity = $scope.medicine.quantity;
    }else {
	    $scope.drugQuantity = 0;
	}

	$scope.getIndexOfMedicine = function(){
		medicines = dataService.getMedicineList();
  		if(medicines == null || medicines.length == 0) return -1;
  		if($scope.medicine == null) return -1;
		for(medicine in medicines){
			equalDrug = (medicines[medicine].drug.id == $scope.medicine.drug.id);
			equalDate = medicines[medicine].date == $scope.medicine.date;
			equalQuantity = medicines[medicine].quantity == $scope.medicine.quantity;
			if(equalDrug && equalDate && equalQuantity) return medicine;
		}
		return -1;
	};

	$scope.medicineIndex = $scope.getIndexOfMedicine();

	// Populate the dropdown and the advice
	$scope.advice = "Dit is een voorbeeldadvies.";
	$scope.drugs = dataService.getDrugs();

	// Create the possibility to add an own drug in the dropdown
    $scope.dropdownClick = function(selectedDrug){
        if(selectedDrug != null && selectedDrug.name=="..."){
            $(".selectDiv").hide();
            $("#ownDrug").show();
        } else {
            $scope.selectedDrug = selectedDrug;
        }
    };

    $scope.typeText = function(text){
        $scope.ownDrug = text;
    };

    $scope.typeNumber = function(number){
        $scope.drugQuantity = number;
    };

    $scope.typeDate = function(date){
        if(date != null) {
            $scope.drugDate.setFullYear(date.getFullYear());
            $scope.drugDate.setMonth(date.getMonth());
            $scope.drugDate.setDate(date.getDate());
        }
    };

    $scope.typeTime = function(time){
        if(time != null) {
            $scope.drugTime.setHours(time.getHours());
            $scope.drugTime.setMinutes(time.getMinutes());
        }
    };

	// Called when clicking "Sla Op"
	$scope.addMedicine = function(newLocation, profile){
        profile = typeof profile !== 'undefined' ? profile : false;
		var dateObj = new Date($scope.drugDate.getFullYear(), $scope.drugDate.getMonth(), $scope.drugDate.getDate(), $scope.drugTime.getHours(), $scope.drugTime.getMinutes(), $scope.drugTime.getSeconds());
        if($scope.ownDrug != null){
			var drug = {id: 0, name:$scope.ownDrug, description:""};
			var medicine = {id: 0, drug: drug, quantity: $scope.drugQuantity, date: dateObj};
            if(JSON.parse(localStorage.getItem("ownDrugList")) == null){
                localStorage.setItem("ownDrugList",JSON.stringify([drug]));
            }else{
                localStorage.setItem("ownDrugList", JSON.stringify(JSON.parse(localStorage.getItem("ownDrugList")).concat([drug])));
            }
            localStorage.setItem("drugList",JSON.stringify(JSON.parse(localStorage.getItem("drugList")).concat([drug])));
		} else {
            if($scope.medicineIndex == -1) var medicine = {id: 0, drug: $scope.selectedDrug, quantity: $scope.drugQuantity, date: dateObj};
            else var medicine = {id: $scope.medicine.id, drug: $scope.selectedDrug, quantity: $scope.drugQuantity, date: dateObj};
		}
        console.log("Nieuwe medicine:"+JSON.stringify(medicine));

        //console.log("Going to store ", medicine);
        $scope.medicine = medicine
        console.log("Medicine index:"+$scope.medicineIndex);
        console.log("Medicine to add:"+JSON.stringify($scope.medicine));
		if($scope.medicineIndex != -1){
            if(profile){
                dataService.setDailyMedicineList(list);
            }else{
                dataService.sendMedicineToDB($scope.medicine).then(function(result) {
                    var list = dataService.getMedicineList();
                    $scope.medicine.id = result.medicineID;
                    list[$scope.medicineIndex] = $scope.medicine;
                    dataService.setMedicineList(list);
                    $scope.transition();
                    location.href = newLocation;
                }, function(){
                    //console.log("Rest fout");
                    //console.log($scope.headache);

                    var list = dataService.getMedicineList();

                    $scope.medicine.id = 0;
                    list[$scope.medicineIndex] = $scope.medicine;
                    dataService.setMedicineList(list);
                    location.href=newLocation;

                    //console.log("Rest fout");
                    //console.log($scope.medicine);
                    //dataService.setCurrentMedicine(null);
                    //$scope.transition();
                    //location.href=newLocation;
                });
            }
		}
		else {
            if(profile){
                dataService.addDailyMedicine($scope.medicine)
            }else{
                dataService.sendMedicineToDB($scope.medicine).then(function(result){
                    var list = dataService.getMedicineList();
                    //console.log("Nieuwe id:",result.medicineID);
                    $scope.medicine.id = result.medicineID;
                    list[$scope.medicineIndex] = $scope.medicine;
                    dataService.setMedicineList(list);
                    dataService.addMedicine($scope.medicine);
                    $scope.transition();
                    location.href = newLocation;
                }, function(result){
                    //console.log("Nieuwe id:",result.headacheID);
                    console.log("Trying to add new medicine:"+JSON.stringify($scope.medicine));
                    var list = dataService.getMedicineList();
                    console.log("Trying to add new list:"+JSON.stringify(list));
                    if(list == null){
                        list = [];
                    }
                    $scope.medicine.id = 0;
                    list[$scope.medicineIndex] = $scope.medicine;
                    console.log("New list after adding:"+JSON.stringify(list));
                    dataService.setMedicineList(list);
                    console.log("MedicineList after adding:"+JSON.stringify(dataService.getMedicineList()));
                    dataService.addMedicine($scope.medicine);
                    console.log("MedicineList final:"+JSON.stringify(dataService.getMedicineList()));
                    location.href = newLocation;
                    //console.log("Rest fout");
                    //console.log($scope.medicine);
                    //console.log("Data:"+result);
                    //dataService.setCurrentMedicine(null);
                    //$scope.transition();
                    //location.href=newLocation;
                });
            }


		}
	};

	// Called on canceling
  $scope.cancel = function(){
  	dataService.setCurrentMedicine(null);
  	location.href="dashboard.html";
  };

});

angular.module('Chronic').directive('ngModel', function( $filter ) {
	// This is used to remove seconds and milliseconds in time pickers
    return {
        require: '?ngModel',
        link: function(scope, elem, attr, ngModel) {
            if( !ngModel )
                return;
            if( attr.type !== 'time' )
                return;

            ngModel.$formatters.unshift(function(value) {
                return value.replace(/(:\d\d)(:.*)$/, '\$1');
            });
        }
    };
});
