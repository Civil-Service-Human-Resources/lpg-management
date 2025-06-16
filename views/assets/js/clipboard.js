async function copyTextToClipboard(text){
    return navigator.clipboard.writeText(text)
}