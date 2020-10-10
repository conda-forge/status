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
  div.innerHTML = report.status

  if (report.status === 'operational') {
    div.className = 'status operational'
  } else {
    div.className = 'status degraded performance'
  }
}

var url = 'https://conda-forge-status-monitor.herokuapp.com/status/webservices'
loadStatusBotJSON(url, displayStatusBot)

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

sleep(300).then(() => {
  var hashVal = window.location.hash.substr(1)
  var element = document.getElementById(hashVal)
  var yOffset = -30
  if (typeof element === 'undefined' || element == null) {
    element = document.getElementById('Container_' + hashVal)
    yOffset = -10
  }
  console.log(element)
  if (typeof element !== 'undefined') {
    var y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
    // element.scrollIntoView()
  }
})
