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
  var OK_MIN = 90 * 60 * 1000 /* ms */
  var DEG_MIN = 120 * 60 * 1000 /* ms */
  var cloningStatus = document.getElementsByClassName('cloning')[0].getElementsByClassName('cdn-status')[0]
  var cdnTimeMin = Math.round((nowDate.getTime() - lastUpdatedDate.getTime()) / 60.0 / 1000.0)
  if ((nowDate.getTime() - lastUpdatedDate.getTime()) < OK_MIN) {
    cloningStatus.className = 'status operational'
    cloningStatus.innerHTML = 'operational' + ' (last cloned ' + cdnTimeMin + ' minutes ago)'
  } else if ((nowDate.getTime() - lastUpdatedDate.getTime()) < DEG_MIN) {
    cloningStatus.className = 'status degraded performance'
    cloningStatus.innerHTML = 'degraded' + ' (last cloned ' + cdnTimeMin + ' minutes ago)'
  } else {
    cloningStatus.className = 'status major outage'
    cloningStatus.innerHTML = 'major outage' + ' (last cloned ' + cdnTimeMin + ' minutes ago)'
  }
}

var url = 'https://s3.amazonaws.com/conda-static.anaconda.org/conda-forge/last-updated'
loadTXT(url, updateStatus)
