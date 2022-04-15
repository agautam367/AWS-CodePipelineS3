var apigClient = apigClientFactory.newClient();
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition

function voiceSearch(){
    if ('SpeechRecognition' in window) {
        console.log("SpeechRecognition is Working");
    } else {
        console.log("SpeechRecognition is Not Working");
    }
    
    var inputSearchQuery = document.getElementById("search_query");
    const recognition = new window.SpeechRecognition();
    //recognition.continuous = true;

    micButton = document.getElementById("mic_search");  
    
    if (micButton.innerHTML == "mic") {
        recognition.start();
    } else if (micButton.innerHTML == "mic_off"){
        recognition.stop();
    }

    recognition.addEventListener("start", function() {
        micButton.innerHTML = "mic_off";
        console.log("Recording.....");
    });

    recognition.addEventListener("end", function() {
        console.log("Stopping recording.");
        micButton.innerHTML = "mic";
    });

    recognition.addEventListener("result", resultOfSpeechRecognition);
    function resultOfSpeechRecognition(event) {
        const current = event.resultIndex;
        transcript = event.results[current][0].transcript;
        inputSearchQuery.value = transcript;
        console.log("transcript : ", transcript)
    }
}

function searchPhotos() {

    var searchQuery = document.getElementById('search_query');
    var photosDiv = document.getElementById("search_results");
    console.log(searchQuery);

    if (!searchQuery.value) {
        alert('Please enter search query!');
    }
    else{
        // document.getElementById('search_query').value = searchQuery;
    photosDiv.innerHTML = "<h4 style=\"text-align:center\">";
    var uploadMsgDiv = document.getElementById("upload_message");
    uploadMsgDiv.value = "";

    var params = {
        'q' : searchQuery.value
    };

    apigClient.searchGet(params, {}, {})
        .then(function(result) {
            console.log("Result : ", result);

            paths = result["data"];
            console.log("paths : ", paths);

            // var photosDiv = document.getElementById("search_results");
            photosDiv.innerHTML = "";

            var i;
            if (paths.length > 0){
                for (i = 0; i < paths.length; i++) {
                img = paths[i].split('/');
                imgName = img[img.length - 1];

                if (i%3 === 0){
                    if (i === 0){
                        photosDiv.innerHTML += '<div class="row">';
                    }
                    else{
                        photosDiv.innerHTML += '</div><div class="row">';
                    }
                }

                // photosDiv.innerHTML += '<figure><img src="' + paths[i] + '" style="width:25%"><figcaption>' + imgName + '</figcaption></figure>';
                photosDiv.innerHTML += '<div class="column"><figure><img src="' + paths[i] + '" style="width:25%;"><figcaption>' + imgName + '</figcaption></figure></div>';

                if (i === paths.length - 1){
                    photosDiv.innerHTML += '</div>'
                }

                }
            }
            else{
                photosDiv.innerHTML += '<h1>NO images exist!</h1>';
            }

        }).catch(function(result) {
            console.log(result);
        });
    }
}

function uploadPhoto() {
    var uploadMsgDiv = document.getElementById("upload_message");
    uploadMsgDiv.value = "";
    var filePath = (document.getElementById('uploaded_file').value).split("\\");
    var fileName = filePath[filePath.length - 1];
    
    // if (!document.getElementById('custom_labels').innerText == "") {
    //     var customLabels = document.getElementById('custom_labels');
    // }
    var customLabels = document.getElementById('custom_labels');
    console.log(fileName);
    console.log(custom_labels.value);

    var reader = new FileReader();
    var file = document.getElementById('uploaded_file').files[0];
    console.log('File : ', file);
    document.getElementById('uploaded_file').value = "";


    // if ((filePath == "") || (!['png', 'jpg', 'jpeg'].includes(filePath.split(".")[1]))) {
    //     alert("Please upload a valid .png/.jpg/.jpeg file!");
    // } else {

    var params = {
        "filename": fileName,
    };
    var additionalParams = {
        "headers":{
            'Content-Type': "base64",
            "Accept": "*/*",
            "x-amz-meta-customLabels": customLabels.value
        }
    };

    reader.onload = function (event) {
        body = btoa(event.target.result);
        console.log('Reader body : ', body);
        return apigClient.uploadFilenamePut(params, body, additionalParams)
        .then(function(result) {
            console.log(result);
            if (result["status"] === 200){
                uploadMsgDiv.innerHTML = '<h1>Image uploaded successfully!</h1>';
            }
            else{
                uploadMsgDiv.innerHTML = '<h1>Something went wrong!</h1>';
            }
        })
        .catch(function(error) {
            console.log(error);
        })
    }
    reader.readAsBinaryString(file);
}
