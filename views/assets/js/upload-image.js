window.onload = function () {
    if (document.getElementById("label-file-upload").innerText == "Choose file" ) {
        document.getElementById("alternativeTextHeader").style.display = 'none';
        document.getElementById("alternativeText").style.display = 'none';
    }

    if(document.getElementById("removeImageButton") && document.getElementById("label-file-upload").innerText == "Choose file") {
        document.getElementById("removeImageButton").style.display = "none"
    }


    if(document.getElementById('uploadImageButton')) {
        if(document.getElementById("mediaId").value !== "") {
            document.getElementById("uploadImageButton").style.display = "none"
        }



        document.getElementById('uploadImageButton').onclick = function upload() {
            let formData = new FormData()
            let fileInput = document.getElementById('file-upload')
            let file = fileInput.files[0]

            formData.append('file', file)
            formData.append('container', 'quiz-images')

            let xhttp = new XMLHttpRequest()

            xhttp.upload.onprogress = function (event) {
                document.getElementById("progress").style.display = 'block';

                const loaded = Math.round((event.loaded / event.total) * 100)
                document.getElementById("progress").innerText = "Uploading ( " + loaded + "% ) "
                document.getElementById("file-size").innerText = "File size: " + (event.total / 1000000).toPrecision(3) + "MB"
                document.getElementById("submitButton").disabled = true

                if(event.total > 100000000){
                    document.getElementById("file-size-warning").style.display = "block"
                }

                if(loaded == 100){
                    document.getElementById("progress").style.color = "black";
                    document.getElementById("progress").innerText = "File processing (this may take a while)..."
                }

            }

            xhttp.onreadystatechange = function () {
                if (this.readyState == this.HEADERS_RECEIVED) {
                    const mediaLocation = xhttp.getResponseHeader("Location")
                    const mediaId = mediaLocation.substr(mediaLocation.lastIndexOf("/") + 1)
                    document.getElementById("mediaId").value = mediaId;

                    document.getElementById("uploadImageButton").style.display = "none"

                    if(document.getElementById("file-size-warning")) {
                        document.getElementById("file-size-warning").style.display = "none"
                    }

                    document.getElementById("submitButton").disabled = false

                    document.getElementById("progress").innerText = "File uploaded"

                    document.getElementById("alternativeText").style.display = 'block';
                    document.getElementById("alternativeTextHeader").style.display = 'block';
                }


                if ( this.readyState == 4 &&
                    ( this.status == 500 || this.status == 400 )) {
                    document.getElementById("progress").style.color = "red";
                    document.getElementById("progress").innerText = "Image upload failed. Please upload an image which is not greater than 5MB in size and not exceeding 960p width X 640p height."
                }

            }

            xhttp.open("POST", document.getElementById("courseCatalogueUrl").value, true)
            xhttp.setRequestHeader("Authorization", 'BEARER ' + document.getElementById("accessToken").value)
            xhttp.send(formData)

            xhttp.onload = function () {
                document.getElementById("mediaId").value = xhttp.getResponseHeader('location')
            };
            return false
        }
    }
}

document.getElementById("file-upload").onclick = function unHideUploadButton() {
    document.getElementById("uploadImageButton").style.display = "block"
    document.getElementById("alternativeTextHeader").style.display = 'none';
    document.getElementById("alternativeText").style.display = 'none';
    document.getElementById("progress").style.display = 'none';

}

document.getElementById("removeImageButton").onclick = function HideRemoveButton() {
    document.getElementById("removeImageButton").style.display = "none"
    document.getElementById("label-file-upload").innerText = "Choose file"
    document.getElementById("imageRemoved").value = "True"
    document.getElementById("alternativeTextHeader").style.display = 'none';
    document.getElementById("alternativeText").style.display = 'none';
}



