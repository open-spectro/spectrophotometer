


var webview=document.getElementById('iframe');

webview.addEventListener("contentload", function () {
    try{
        console.log("Trying to post message");

        window.setTimeout(function() {
            webview.contentWindow.postMessage("Message from Chrome APP!", "*");
        },1000)


    }catch(error){
        console.log("postMessage error: " + error);
    }

});



/*
webview.postMessage("abc", "*");
 */

window.addEventListener("message", receiveMessage, false);
function receiveMessage(event) {
    console.log("event received in the WINDOW");
    console.log(event);
}

