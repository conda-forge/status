function loadOpenStatusJSON (url, callback) {
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

function displayOpenGPUServerStatus (reportText) {
  var report = JSON.parse(reportText)
  var div = document.getElementById('open-gpu-server-status')
  
  if (report.status === 'operational') {
      div.className = 'status operational'
      div.innerHTML = 'All Systems Operational'
  } else {
      div.className = 'status degraded performance'
      div.innerHTML = report.status
  }
}

var url = 'https://conda-forge.herokuapp.com/status-monitor/open-gpu-server'
loadOpenStatusJSON(url, displayOpenGPUServerStatus)
