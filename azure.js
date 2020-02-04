function loadAzureStatusJSON (url, callback) {
  var xobj = new XMLHttpRequest()
  xobj.overrideMimeType('application/json')
  xobj.open('GET', url, true)
  xobj.onreadystatechange = function () {
    if (xobj.readyState === 4 && xobj.status === 200) {
      // Required use of an anonymous callback as .open will NOT return a value
      // but simply returns undefined in asynchronous mode
      callback(xobj.responseText)
    }
  }
  xobj.send(null)
}

function displayAzureStatus (reportText) {
  var report = JSON.parse(reportText)
  var div = document.getElementById('azure-status')
  div.innerHTML = report.status

  if (report.status === 'Everything is looking good') {
    div.className = 'status operational'
  } else {
    div.className = 'status degraded performance'
  }
}

var url = 'https://conda-forge-status-monitor.herokuapp.com/status/azure'
loadAzureStatusJSON(url, displayAzureStatus)
