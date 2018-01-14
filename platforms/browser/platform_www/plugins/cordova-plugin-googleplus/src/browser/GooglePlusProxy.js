cordova.define("cordova-plugin-googleplus.GooglePlusProxy", function(require, exports, module) { var __googleSdkReady = false;
var __googleCallbacks = [];

var GooglePlusProxy = {

    isAvailable: function (success, error) {
        if (!__googleSdkReady) {
            return __googleCallbacks.push(function() {
                this.isAvailable(success, error);
            });
        }

        success(window.gapi !== undefined);
    },

    updateSigninStatus: function (isSignedIn, success, error) {
        if (isSignedIn) {
            var auth2 = gapi.auth2.getAuthInstance();
            var user = auth2.currentUser.get();
            if (!user) {
                error({'error': 'User not found.'});
                return false;
            }

            var profile = user.getBasicProfile();
            var authResponse = user.getAuthResponse(true);
            if (success) {
                success({
                    "accessToken": authResponse['access_token'],
                    "expires": authResponse['expires_at'],
                    "expires_in": authResponse['expires_in'],
                    "idToken": authResponse['id_token'],
                    "serverAuthCode": authResponse['server_auth_code'],
                    "email": profile.getEmail(),
                    "userId": profile.getId(),
                    "displayName": profile.getName(),
                    "familyName": profile.getFamilyName(),
                    "givenName": profile.getGivenName(),
                    "imageUrl": profile.getImageUrl()
                });
            }

        } else {
            if (error) error({'error': 'User not logged in.'});
        }
    },

    trySilentLogin: function (success, error, options) {
        if (!__googleSdkReady) {
            return __googleCallbacks.push(function() {
                this.trySilentLogin(success, error, options);
            });
        }

        GooglePlusProxy.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get(), success, error);
    },

    login: function (success, error, options) {
        var that = this;
        if (!__googleSdkReady) {
            return __googleCallbacks.push(function() {
                that.login(success, error, options);
            });
        }

        gapi.auth2.getAuthInstance().signIn(options).then(function () {
            GooglePlusProxy.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get(), success, error);
        }, function(err) {
            error(err);
        });
    },

    logout: function (success, error) {
        if (!__googleSdkReady) {
            return __googleCallbacks.push(function() {
                this.logout(success, error);
            });
        }

        gapi.auth2.getAuthInstance().signOut().then(success, function(err) {
            error(err);
        });
    },

    disconnect: function (success, error) {
        if (!__googleSdkReady) {
            return __googleCallbacks.push(function() {
                this.disconnect(success, error);
            });
        }

        gapi.auth2.getAuthInstance().disconnect().then(success, function(err) {
            error(err);
        });
    },

    getSigningCertificateFingerprint: function (success, error) {
        console.warn('Not implemented.');
        console.trace();
    }
};

if (window.location.protocol === "file:") {
    console.warn("Google API is not supported when using file:// protocol");
} else {
    window.handleClientLoad = function() {
        gapi.load('auth2', function () {
            gapi.auth2.init({
                client_id: "175384751988-oh6m3dr3hg6i2ou68svi1rj7145lo4hf.apps.googleusercontent.com", // CLIENT_ID is populated by the cordova after_prepare hook
				'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.activity.write https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.body.write https://www.googleapis.com/auth/fitness.location.read https://www.googleapis.com/auth/fitness.location.write https://www.googleapis.com/auth/fitness.nutrition.read https://www.googleapis.com/auth/fitness.nutrition.write',
				//'webClientId': '175384751988-oh6m3dr3hg6i2ou68svi1rj7145lo4hf', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
				//'offline': true
            }).then(function () {
                __googleSdkReady = true;

                for (var i = 0; i < __googleCallbacks.length; i++) {
                    __googleCallbacks[i].call(GooglePlusProxy);
                }

                // Listen for sign-in state changes.
                gapi.auth2.getAuthInstance().isSignedIn.listen(GooglePlusProxy.updateSigninStatus);
            }, function(error) {
                if (error.details) {
                    console.error(error.details);
                } else {
                    console.error(error);
                }
            });
        });
    };

    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.onload = function () { window.handleClientLoad(); };
        js.onreadystatechange = function () { if (this.readyState === 'complete') js.onload(); };
        js.src = "https://apis.google.com/js/api.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'googleplus-jssdk'));
}

module.exports = GooglePlusProxy;
require("cordova/exec/proxy").add("GooglePlus", module.exports);

});
