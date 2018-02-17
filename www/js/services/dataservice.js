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
}]).service('dataService', function ($http,$q, backgroundservice) {

    // Reset the local storage; always comment this out!
    //  $localStorage.$reset();
    //  localStorage.clear();
    var currentHeadache;

    var currentMedicine;
    var currentDiaryDate;

    var medicineList = [];
    var headacheList = [];

    var diaryMap = {};

    var dailyMedicine = [];

    var passwordHash = "";
    var email = "";

    var patientID = -1;
    var triggers = [];
    var symptoms = [];
    var drugs = [];


    var getAuthorization = function () {
        var currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser != null) return 'Basic ' + btoa(sha3_512(currentUser.email) + ":" + sha3_512(currentUser.passwordHash + getApiKey()));
        else return null;
    };

    var sendHeadacheToDB = function(headacheObj){
        return new $q(function(resolve,reject) {
            var dataPost = {
                "intensityValues" : headacheObj.intensityValues,
                "end": headacheObj.end,
                "locations": headacheObj.location,
                "symptomIDs": [],
                "triggerIDs": []
            };

            var newLocations = {};
            for(var headacheLocation in headacheObj.location){
                newLocations[headacheLocation] = headacheObj.location[headacheLocation];
            }
            dataPost.locations = newLocations;
            var newTriggers = [];
            for (var trigger in headacheObj.triggers){
                if(headacheObj.triggers[trigger].val){
                    newTriggers.push(headacheObj.triggers[trigger].id);
                }

            }
            dataPost.triggerIDs = newTriggers;

            var newSymptoms = [];
            for (var symptom in headacheObj.symptoms){
                if(headacheObj.symptoms[symptom].val){
                    newSymptoms.push(headacheObj.symptoms[symptom].id);
                }

            }
            //console.log("Symptoms", newSymptoms);
            dataPost.symptomIDs = newSymptoms;
            var patientID = JSON.parse(localStorage.getItem("currentUser")).patientID;
            dataPost.headacheID = headacheObj.id;
            //console.log("Datapost:"+JSON.stringify(dataPost));
            $http({
                method: 'POST',
                url: "http://tw06v033.ugent.be/Chronic1/rest/HeadacheService/headaches?patientID="+patientID,
                data: JSON.stringify(dataPost),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data, status, headers, config) {
                resolve(data);
            }).
            error(function (data, status, headers, config) {
                reject(data);
            });
        });
    };

    var sendMedicineToDB = function(medicineObj){
        return new $q(function(resolve,reject) {
            var dataPost = {
                "drugID" : medicineObj.drug.id,
                "date": medicineObj.date.toString(),
                "quantity": medicineObj.quantity,
                "medicineID":medicineObj.id
            };
            var patientID = JSON.parse(localStorage.getItem("currentUser")).patientID;
            $http({
                method: 'POST',
                url: "http://tw06v033.ugent.be/Chronic1/rest/MedicineService/medicines?patientID="+patientID,
                data: JSON.stringify(dataPost),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getAuthorization()
                }
            }).success(function (data, status, headers, config) {
                resolve(data);
            }).
            error(function (data, status, headers, config) {
                reject(data);
            });
        });
    };

    var sendGoogleResponseToDB = function(responseObj) {
        return new $q(function(resolve,reject) {
            var patientID = JSON.parse(localStorage.getItem("currentUser")).patientID;
            $http({
                method: 'POST',
                url: "http://tw06v033.ugent.be/Chronic1/rest/PatientService/patient/google?patientID="+patientID,
                data: JSON.stringify(responseObj),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getAuthorization()
                }
            }).success(function (data, status, headers, config) {
                resolve(data);
            }).
            error(function (data, status, headers, config) {
                reject(data);
            });
        });
    }

    var sendBulkLocationsToDB = function(locationsObj){
        console.log(JSON.stringify(locationsObj));
        return new $q(function(resolve,reject) {
            var patientID = JSON.parse(localStorage.getItem("currentUser")).patientID;
            $http({
                method: 'POST',
                url: "http://tw06v033.ugent.be/Chronic1/rest/LocationService/locations?patientID="+patientID,
                data: JSON.stringify(locationsObj),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getAuthorization()
                }
            }).success(function (data, status, headers, config) {
                console.log(data)
                resolve(data);
            }).
            error(function (data, status, headers, config) {
                console.log(data)
                reject(data);
            });
        });
    };


    var sendLocationToDB = function(locationObj){
        return new $q(function(resolve,reject) {
            var patientID = JSON.parse(localStorage.getItem("currentUser")).patientID;
            var dataPost = {
                "lon" : locationObj.longitude,
                "lat": locationObj.latitude,
                "date": locationObj.time,
                "patientID": patientID
            };

            $http({
                method: 'POST',
                url: "http://tw06v033.ugent.be/Chronic1/rest/LocationService/location?patientID="+patientID,
                data: JSON.stringify(dataPost),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getAuthorization()
                }
            }).success(function (data, status, headers, config) {
                console.log(data);
                resolve(data);
            }).
            error(function (data, status, headers, config) {
                console.log(data)
                reject(data);
            });
        });
    };

    var sendDiaryToDB = function(diaryObj){
        diaryObj = JSON.parse(diaryObj);
        return new $q(function(resolve,reject) {
            var dataPost = {
                "date" : diaryObj.date,
                "sportHours": diaryObj.sportHours +"",
                "endSleep": diaryObj.endSleep + "",
                "beginSleep": diaryObj.beginSleep + "",
                "alcohol": diaryObj.alcohol + "",
                "tobacco": diaryObj.tobacco+ "",
                "cafeine": diaryObj.cafeine + "",
                "breakfastTime": diaryObj.breakfastTime,
                "lunchTime": diaryObj.lunchTime,
                "dinnerTime": diaryObj.dinnerTime,
                "stresslvl": diaryObj.stresslvl + ""
            };
            var patientID = JSON.parse(localStorage.getItem("currentUser")).patientID;
            var datum = new Date(diaryObj.date);
            $http({
                method: 'POST',
                url: "http://tw06v033.ugent.be/Chronic1/rest/DiaryService/diary?patientID="+patientID+"&date="+moment(diaryObj.date).format('DD/MM/YY'),
                data: JSON.stringify(dataPost),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getAuthorization()
                }
            }).success(function (data, status, headers, config) {
                resolve(data);
            }).
            error(function (data, status, headers, config) {
                reject(data);
            });
        });
    };



    var addDiary = function (newObj, date) {
        if (JSON.parse(localStorage.getItem("diaryMap")) != null) {
            diaryMap = JSON.parse(localStorage.getItem("diaryMap"));
            diaryMap[date] = newObj;
            localStorage.setItem("diaryMap", JSON.stringify(diaryMap));
        }
        else {
            diaryMap[date] = newObj;
            localStorage.setItem("diaryMap", JSON.stringify([newObj]));
        }
    };

    var addHeadache = function (newObj) {
        if (JSON.parse(localStorage.getItem("headacheList")) != null) {
            headacheList = JSON.parse(localStorage.getItem("headacheList"));
            headacheList.push(newObj);
            localStorage.setItem("headacheList", JSON.stringify(headacheList));

        }
        else {
            localStorage.setItem("headacheList", JSON.stringify([newObj]));
            headacheList = [newObj];
        }
    };

    var addMedicine = function (newObj) {
        if (JSON.parse(localStorage.getItem("medicineList")) != null) {
            medicineList = JSON.parse(localStorage.getItem("medicineList"));
            medicineList.push(newObj);
            localStorage.setItem("medicineList", JSON.stringify(medicineList));
        }
        else {
            localStorage.setItem("medicineList", JSON.stringify([newObj]));
            medicineList = [newObj];
        }
    };

    var setCurrentHeadache = function (newObj) {
        localStorage.setItem("currentHeadache", JSON.stringify(newObj));
        currentHeadache = newObj;
    };

    var setCurrentMedicine = function (newObj) {
        localStorage.setItem("currentMedicine", JSON.stringify(newObj));
        currentMedicine = newObj;
    };

    var getCurrentHeadache = function () {
        return JSON.parse(localStorage.getItem("currentHeadache"));
    };

    var getCurrentMedicine = function () {
        return JSON.parse(localStorage.getItem("currentMedicine"));
    };

    var getCurrentDiaryDate = function () {
        return JSON.parse(localStorage.getItem("currentDiaryDate"));
    }

    var setCurrentDiaryDate = function (newDate) {
        localStorage.setItem("currentDiaryDate", JSON.stringify(newDate));
        currentDiaryDate = newDate;
    }

    var getMedicineList = function () {
        return JSON.parse(localStorage.getItem("medicineList"));
    };

    var getHeadacheList = function () {
        var list = JSON.parse(localStorage.getItem("headacheList"));
        if (list != null && list != "null") {
            list.sort(function (a, b) { //sort the list on their start dates // date of consumption
                dateA = a.intensityValues[0].key;
                dateB = b.intensityValues[0].key;
                return (new Date(dateA.toString())) - (new Date(dateB.toString()));
            });
        }
        return list;
    };

    var getDiaryMap = function () {
        result = JSON.parse(localStorage.getItem(("diaryMap")));
        if (result === null) {
            return {};
        } else {
            return result;
        }
    }

    var getDrugsFromDB = function(){
        return new $q(
            function (resolve, reject) {
                $http.get('http://tw06v033.ugent.be/Chronic1/rest/DrugService/drugs', {headers: {'Authorization': getAuthorization()}}).
                success(function (data, status, headers, config) {
                    //alert("CONNECTED TO INTERNET OR DATABASE " + status);
                    var list = data;
                    var remoteDrugs = [];
                    list.forEach(function(entry){
                        remoteDrugs.push({id: entry.drugID, name: entry.name, description: entry.description});
                    });
                    // drugList consists of a list specified by the doctor which is gotten remotely,
                    // and a list of own-made drugs
                    if (JSON.parse(localStorage.getItem("ownDrugList")) != null) {
                        remoteDrugs = remoteDrugs.concat(JSON.parse(localStorage.getItem("ownDrugList")));
                    }
                    //remoteDrugs[remoteDrugs.length] = {id: -1, name: "...", description: "Own custom drug"};
                    localStorage.setItem("drugList", JSON.stringify(remoteDrugs));
                    resolve();
                }).
                error(function (data, status, headers, config) {
                    // If the connection failed, we just use the old drugList (this can't be the first time the app is started)
                    var drugList = JSON.parse(localStorage.getItem("drugList"));
                    if (drugList == null) alert("Er moet een internetverbinding aanwezig zijn wanneer u de app voor de eerste keer opstart.");
                    reject();
                });
            });
    };
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    };

    var getSymptomsFromDB = function(){
        return new $q(
            function (resolve, reject) {
                $http.get('http://tw06v033.ugent.be/Chronic1/rest/SymptomService/symptoms', {headers: {'Authorization': getAuthorization()}}).
                success(function (data, status, headers, config) {
                    var symptoms = data;
                    var newSymptoms = [];
                    var categories = [];
                    symptoms.forEach(function (entry) {
                        newSymptoms.push({id: entry.symptomID, name: entry.name, description: entry.description,
                                          val: false, category: entry.category, duration: entry.duration});
                        categories.push(entry.category);
                    });
                    console.log("Got symptoms: ", symptoms[0]);
                    var uniqueCategories = categories.filter(onlyUnique);
                    localStorage.setItem("symptoms", JSON.stringify(newSymptoms));
                    localStorage.setItem("categories", JSON.stringify(uniqueCategories));
                    resolve();
                }).
                error(function (data, status, headers, config) {
                    var symptoms = JSON.parse(localStorage.getItem("symptoms"));
                    if (symptoms == null) alert("Er moet een internetverbinding aanwezig zijn wanneer u de app voor de eerste keer opstart.");
                    reject();
                });
            });
    };

    var getCategories = function(){
        return JSON.parse(localStorage.getItem("categories"));
    };

    var getTriggersFromDB = function(){
        return new $q(
            function (resolve, reject) {
                $http.get('http://tw06v033.ugent.be/Chronic1/rest/TriggerService/triggers', {headers: {'Authorization': getAuthorization()}}).
                success(function (data, status, headers, config) {
                    var triggers = data;
                    var newTriggers = [];
                    triggers.forEach(function (entry) {
                        newTriggers.push({id: entry.triggerID, name: entry.name, description: entry.description,
                                          val: false});
                    });
                    localStorage.setItem("triggers", JSON.stringify(newTriggers));
                    resolve();
                }).
                error(function (data, status, headers, config) {
                    var triggers = JSON.parse(localStorage.getItem("symptoms"));
                    if (triggers == null) alert("Er moet een internetverbinding aanwezig zijn wanneer u de app voor de eerste keer opstart.");
                    reject();
                });
            });
    };

    var getHeadachesFromDB = function(){
        return new $q(
            function (resolve, reject) {
                var patientID = JSON.parse(localStorage.getItem("currentUser")).patientID;
                $http.get('http://tw06v033.ugent.be/Chronic1/rest/HeadacheService/headaches?patientID='+patientID, {headers: {'Authorization': getAuthorization()}}).
                success(function (data, status, headers, config) {
                    var headaches = data;
                    var newHeadaches = [];
                    headaches.forEach(function (entry) {
                        var newLocations = {};
                        for(var headacheLocation in entry.locations){
                            newLocations[entry.locations[headacheLocation].key] = Boolean(entry.locations[headacheLocation].value);
                        }
                        var newHeadacheTriggers = JSON.parse(localStorage.getItem("triggers"));

                        for(var triggerID in entry.triggerIDs){
                            for(var trigger in newHeadacheTriggers){
                                if(newHeadacheTriggers[trigger].id == entry.triggerIDs[triggerID]){
                                    newHeadacheTriggers[trigger].val = true;
                                }
                            }
                        }
                        var newHeadacheSymptoms = JSON.parse(localStorage.getItem("symptoms"));
                        for(var symptomID in entry.symptomIDs){
                            for(var symptom in newHeadacheSymptoms){
                                if(newHeadacheSymptoms[symptom].id == entry.symptomIDs[symptomID]){
                                    newHeadacheSymptoms[symptom].val = true;
                                }
                            }
                        }
                        var end;
                        if(entry.end == "null" || entry.end=="" || entry.end==null){
                            end = null;
                        }else{
                            end = entry.end;
                        }
                        newHeadaches.push({id: entry.headacheID, end: end, intensityValues: entry.intensityValues, location: newLocations,
                                           symptoms: newHeadacheSymptoms, triggers: newHeadacheTriggers});
                    });
                    localStorage.setItem("headacheList", JSON.stringify(newHeadaches));
                    resolve();
                }).
                error(function (data, status, headers, config) {
                    var headaches = JSON.parse(localStorage.getItem("headacheList"));
                    if (headaches == null) alert("Er moet een internetverbinding aanwezig zijn wanneer u de app voor de eerste keer opstart.");
                    reject();
                });
            });
    };

    var getMedicinesFromDB = function(){
        return new $q(
            function (resolve, reject) {
                var patientID = JSON.parse(localStorage.getItem("currentUser")).patientID;
                $http.get('http://tw06v033.ugent.be/Chronic1/rest/MedicineService/medicines?patientID='+patientID, {headers: {'Authorization': getAuthorization()}}).
                success(function (data, status, headers, config) {
                    var medicines = data;
                    var newMedicines = [];
                    medicines.forEach(function (entry) {
                        var drugID = entry.drugID;
                        var date = new Date(entry.date);
                        var quantity = entry.quantity;
                        var drugList = JSON.parse(localStorage.getItem("drugList"));
                        var drug = {};
                        for(var aDrug in drugList){
                            //console.log(drugList[aDrug]);
                            //console.log(drugID);
                            if(drugList[aDrug].id == drugID) drug = drugList[aDrug];
                        }
                        newMedicines.push({id: entry.medicineID, drug: drug, quantity: quantity, date: date})
                    });
                    localStorage.setItem("medicineList", JSON.stringify(newMedicines));
                    resolve();
                }).
                error(function (data, status, headers, config) {
                    var medicines = JSON.parse(localStorage.getItem("medicineList"));
                    if (medicines == null) alert("Er moet een internetverbinding aanwezig zijn wanneer u de app voor de eerste keer opstart.");
                    reject();
                });
            });
    };

    var getDBStatus = function(){
        return new $q(
            function(resolve, reject){
                $http.get('http://tw06v033.ugent.be/Chronic1/rest/DBService/status').
                success(function (data, status, headers, config) {
                    resolve();
                }).error(function (data, status, headers, config) {
                    reject();
                });
            }
        );
    };

    var removeHeadacheFromDB = function(headache){
        return new $q(
            function(resolve, reject){
                $http.delete('http://tw06v033.ugent.be/Chronic1/rest/HeadacheService/headaches/delete?headacheID='+headache.id,{headers: {'Authorization': getAuthorization()}}).
                success(function (data, status, headers, config) {
                    resolve();
                }).error(function (data, status, headers, config) {
                    reject();
                });
            }
        );
    };

    var removeMedicineFromDB = function(medicine){
        return new $q(
            function(resolve, reject){
                $http.delete('http://tw06v033.ugent.be/Chronic1/rest/MedicineService/medicines/delete?medicineID='+medicine.id,{headers: {'Authorization': getAuthorization()}}).
                success(function (data, status, headers, config) {
                    resolve(data);
                }).error(function (data, status, headers, config) {
                    //console.log("Status:"+status);
                    //console.log("data:"+data);
                    reject(data);
                });
            }
        );
    };

    var syncDB = function () {
        return $q.all([getDrugsFromDB(), getSymptomsFromDB(), getTriggersFromDB(),
            getHeadachesFromDB(), getMedicinesFromDB()]);
        //return $q.all([getDrugsFromDB(), getSymptomsFromDB(), getTriggersFromDB(),
        //    getHeadachesFromDB(), getMedicinesFromDB()]);
    };


    var setMedicineList = function (list) {
        medicineList = list;
        localStorage.setItem("medicineList", JSON.stringify(list));
    };

    var setHeadacheList = function (list) {
        headacheList = list;

        localStorage.setItem("headacheList", JSON.stringify(list));
    };

    var setDiaryMap = function(map) {
        diaryMap = map;
        localStorage.setItem("diaryMap", JSON.stringify(map));
    }

    var getSymptoms = function () {
        return JSON.parse(localStorage.getItem("symptoms"));
    };

    var getTriggers = function () {
        return JSON.parse(localStorage.getItem("triggers"));
    };

    var setAdvice = function (advice) {
        localStorage.setItem("advice", JSON.stringify(advice));
    };

    var getAdvice = function () {
        console.log("advice ", localStorage.getItem("advice") );
        if(localStorage.getItem("advice") != "" && localStorage.getItem("advice") != null ){
            return JSON.parse(localStorage.getItem("advice"));
        }
        else return "";
    };

    var getDrugs = function () {
        if(localStorage.getItem("drugList") != null) return JSON.parse(localStorage.getItem("drugList"));
        else return [];
    };

    var addDrug = function (drugName) {
        inList = false;
        for (drug in JSON.parse(localStorage.getItem("drugList"))) {
            if (JSON.parse(localStorage.getItem("drugList")[drug].name == drugName)) inList = true;
        }
        if (!inList) {
            var drug = {
                id: JSON.parse(localStorage.getItem("drugList"))[JSON.parse(localStorage.getItem("drugList")).length - 2].id + 1,
                name: drugName,
                description: ""
            };
            var list = JSON.parse(localStorage.getItem("drugList"));
            list = list.splice(list.length - 1, 0, drug);
            localStorage.setItem("drugList", JSON.stringify(list));
        }
    };

    var removeHeadache = function () {
        return new $q(function(resolve,reject) {

        var list = JSON.parse(localStorage.getItem("headacheList"));
        var current = JSON.parse(localStorage.getItem("currentHeadache"));

            removeHeadacheFromDB(current).then(function(result){
            var index = -1;
            for (var i = 0; i < list.length; i++) {
                if (list[i].intensityValues[0].key == current.intensityValues[0].key) {
                    index = i;
                    break;
                }
            }
            list.splice(index, 1);

            localStorage.setItem("headacheList", JSON.stringify(list));
            headacheList = list;
                resolve();
        }, function(result){
                reject()
            });


        currentHeadache = null;
        localStorage.setItem("currentHeadache", JSON.stringify(null));

        });
    };

    var removeMedicine = function () {
        return new $q(function(resolve,reject) {

            var list = JSON.parse(localStorage.getItem("medicineList"));
            var current = JSON.parse(localStorage.getItem("currentMedicine"));

            removeMedicineFromDB(current).then(function(result){
                var index = -1;
                for (var i = 0; i < list.length; i++) {
                    if (list[i].drug.name == current.drug.name && list[i].quantity == current.quantity && list[i].date == current.date) {
                        index = i;
                        break;
                    }
                }
                list.splice(index, 1);

                localStorage.setItem("medicineList", JSON.stringify(list));
                medicineList = list;
                //console.log("Gelukt+data:", result);
                resolve(result);
            }, function(result){
                console.log("Rest fout", ""+result);
                reject(result)
            });

            currentMedicine = null;
            localStorage.setItem("currentMedicine", JSON.stringify(null));

        });
    };

    var clearCache = function () {
        localStorage.clear();

    };

    var getHeadachesNoEnd = function () {
        var listItems = getHeadacheList();
        var listNoEnd = [];
        if (listItems != null) {
            listItems.sort(function (a, b) { //sort the list on their start dates // date of consumption

                dateA = a.intensityValues[0].key;
                dateB = b.intensityValues[0].key;
                return (new Date(dateA.toString())) - (new Date(dateB.toString()));
            });


            for (var i = 0; i < listItems.length; i++) {
                if (listItems[i].end == null) {
                    listNoEnd.push(listItems[i]);
                }
            }
        }

        return listNoEnd;

    };

    var addDailyMedicine = function (medicine) {
        dailyMedicine = JSON.parse(localStorage.getItem("dailyMedicine"));
        if (dailyMedicine == null) {
            dailyMedicine = [];
        }
        dailyMedicine.push(medicine);
        localStorage.setItem("dailyMedicine", JSON.stringify(dailyMedicine));
    };

    var getDailyMedicines = function () {
        if (JSON.parse(localStorage.getItem("dailyMedicine") == null)) {
            localStorage.setItem("dailyMedicine", JSON.stringify([]));
        }
        JSON.parse(localStorage.getItem("dailyMedicine")).forEach(function (s) {

        });

        return JSON.parse(localStorage.getItem("dailyMedicine"));
    };

    var setDailyMedicineList = function (list) {
        localStorage.setItem("dailyMedicine", JSON.stringify(list));
        list.forEach(function (s) {
            var medicine;
            //medicine.patientID = dataService.get
            $http.post('http://tw06v033.ugent.be/Chronic1/rest/MedicineService/medicines', {headers: {'Authorization': getAuthorization()}}).
            success(function (data, status, headers, config) {
                alert("CONNECTED TO INTERNET OR DATABASE " + status)
                // Get advice for patient

                // Get new drugs

                // Get new symptoms
                var symptomsList = JSON.parse(localStorage.getItem("symptoms"));
                if (symptomsList == null) symptomsList = [];
                $http({method: 'GET', url: 'http://tw06v033.ugent.be/Chronic1/rest/SymptomService/symptoms'}).
                success(function (data, status, headers, config) {
                    //alert(""+data);
                    symptoms = data;
                    symptoms.forEach(function (entry) {
                        entry["val"] = false;
                    });
                    symptomsList.push.apply(symptoms);
                    localStorage.setItem("symptoms", JSON.stringify(symptomsList));
                }).
                error(function (data, status, headers, config) {
                    alert("error retrieving symptoms from database")
                });

                // Get new triggers
            }).
            error(function (data, status, headers, config) {
                alert("NO INTERNET OR DATABASE CONNECTION " + status)
            });
        });
    };

    var getPasswordHash = function () {
        passwordHash = JSON.parse(localStorage.getItem("passwordHash"));
        return passwordHash;
    };

    var getEmail = function () {
        var user = JSON.parse(localStorage.getItem("currentUser"));
        if(user != null) return user.email;
        else return "";
    };

    var getCodeList = function() {
        return new $q(
            function (resolve, reject) {
                $http({method: 'GET', url: 'http://tw06v033.ugent.be/Chronic1/rest/VersionService/verification'}).
                success(function (data, status, headers, config) {
                    //alert(""+data);
                    console.log('Got codes:', data);
                    resolve(data);
                }).
                error(function (data, status, headers, config) {
                    alert("error connecting to database "+data+" "+status)
                    reject(data);
                })
            });
    };

    var checkCode = function (_code, _list) {

    };

    var registerUser = function (_firstname, _lastname, _birthdate, _sex, _status, _employment, _email, _sha3, _patientID) {
        var user = {
            firstname: _firstname, lastname: _lastname, birthdate: _birthdate, sex: _sex, status: _status,
            employment: _employment, email: _email, passwordHash: _sha3, patientID: _patientID
        };
        console.log("User status = ", user.status);
        localStorage.setItem("currentUser", JSON.stringify(user));
        //TODO: register on the server or check if server already has this shit
    };

    var getCurrentUser = function(){
        return JSON.parse(localStorage.getItem("currentUser"));
    };

    var setGoogleResponse = function(googleResponse) {
        localStorage.setItem("googleResponse", JSON.stringify(googleResponse));
    }

    var getGoogleResponse = function() {
        return JSON.parse(localStorage.getItem("googleResponse"));
    }

    var setDailyLife = function (_city, _sportHours, _endSleep, _beginSleep, _alcohol, _tobacco, _cafeine, _breakfastTime, _lunchTime, _dinnerTime, _depression, _menstruationDate, _menstruationDuration) {
        var dailyLife = {
            city: _city, sportHours: _sportHours, endSleep: _endSleep, beginSleep: _beginSleep, alcohol: _alcohol,
            tobacco: _tobacco, cafeine: _cafeine, breakfastTime: _breakfastTime, lunchTime: _lunchTime, dinnerTime: _dinnerTime, depression: _depression,
            menstruationDate: _menstruationDate, menstruationDuration: _menstruationDuration
        };
        localStorage.setItem("dailyLife", JSON.stringify(dailyLife));
    };

    var getDailyLife = function () {
        return JSON.parse(localStorage.getItem("dailyLife"));
    };

    var getApiKey = function () {
        return "FiFoEdUdLOI4D19lj7Vb5pi72dDZf2aB";
    };

    var sendNewHeadachesToDB = function(){
        var headaches = JSON.parse(localStorage.getItem("headacheList"));
        if(headaches == null || headaches.length <1){
            console.log("no new headaches");
        }else{
            for (var headache in headaches){
                if(headaches[headache].id<1){
                    sendHeadacheToDB(headaches[headache]).then(function(result){
                        setCurrentHeadache(null);
                        var list = getHeadacheList();
                        headaches[headache].id = result.headacheID;
                        list.push(headaches[headache]);
                        setHeadacheList(list);
                    }, function(result){
                        console.log("fout bij toevoegen van nog niet in de database zittende headache");
                    });
                }
            }
        }
    };

    var sendNewDiariesToDB = function(){
        var diaries = JSON.parse(localStorage.getItem("diaryMap"));
        if(diaries == null || Object.keys(diaries).length <1){
            console.log("no new diary entries");
        } else{
            // send diaries from the last week to db (users might correct mistakes and such)
            for (var diarydate in diaries){
                var now = moment();
                var dateB = moment(diarydate, "DD/MM/YYYY");
                diff = now.diff(dateB, "day");

                if(diff < 7) {
                    sendDiaryToDB(diaries[diarydate]).then(function(result){
                        console.log("success");
                    }, function(result){
                        console.log("fout bij toevoegen van nog niet in de database zittende dagboek \n ");
                        console.log(result);
                    });
                }
            }
        }
    };

    var sendNewLocationsToDB = function(){
        locations = backgroundservice.getGPSList();
        // console.log(locations[0]);
        // for (i = 0; i < locations.length; i++) {
        //     sendLocationToDB(locations[i]);
        // }
        console.log(locations);
        if (locations !== null ) {
            sendBulkLocationsToDB(locations).then(function(result){
                backgroundservice.deleteHistory();
            }, function(result){
                console.log("fout bij het versturen van de locaties");
            });
        }

    };

    var sendNewMedicinesToDB = function(){
        var medicines = JSON.parse(localStorage.getItem("medicineList"));
        if(medicines == null || medicines.length <1){
            console.log("no new medicines");
        }else{
            for (var medicine in medicines){
                //console.log("medicine:"+medicine);
                //console.log("medicine:"+JSON.stringify(medicines[medicine]));

                if(medicines[medicine].id<1){
                    console.log("PRET EN RAPEN");
                    sendMedicineToDB(medicines[medicine]).then(function(result){
                        setCurrentMedicine(null);
                        var list = getMedicineList();
                        medicines[medicine].id = result.medicineID;
                        list.push(medicines[medicine]);
                        setMedicineList(list);
                    }, function(result){
                        //console.log("Rest fout");
                        //console.log($scope.medicine);
                        console.log("fout bij toevoegen van nog niet in de database zittende medicine");
                    });
                }
            }
        }
    };

    return {
        addHeadache: addHeadache,
        addMedicine: addMedicine,
        addDiary: addDiary,
        getHeadacheList: getHeadacheList,
        getMedicineList: getMedicineList,
        setMedicineList: setMedicineList,
        setHeadacheList: setHeadacheList,
        getDiaryMap: getDiaryMap,
        setDiaryMap: setDiaryMap,
        getGoogleResponse: getGoogleResponse,
        setGoogleResponse: setGoogleResponse,
        setCurrentHeadache: setCurrentHeadache,
        setCurrentMedicine: setCurrentMedicine,
        setCurrentDiaryDate: setCurrentDiaryDate,
        getCurrentDiaryDate: getCurrentDiaryDate,
        getCurrentHeadache: getCurrentHeadache,
        getCurrentMedicine: getCurrentMedicine,
        getCurrentUser: getCurrentUser,
        getDailyLife: getDailyLife,
        setDailyLife: setDailyLife,
        getSymptoms: getSymptoms,
        getTriggers: getTriggers,
        removeHeadache: removeHeadache,
        clearCache: clearCache,
        removeMedicine: removeMedicine,
        getHeadachesNoEnd: getHeadachesNoEnd,
        addDailyMedicine: addDailyMedicine,
        getDailyMedicines: getDailyMedicines,
        setDailyMedicineList: setDailyMedicineList,
        getDrugs: getDrugs,
        addDrug: addDrug,
        getPasswordHash: getPasswordHash,
        getEmail: getEmail,
        registerUser: registerUser,
        getApiKey: getApiKey,
        getAuthorization: getAuthorization,
        setAdvice: setAdvice,
        getAdvice: getAdvice,
        syncDB: syncDB,
        getDBStatus: getDBStatus,
        sendGoogleResponseToDB: sendGoogleResponseToDB,
        sendHeadacheToDB: sendHeadacheToDB,
        sendMedicineToDB: sendMedicineToDB,
        sendDiaryToDB: sendDiaryToDB,
        sendLocationToDB: sendLocationToDB,
        sendBulkLocationsToDB: sendBulkLocationsToDB,
        sendNewHeadachesToDB: sendNewHeadachesToDB,
        sendNewMedicinesToDB: sendNewMedicinesToDB,
        sendNewDiariesToDB: sendNewDiariesToDB,
        sendNewLocationsToDB: sendNewLocationsToDB,
        getCategories: getCategories,
        getCodeList: getCodeList,
        checkCode: checkCode
    };


});
