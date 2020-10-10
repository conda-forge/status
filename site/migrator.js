function viewport () {
  var e = window
  var a = 'inner'
  if (!('innerWidth' in window)) {
    a = 'client'
    e = document.documentElement || document.body
  }
  return {
    width: e[a + 'Width'],
    height: e[a + 'Height']
  }
}

function makeContext (elementId) {
  var migratorCanvas = document.getElementById(elementId)
  migratorCanvas.height = 100
  var viewportWidth = viewport().width
  if (viewportWidth <= 600) {
    migratorCanvas.width = viewportWidth * 0.9
  } else if (viewportWidth <= 800) {
    migratorCanvas.width = viewportWidth * 0.7
  } else {
    migratorCanvas.width = 800
  }

  return {
    migratorCanvas: migratorCanvas
  }
}

function drawBar (ctx, upperLeftCornerX, upperLeftCornerY, width, height, color) {
  ctx.save()
  ctx.fillStyle = color
  ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height)
  ctx.restore()
}

function loadJSON (url, migrator, callback) {
  var xobj = new XMLHttpRequest()
  xobj.overrideMimeType('application/json')
  xobj.open('GET', url, true)
  xobj.onreadystatechange = function () {
    if (xobj.readyState === 4 && xobj.status === 200) {
      // Required use of an anonymous callback as .open will NOT
      // return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText, migrator)
    }
  }
  xobj.send(null)
}

var Barchart = function (options) {
  this.options = options
  this.parentContainer = options.parentId
  this.canvas = options.canvas
  this.ctx = this.canvas.getContext('2d')
  this.colors = options.colors

  this.draw = function () {
    var totalValue = 0
    var ncategs = this.options.categories.length
    var i = 0
    var categ = ''

    for (i = 0; i < ncategs; i++) {
      categ = this.options.categories[i]
      if (!(categ in this.options.data)) {
        continue
      }
      totalValue = totalValue + this.options.data[categ].length
    }
    var canvasActualHeight = this.canvas.height - this.options.padding * 2
    var canvasActualWidth = this.canvas.width - this.options.padding * 2

    // drawing the bars
    var barSize = canvasActualHeight

    var widthSoFar = 0
    for (i = 0; i < ncategs; i++) {
      categ = this.options.categories[i]
      if (!(categ in this.options.data)) {
        continue
      }

      var val = this.options.data[categ].length
      var barWidth = Math.round(canvasActualWidth * val / totalValue)
      drawBar(
        this.ctx,
        widthSoFar,
        16.0,
        barWidth,
        barSize,
        this.colors[i % this.colors.length]
      )

      widthSoFar = widthSoFar + barWidth
    }

    // drawing series name
    this.ctx.save()
    this.ctx.textBaseline = 'bottom'
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = '#000000'
    this.ctx.font = 'bold 14px Roboto'
    this.ctx.fillText(this.options.seriesName, this.canvas.width / 2, 14.0)
    this.ctx.restore()

    // draw legend
    var legend = document.getElementById(this.parentContainer + 'legend')
    var ul = document.createElement('ul')
    legend.append(ul)
    for (i = 0; i < ncategs; i++) {
      categ = this.options.categories[i]

      if (!(categ in this.options.data)) {
        continue
      }

      var li = document.createElement('li')
      var _val = this.options.data[categ].length
      li.style.listStyle = 'none'
      li.style.display = 'inline'
      li.style.borderLeft = '20px solid ' + this.colors[i % this.colors.length]
      li.style.padding = '5px'
      li.style.font = 'bold 16px Roboto'
      li.textContent = categ + ' (' + _val.toString() + ')'
      ul.append(li)
    }
  }
}

function createToggleMigratorVisibilityHandler (ident) {
  return function () {
    var x = document.getElementById(ident)
    if (x.style.display === 'none') {
      x.style.display = 'block'
    } else {
      x.style.display = 'none'
    }
  }
}

