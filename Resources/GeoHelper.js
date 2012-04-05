var osname = Ti.Platform.osname;
var osversion = parseFloat(Titanium.Platform.version);

var GeoHelper = function(_args) {
	var geoHelper = {};
	
	// args proxy
	geoHelper.onSuccess = _args.onSuccess;
	geoHelper.onUpdate = _args.onUpdate;
	geoHelper.onError = _args.onError;
	geoHelper.purpose = _args.purpose ? _args.purpose : 'This message describes what you use geolocation services for.';
	geoHelper.minAccuracy = _args.minAccuracy ? _args.minAccuracy : 100; // once we get within 100 meters, that's good enough 
	geoHelper.timeout = _args.timeout ? _args.timeout : 30; // if you don't have what you need in 30 seconds, the user probably doesn't want to wait any more
	geoHelper.maxAge = _args.maxAge ? _args.maxAge : 0; // if the last good position was withing [maxAge] seconds, don't bother turning on the radios
	
	// data containers
	geoHelper.lastPosition;
	geoHelper.lastGoodPosition;
	var timeoutCall;
	
	// flags
	geoHelper.geolocating = false;
	
	if (osname == 'iphone') {
		if (osversion >= 3.2) {
			Ti.Geolocation.purpose = geoHelper.purpose;
		}
	}
	
	// this example requires Ti Mobile SDK 2.0.1 or newer 
	Ti.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_HIGH;
	
	geoHelper.findPosition = function(){
		// check to see if we can just recycle old data
		if (geoHelper.lastGoodPosition && geoHelper.lastGoodPosition.coords.timestamp + geoHelper.maxAge*1000 >= new Date().getTime()) {
			Ti.API.debug('using cached geolocation');
			geoHelper.onSuccess(geoHelper.lastGoodPosition);
		} else {
			// ok, we have to turn on some battery-draining stuff
			Ti.API.debug('starting to geolocate');
			geoHelper.geolocating = true;
			Ti.Geolocation.addEventListener('location',geoFound);
			timeoutCall = setTimeout(function(){
				Ti.API.debug('geolocation timed out, canceling');
				geoHelper.cancel();
				if (geoHelper.onError) {
					geoHelper.onError(geoHelper.lastPosition);
				}
			},geoHelper.timeout*1000);
		}
	}
	
	geoHelper.cancel = function(){
		Ti.API.debug('bye bye geolocate');
		Ti.Geolocation.removeEventListener('location',geoFound);
		geoHelper.geolocating = false;
		clearTimeout(timeoutCall);
	};
	
	var geoFound = function(_geo){
		Ti.API.debug('geoEvent: ' + JSON.stringify(_geo));
		if (geoHelper.onUpdate) {
			geoHelper.onUpdate(_geo);
		}
		if (_geo.success) {
			geoHelper.lastPosition = _geo;
			if (geoHelper.lastPosition.coords.accuracy <= geoHelper.minAccuracy) {
				clearTimeout(timeoutCall);
				Ti.Geolocation.removeEventListener('location',geoFound);
				geoHelper.geolocating = false;
				Ti.API.debug('using fresh geolocation');
				geoHelper.lastGoodPosition = geoHelper.lastPosition;
				geoHelper.onSuccess(geoHelper.lastGoodPosition);
			}
		}
	};
	
	// handle android pause/stop/resume events
	if (osname == 'android') {
		Ti.Android.currentActivity.addEventListener('pause', function() {
			if (geoHelper.geolocating) {
				geoHelper.stopGeo();
			}
		});
		Ti.Android.currentActivity.addEventListener('stop', function() {
			if (geoHelper.geolocating) {
				geoHelper.stopGeo();
			}
		});
		Ti.Android.currentActivity.addEventListener('resume', function() {
			if (geoHelper.geolocating) {
				geoHelper.startGeo();
			}
		});
	};
	
	return geoHelper;
};

module.exports = GeoHelper;
