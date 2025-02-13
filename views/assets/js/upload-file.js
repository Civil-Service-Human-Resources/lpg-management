window.onload = function () {
    if(document.getElementById('uploadButton')) {
        if(document.getElementById("mediaId").value !== "") {
            document.getElementById("uploadButton").style.display = "none"
        }

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
                const fileSizeLabel = getFileSizeLabel(event.total)

                document.getElementById("file-size").innerText = "File size: " + fileSizeLabel
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

document.getElementById("file-upload").onclick = function unHideUploadButton() {
    document.getElementById("uploadButton").style.display = "block"
}

function getFileSizeLabel(fileSizeInBytes){
    const fileSizeUnits = ["Bytes", "KB", "MB", "GB"]
    const sizeMultiple = 1024
    const fileSizeUnitIndex = Math.floor(Math.log(fileSizeInBytes) / Math.log(sizeMultiple))
    const decimalPlaces = 2

    const fileSizeLabel = parseFloat((fileSizeInBytes / Math.pow(sizeMultiple, fileSizeUnitIndex)).toFixed(decimalPlaces)) + ' ' + fileSizeUnits[fileSizeUnitIndex]
    return fileSizeLabel
}