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

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

var url = 'https://conda-forge.herokuapp.com/alive'
loadStatusBotJSON(url, displayStatusBot)

window.addEventListener('migratorsDone', function () {
  sleep(300).then(() => {
    var hashVal = window.location.hash.substr(1)
    var element = document.getElementById(hashVal)
    var yOffset = -30
    if (typeof element === 'undefined' || element == null) {
      element = document.getElementById('Container_' + hashVal)
    }
    console.log(element)
    if (typeof element !== 'undefined') {
      var y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  })
})
