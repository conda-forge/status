
function loadJobsJSON (url, callback) {
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

function repoListing (parent, report) {
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
  button.onclick = createToggleActionsVisibilityHandler('github-actions-list-repos')
  var repoList = document.createElement('ol')
  parent.appendChild(repoList)
  repoList.setAttribute('id', 'github-actions-list-repos')
  var repos = []
  for (var key in report.repos) {
    repos.push(key)
  }
  repos.sort(byNumber)

  for (var i = 0; i < repos.length; i++) {
    var repo = repos[i]
    var repoItem = document.createElement('li')
    var innerHtml = ''

    innerHtml += '<a href="https://github.com/' + repo + '/actions">'
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

function timeGraph (parent, report) {
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
            precision: 0,
            maxTicksLimit: 5,
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

function actionsTotals (reportText) {
  var report = JSON.parse(reportText)
  var div = document.getElementById('github-actions-total')
  div.innerHTML = 'GitHub Actions ran ' + report.total + ' jobs in the past eight hours.'

  var parent = document.getElementById('github-actions-list')

  timeGraph(parent, report)

  // repoListing(parent, report)
}

function azureTotals (reportText) {
  var report = JSON.parse(reportText)
  var div = document.getElementById('azure-pipelines-total')
  div.innerHTML = 'Azure Piplines ran ' + report.total + ' jobs in the past eight hours.'

  var parent = document.getElementById('azure-pipelines-list')

  timeGraph(parent, report)
}

function travisTotals (reportText) {
  var report = JSON.parse(reportText)
  var div = document.getElementById('travis-ci-total')
  div.innerHTML = 'Travis CI ran ' + report.total + ' jobs in the past eight hours.'

  var parent = document.getElementById('travis-ci-list')

  timeGraph(parent, report)
}

function circleciTotals (reportText) {
  var report = JSON.parse(reportText)
  var div = document.getElementById('circleci-total')
  div.innerHTML = 'CircleCI ran ' + report.total + ' jobs in the past eight hours.'

  var parent = document.getElementById('circleci-list')

  timeGraph(parent, report)
}

function appveyorTotals (reportText) {
  var report = JSON.parse(reportText)
  var div = document.getElementById('appveyor-total')
  div.innerHTML = 'AppVeyor ran ' + report.total + ' jobs in the past eight hours.'

  var parent = document.getElementById('appveyor-list')

  timeGraph(parent, report)
}

function droneTotals (reportText) {
  var report = JSON.parse(reportText)
  var div = document.getElementById('drone-total')
  div.innerHTML = 'Drone ran ' + report.total + ' jobs in the past eight hours.'

  var parent = document.getElementById('drone-list')

  timeGraph(parent, report)
}

var azureUrl = 'https://conda-forge-status-monitor.herokuapp.com/report/azure-pipelines'
loadJobsJSON(azureUrl, azureTotals)

var githubUrl = 'https://conda-forge-status-monitor.herokuapp.com/report/github-actions'
loadJobsJSON(githubUrl, actionsTotals)

var travisUrl = 'https://conda-forge-status-monitor.herokuapp.com/report/travis-ci'
loadJobsJSON(travisUrl, travisTotals)

var circleciUrl = 'https://conda-forge-status-monitor.herokuapp.com/report/circleci'
loadJobsJSON(circleciUrl, circleciTotals)

var appveyorUrl = 'https://conda-forge-status-monitor.herokuapp.com/report/appveyor'
loadJobsJSON(appveyorUrl, appveyorTotals)

var droneUrl = 'https://conda-forge-status-monitor.herokuapp.com/report/drone'
loadJobsJSON(droneUrl, droneTotals)
