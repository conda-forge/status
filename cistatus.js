
function loadCIHTML (url, service, slug, callback) {
  var xobj = new XMLHttpRequest()
  // xobj.overrideMimeType('application/json')
  xobj.open('GET', url, true)
  xobj.responseType = 'document'
  xobj.onreadystatechange = function () {
    if (xobj.readyState === 4 && xobj.status === 200) {
      // Required use of an anonymous callback as .open will NOT return a value
      // but simply returns undefined in asynchronous mode
      callback(service, slug, xobj.response)
    }
  }
  xobj.send(null)
}

function displayStatus (service, slug, htmlDocument) {
  var div = document.getElementById('ciStatusDiv-' + slug)
  div.innerHTML = ''
  var p = document.createElement('h5')
  var s = document.createElement('span')
  div.appendChild(p)
  p.innerHTML = service + ': '
  p.appendChild(s)

  var stat = htmlDocument.getElementsByClassName('status')[0].getElementsByClassName('font-large')[0].innerHTML
  stat = stat.trim()
  s.innerHTML = stat
  if (stat.toLowerCase() === 'all systems operational') {
    s.className = 'status operational'
  } else {
    s.className = 'status degraded performance'
  }
}

loadCIHTML('https://www.traviscistatus.com', 'Travis CI', 'travis', displayStatus)
loadCIHTML('https://status.circleci.com', 'CircleCI', 'circle', displayStatus)
loadCIHTML('https://status.appveyor.com', 'AppVeyor', 'appveyor', displayStatus)
