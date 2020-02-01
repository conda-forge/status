
function loadCIHTML (url, service, slug, callback) {
  var xobj = new XMLHttpRequest()
  // xobj.overrideMimeType('application/json')
  xobj.open('GET', url, true)
  xobj.responseType = 'document'
  xobj.onreadystatechange = function () {
    if (xobj.readyState === 4 && xobj.status === 200) {
      // Required use of an anonymous callback as .open will NOT return a value
      // but simply returns undefined in asynchronous mode
      callback(service, slug, xobj.response, url)
    }
  }
  xobj.send(null)
}

function displayStatus (service, slug, htmlDocument, url) {
  var div = document.getElementById('ciStatusDiv-' + slug)
  div.innerHTML = ''
  var p = document.createElement('h5')
  var s = document.createElement('span')
  div.appendChild(p)
  p.innerHTML = '<a href="' + url + '">' + service + ' status</a>' + ': '
  p.appendChild(s)

  var stat = htmlDocument.getElementsByClassName('status')[0].getElementsByClassName('font-large')[0].innerHTML
  stat = stat.trim()
  if (stat.toLowerCase() === 'all systems operational') {
    s.innerHTML = stat
    s.className = 'status operational'
  } else {
    try {
      var _s = htmlDocument.getElementsByClassName('status')[0].getElementsByClassName('font-large')[0]
      s.innerHTML = _s.childNodes[1].innerHTML
      s.className = 'status degraded performance'
    } catch (e) {
      s.innerHTML = 'No Status Available'
    }
  }
}

loadCIHTML('https://www.githubstatus.com/', 'GitHub', 'github', displayStatus)
loadCIHTML('https://www.traviscistatus.com', 'Travis CI', 'travis', displayStatus)
loadCIHTML('https://status.circleci.com', 'CircleCI', 'circle', displayStatus)
loadCIHTML('https://status.appveyor.com', 'AppVeyor', 'appveyor', displayStatus)
