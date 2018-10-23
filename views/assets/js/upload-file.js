window.onload = function () {
    if(document.getElementById('uploadButton')) {
        document.getElementById('uploadButton').onclick = function upload() {
            let formData = new FormData()
            let fileInput = document.getElementById('file-upload')
            let file = fileInput.files[0]
            let courseId = document.getElementById('courseId').value

            formData.append('file', file)
            formData.append('container', courseId)

            let xhttp = new XMLHttpRequest()

            xhttp.upload.onprogress = function (event) {
                const loaded = Math.round((event.loaded / event.total) * 100)
                document.getElementById("progress").innerText = "Uploading ( " + loaded + "% ) "
                document.getElementById("file-size").innerText = "File size: " + (event.total / 1000000).toPrecision(3) + "MB"
                document.getElementById("submitButton").disabled = true

                if(event.total > 100000000){
                    document.getElementById("file-size-warning").style.display = "block"
                }

                if(loaded == 100){
                    document.getElementById("progress").innerText = "File processing (this may take a while)..."
                }
            }

            xhttp.onreadystatechange = function () {
                if (this.readyState == this.HEADERS_RECEIVED) {
                    const mediaLocation = xhttp.getResponseHeader("Location")
                    const mediaId = mediaLocation.substr(mediaLocation.lastIndexOf("/") + 1)
                    document.getElementById("mediaId").value = mediaId;

                    document.getElementById("uploadButton").style.display = "none"

                    if(document.getElementById("file-size-warning")) {
                        document.getElementById("file-size-warning").style.display = "none"
                    }

                    document.getElementById("submitButton").disabled = false

                    document.getElementById("progress").innerText = "File uploaded"
                }
            }

            xhttp.open("POST", document.getElementById("courseCatalogueUrl").value, true)
            xhttp.setRequestHeader("Authorization", 'BEARER ' + document.getElementById("accessToken").value)
            xhttp.send(formData)
            return false
        }
    }
}