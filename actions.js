
function loadActionsJSON (url, callback) {
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

function createToggleActionsVisibilityHandler (ident) {
  return function () {
    var x = document.getElementById(ident)
    if (x.style.display === 'none') {
      x.style.display = 'block'
    } else {
      x.style.display = 'none'
    }
  }
}

function actionsRepoListing (parent, report) {
  function byNumber (aName, bName) {
    var a = report.repos[aName] || 0
    var b = report.repos[bName] || 0
    if (a > b) {
      return -1
    } else if (b > a) {
      return 1
    } else {
      return 0
    }
  }

  var button = document.createElement('button')
  parent.appendChild(button)
  button.innerHTML = '<b>actions usage by feedstock</b>'
  button.onclick = createToggleActionsVisibilityHandler('github-actiions-list-repos')
  var repoList = document.createElement('ol')
  parent.appendChild(repoList)
  repoList.setAttribute('id', 'github-actiions-list-repos')
  var repos = []
  for (var key in report.repos) {
    repos.push(key)
  }
  repos.sort(byNumber)

  for (var i = 0; i < repos.length; i++) {
    var repo = repos[i]
    var repoItem = document.createElement('li')
    var innerHtml = ''

    innerHtml += '<a href="https://github.com/" + repo + "/actions">'
    innerHtml += '<b>' + repo + '</b>: ' + report.repos[repo]
    innerHtml += '</a>'
    repoItem.innerHTML = innerHtml
    repoList.appendChild(repoItem)
  }

  repoList.style.display = 'none'
}

function makeCanvas () {
  var canvas = document.createElement('canvas')
  canvas.height = 100
  var viewportWidth = viewport().width
  if (viewportWidth <= 600) {
    canvas.width = viewportWidth * 0.9
  } else if (viewportWidth <= 800) {
    canvas.width = viewportWidth * 0.7
  } else {
    canvas.width = 800
  }

  return canvas
}

function actionsTimeGraph (parent, report) {
  var canvas = makeCanvas()
  parent.appendChild(canvas)

  var labels = []
  var rates = []
  for (var key in report.rates) {
    var time = moment(key).local()
    labels.push(time)
    rates.push(report.rates[key])
  }

  var myChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: rates
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            stepSize: 1,
            callback: function (value, index, values) {
              return '' + parseInt(value)
            }
          },
          gridLines: {
            drawOnChartArea: false
          }
        }],
        xAxes: [{
          type: 'time',
          gridLines: {
            drawOnChartArea: false
          },
          time: {
            minUnit: 'hour'

          }
        }]
      }
    }
  })

  parent.appendChild(document.createElement('p'))
}

function actionsListing (report) {
  var parent = document.getElementById('github-actions-list')

  // time
  actionsTimeGraph(parent, report)

  // repos
  actionsRepoListing(parent, report)
}

function actionTotals (reportText) {
  var report = JSON.parse(reportText)
  var div = document.getElementById('github-actions-total')
  div.innerHTML = 'GitHub Actions ran ' + report.total + ' jobs in the past eight hours.'

  console.log(report)
  actionsListing(report)
}

var url = 'https://cf-action-counter.herokuapp.com/report'
loadActionsJSON(url, actionTotals)
