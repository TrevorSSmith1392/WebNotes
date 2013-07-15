//Parse Content Hack
function parseContentFromHtml (html){
    var div = document.createElement("div");
    div.innerHTML = html;
    return div.innerText;
}
