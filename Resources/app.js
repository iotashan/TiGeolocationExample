// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Ti.UI.setBackgroundColor('#000');

var GeoHelper = require('GeoHelper');

var win = Ti.UI.createWindow({  
    title:'Geolocation Example',
    backgroundColor:'#fff',
});

var geoButton = Ti.UI.createButton({
	title:'Get my Location',
	top:10,
	height:60,
	width:250,
});
win.add(geoButton);

var debugBox = Ti.UI.createTextArea({
	bottom:10,
	top:80,
	left:10,
	right:10,
	borderColor:'#000',
	color:'#333',
	font:{size:10},
	editable:false,
	value:'Log:\n',
});
win.add(debugBox);

var updateCount = 0;

var myGeoHelper = new GeoHelper({
	onSuccess:function(e) {
		debugBox.value += 'Success: ' + JSON.stringify(e) + '\n';
		waitDialog.hide();
		// display an alert on a delay so waitDialog has time to close
		setTimeout(function(){
			alert('You are at '+e.coords.latitude+','+e.coords.longitude);
		},500);
	},
	onError:function(e) {
		debugBox.value += 'Error: ' + JSON.stringify(e) + '\n';
		waitDialog.hide();
	},
	onUpdate:function(e) {
		// we don't show a waiting screen unless we turn on the radios
		updateCount++;
		if (updateCount === 1) {
			waitDialog.show();
		}
		debugBox.value += 'Update: ' + JSON.stringify(e) + '\n';
	},
	purpose:'Geolocation Demo',
	minAccuracy:50,
	maxAge:45,
});

var waitDialog = Titanium.UI.createAlertDialog({
    title: '',
    message: 'Getting your phone\'s location',
    buttonNames: ['Cancel'],
    cancel:0
});

waitDialog.addEventListener('click',function(){
	myGeoHelper.cancel();
});

geoButton.addEventListener('click',function(){
	myGeoHelper.findPosition();
});

win.open();
