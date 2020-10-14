function loadTXT(url, callback) {

    var xobj = new XMLHttpRequest();
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function updateStatus(last_updated) {
  var now_date = new Date();
  var last_updated_date = new Date(last_updated.trim())
  var TIMEOUT_MIN = 45 * 60 * 1000; /* ms */
  var cloning_status = document.getElementsByClassName("cloning")[0].getElementsByClassName("cdn-status")[0]
  if ((now_date.getTime() - last_updated_date.getTime()) < TIMEOUT_MIN){
    cloning_status.className = "status operational"
    cloning_status.innerHTML = "operational"
  } else {
    cloning_status.className = "status degraded performance"
    cloning_status.innerHTML = "degraded"
  }

}

var url = "https://s3.amazonaws.com/conda-static.anaconda.org/conda-forge/last-updated"
loadTXT(url, updateStatus)
