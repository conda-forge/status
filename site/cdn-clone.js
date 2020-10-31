function loadTXT (url, callback) {
  var xobj = new XMLHttpRequest()
  xobj.open('GET', url, true)
  xobj.onreadystatechange = function () {
    if (xobj.readyState === 4 && xobj.status === 200) {
      callback(xobj.responseText)
    }
  }
  xobj.send(null)
}

function updateStatus (lastUpdated) {
  var nowDate = new Date()
  var lastUpdatedDate = new Date(lastUpdated.trim())
  var THIRTY_MIN = 30 * 60 * 1000 /* ms */
  var cloningStatus = document.getElementsByClassName('cloning')[0].getElementsByClassName('cdn-status')[0]
  var cdnTimeMin = Math.round((nowDate.getTime() - lastUpdatedDate.getTime()) / 60.0 / 1000.0)
  if ((nowDate.getTime() - lastUpdatedDate.getTime()) < THIRTY_MIN) {
    cloningStatus.className = 'status operational'
    cloningStatus.innerHTML = 'operational' + ' (cloned ' + cdnTimeMin + ' minutes ago)'
  } else {
    cloningStatus.className = 'status degraded performance'
    cloningStatus.innerHTML = 'degraded' + ' (cloned ' + cdnTimeMin + ' minutes ago)'
  }
}

var url = 'https://s3.amazonaws.com/conda-static.anaconda.org/conda-forge/last-updated'
loadTXT(url, updateStatus)
