cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-mauron85-background-geolocation/www/backgroundGeolocation.js",
        "id": "cordova-plugin-mauron85-background-geolocation.backgroundGeolocation",
        "pluginId": "cordova-plugin-mauron85-background-geolocation",
        "clobbers": [
            "backgroundGeolocation"
        ]
    },
    {
        "file": "plugins/cordova-plugin-googleplus/www/GooglePlus.js",
        "id": "cordova-plugin-googleplus.GooglePlus",
        "pluginId": "cordova-plugin-googleplus",
        "clobbers": [
            "window.plugins.googleplus"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.3.3",
    "cordova-plugin-mauron85-background-geolocation": "2.3.3",
    "cordova-plugin-googleplus": "5.2.1"
}
// BOTTOM OF METADATA
});