function migratorListing (name, data, feedstockStatus, categories, elementId) {
  var parent = document.getElementById(elementId)

  function byDescendants (aName, bName) {
    // compare function that puts
    // packages with the most descendants first
    var a = feedstockStatus[aName] || {}
    var b = feedstockStatus[bName] || {}
    // sort by total descendants:
    var aDesc = a.num_descendants ? a.num_descendants : 0
    var bDesc = b.num_descendants ? b.num_descendants : 0
    // sort by immediate children:
    // var aDesc = a.immediate_children ? a.immediate_children.length : 0;
    // var bDesc = b.immediate_children ? b.immediate_children.length : 0;
    if (aDesc > bDesc) {
      return -1
    } else if (bDesc > aDesc) {
      return 1
    } else {
      return 0
    }
  }

  // show status buttons
  for (var status of categories) {
    if (!(status in data)) {
      continue
    }

    var statusListId = parent.id + status + 'List'
    var button = document.createElement('button')
    parent.appendChild(button)
    button.innerHTML = status
    button.onclick = createToggleMigratorVisibilityHandler(statusListId)
    var statusList = document.createElement('ol')
    parent.appendChild(statusList)
    statusList.setAttribute('id', statusListId)
    // sort each list by the number of descendants
    data[status].sort(byDescendants)
    for (var i = 0; i < data[status].length; i++) {
      var statusItem = document.createElement('li')
      var feedstockName = data[status][i]
      var feedstockData = feedstockStatus[feedstockName]
      if (typeof feedstockData === 'undefined') {
        feedstockData = {}
      }
      var innerHtml = ''
      if (typeof feedstockData.pr_url !== 'undefined') {
        innerHtml += '<a href="' + feedstockData.pr_url + '">'
      }
      innerHtml += '<b>' + feedstockName + '</b>'
      if (typeof feedstockData.pr_url !== 'undefined') {
        innerHtml += '</a>'
      }
      if (typeof feedstockData.num_descendants !== 'undefined') {
        innerHtml += (' <span title="Total Number of Descendants">(' +
                      feedstockData.num_descendants.toString() +
                      ')</span>')
        if (typeof feedstockData.pre_pr_migrator_status !== 'undefined') {
          if (feedstockData.pre_pr_migrator_status.length > 0) {
            innerHtml += (' <i>Solver Error:</i> ' +
                          feedstockData.pre_pr_migrator_status)
          }
        }
        if (feedstockData.num_descendants > 0) {
          innerHtml += (' <br/><i>Immediate Children:</i> ' +
                        feedstockData.immediate_children.join(', '))
        }
      }
      statusItem.innerHTML = innerHtml
      statusList.appendChild(statusItem)
    }
    statusList.style.display = 'none'
  }

  // graph button
  var graphId = parent.id + 'Graph'
  var gbutton = document.createElement('button')
  parent.appendChild(gbutton)
  gbutton.innerHTML = 'Graph'
  gbutton.onclick = createToggleMigratorVisibilityHandler(graphId)
  var graph = document.createElement('img')
  parent.appendChild(graph)
  graph.setAttribute('id', graphId)
  graph.setAttribute(
    'src',
    'https://raw.githubusercontent.com/regro/cf-graph-countyfair/master/status/' + name + '.svg?sanitize=true'
  )
  graph.style.display = 'none'

  var hr = document.createElement('hr')
  hr.style = 'border-top: .3rem solid #20918c;'
  parent.appendChild(hr)
};

function createMigratorContainer (migratorName, parentId) {
  var a = document.createElement('a')
  a.title = migratorName
  a.href = '#' + migratorName

  var migratorContainer = document.createElement('div')
  migratorContainer.id = 'Container' + '_' + migratorName

  var canvas = document.createElement('canvas')
  canvas.id = 'migratorCanvas_' + migratorName

  var legend = document.createElement('legend')
  legend.setAttribute('for', canvas.id)
  legend.id = migratorContainer.id + 'legend'

  var parent = document.getElementById(parentId)
  parent.appendChild(a)

  a.appendChild(migratorContainer)
  migratorContainer.appendChild(canvas)
  migratorContainer.appendChild(legend)

  return {
    canvasId: canvas.id,
    migratorContainerId: migratorContainer.id
  }
}

function totalMigration (migratorsDictText, placeholder) {
  var categories = ['done', 'in-pr', 'awaiting-pr', 'not-solvable', 'awaiting-parents', 'bot-error']
  var colors = ['#440154', '#31688e', '#35b779', '#ff8c00', '#fde725', '#000000']

  var migratorsDict = JSON.parse(migratorsDictText)
  var migrators = []
  for (var migratorInfo in migratorsDict) {
    migrators.push({
      name: migratorInfo,
      description: migratorsDict[migratorInfo],
      canvas: createMigratorContainer(migratorInfo, 'migratorDiv')
    })
  }

  for (var migrator of migrators) {
    var url = 'https://raw.githubusercontent.com/regro/cf-graph-countyfair/master/status/' + migrator.name + '.json'
    var last = migrators.indexOf(migrator) === (migrators.length - 1)
    loadJSON(url, { m: migrator, l: last },
      function (response, ml) {
        migrator = ml.m
        last = ml.l
        var migratorData = JSON.parse(response)
        var feedstockStatus = migratorData._feedstock_status
        delete migratorData._feedstock_status
        var canvasData = migrator.canvas
        var ctx = makeContext(canvasData.canvasId)
        var migratorBarchart = new Barchart({
          canvas: ctx.migratorCanvas,
          parentId: canvasData.migratorContainerId,
          seriesName: migrator.description,
          padding: 20,
          gridScale: 5,
          gridColor: '#eeeeee',
          data: migratorData,
          categories: categories,
          colors: colors
        })
        migratorBarchart.draw()
        migratorListing(migrator.name, migratorData, feedstockStatus, categories, canvasData.migratorContainerId)

        if (last) {
          const myEvent = new CustomEvent('migratorsDone')
          window.dispatchEvent(myEvent)
        }
      }
    )
  }
}

var url = 'https://raw.githubusercontent.com/regro/cf-graph-countyfair/master/status/total_status.json'
loadJSON(url, 'empty', totalMigration)
