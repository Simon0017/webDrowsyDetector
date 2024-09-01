const switchMode = document.querySelector('button.mode-switch'),
body = document.querySelector('body'),
closeBtn = document.querySelector('.btn-close-right'),
rightSide = document.querySelector('.right-side'),
expandBtn = document.querySelector('.expand-btn');

switchMode.addEventListener('click', () => {
  body.classList.toggle('dark');
});
closeBtn.addEventListener('click', () => {
  rightSide.classList.remove('show');
  expandBtn.classList.add('show');
});
expandBtn.addEventListener('click', () => {
  rightSide.classList.add('show');
  expandBtn.classList.remove('show');
});

// code for the Drowsy detector
console.log("Test for JS integration complete...."); // Test for connection

// start the websocket
function startWebsocket(){
  const ws =  new WebSocket('ws://' + window.location.host + '/ws/drowsyDet/');

  ws.onopen = function(e) {
    console.log("Successfully connected to the WebSocket.");
  }

  ws.onclose = function(e) {
    console.log("WebSocket connection closed unexpectedly. Trying to reconnect in 2s...");
    setTimeout(startWebsocket,2000);
    
  };
  return ws;
}
const ws = startWebsocket();
ws.binaryType = 'arraybuffer';
// Select the video element
const video = document.getElementById('webcam');

const canvas = document.getElementById('canvas');
if (canvas){
  console.log('canvas captured successfully');
}
const ctx = canvas.getContext('2d');

let videoStream = null;

// Function to start the video stream
function startVideo(deviceId = null) {
    // Set video constraints
    const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true
    };

    // Request access to the webcam
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            // Set the video element's source to the webcam stream
            videoStream = stream;
            video.srcObject = stream;

            function sendFrame() {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              canvas.toBlob((blob) => {
                  blob.arrayBuffer().then(buffer => {
                      ws.send(buffer);
                  });
              }, 'image/jpeg', 0.7); // Quality between 0.0 and 1.0
            }

            // Send frames at 25 frames per second
            setInterval(sendFrame, 40); // 1000ms / 25fps ≈ 40ms
        })
        .catch(function(error) {
            console.error('Error accessing the webcam: ', error);
        });
}

// Function to get the list of video devices (cameras)
function getVideoDevices() {
    return navigator.mediaDevices.enumerateDevices().then(devices => {
        return devices.filter(device => device.kind === 'videoinput');
    });
}

// Function to flip the camera
function flipCamera() {
    getVideoDevices().then(videoDevices => {
        if (videoDevices.length > 1) {
            // Get the ID of the other camera
            const currentDeviceId = video.srcObject.getVideoTracks()[0].getSettings().deviceId;
            const newDeviceId = videoDevices.find(device => device.deviceId !== currentDeviceId).deviceId;

            // Stop the current stream before switching
            video.srcObject.getTracks().forEach(track => track.stop());

            // Start the video stream with the new camera
            startVideo(newDeviceId);
        }
    });
}

 // Function to stop the video stream
 function stopVideo() {
  if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop()); // Stop the video tracks
      video.srcObject = null; // Remove the video source
  }
}

// Function to toggle the video stream
function toggleVideo() {
  const toggleButton = document.getElementById('toggle-video');
  if (videoStream) {
      stopVideo();
      console.log("Video stopped. No data is being sent.");
  } else {
      startVideo();
      console.log("Video started. Data is being sent.");
  }
}

// Add event listener to the toggle button
document.getElementById('toggle-video').addEventListener('click', toggleVideo);

// Check if the browser supports getUserMedia
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Start the video stream with the default camera
    startVideo();

    // Optionally, add a button to flip the camera
    const flipButton = document.getElementById('flip');
    if (flipButton) {
        console.log('flip button captured');
        flipButton.addEventListener('click', flipCamera);
    }
} else {
    console.error('getUserMedia not supported in this browser.');
}

ws.onmessage = function(e) {
  const data = JSON.parse(e.data);
  console.log(data);
}