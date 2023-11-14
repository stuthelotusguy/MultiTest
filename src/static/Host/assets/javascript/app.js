/* This is the host, or originator of the game */

var RoomObject = {
    
	doQRCode: function () {
        var QRText = "//192.168.1.179:2567/TV/mainscreen.html";
        var qrcode = new QRCode(document.getElementById("qrcode"), {
            width : size,
            height : size
        });

        function makeCode () {

            qrcode.makeCode(QRText);
        }

        makeCode();

	document.getElementById('createBtn').style.visibility = "hidden";
	document.getElementById('qrcode').style.visibility = "visible";

    },

    join : function () {
        //Go the the client app
        window.location.replace("//192.168.1.179:2567/Clients/client.html");
    }

}



window.onload = function () {

	document.getElementById('qrcode').style.visibility = "hidden";

	$('.tooltipped').tooltip({
		delay: 50
	});

	//after 3.5sec, add animation on startBtn
	setTimeout ( function () {
		$('#createBtn').removeClass('bounceInUp').addClass('infinite pulse');
	}, 3500);
}

