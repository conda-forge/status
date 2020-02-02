function loadStatusBotJSON (url, callback) {
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

function displayStatusBot (reportText) {
  var report = JSON.parse(reportText)
  var div = document.getElementById('webservices-status')
  div.innerHTML = report.webservices

  if (report.webservices === 'operational') {
    div.className = 'status operational'
  } else {
    div.className = 'status degraded performance'
  }
}

var url = 'https://conda-forge-status-monitor.herokuapp.com/status'
loadStatusBotJSON(url, displayStatusBot)
