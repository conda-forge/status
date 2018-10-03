function viewport(){
    var e = window, a = 'inner';
    if ( !( 'innerWidth' in window ) ){
        a = 'client';
        e = document.documentElement || document.body;
    }
    return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
}

var migratorCanvas = document.getElementById("migratorCanvas");
migratorCanvas.height = 100;
var viewportWidth = viewport()["width"]
if (viewportWidth <= 600){
    migratorCanvas.width = viewportWidth * 0.9;
} else if (viewportWidth <= 800) {
    migratorCanvas.width = viewportWidth * 0.7;
} else {
    migratorCanvas.width = 800;
}

var ctx = migratorCanvas.getContext("2d");

function drawLine(ctx, startX, startY, endX, endY,color){
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX,startY);
    ctx.lineTo(endX,endY);
    ctx.stroke();
    ctx.restore();
}

function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height,color){
    ctx.save();
    ctx.fillStyle=color;
    ctx.fillRect(upperLeftCornerX,upperLeftCornerY,width,height);
    ctx.restore();
}


function loadJSON(url, callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}


var Barchart = function(options){
    this.options = options;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.colors = options.colors;

    this.draw = function(){
        var totalValue = 0;
        for (var categ in this.options.data){
            totalValue = totalValue + this.options.data[categ].length;
        }
        var canvasActualHeight = this.canvas.height - this.options.padding * 2;
        var canvasActualWidth = this.canvas.width - this.options.padding * 2;

        //drawing the bars
        var barIndex = 0;
        var numberOfBars = Object.keys(this.options.data).length;
        var barSize = canvasActualHeight;

        var widthSoFar = 0;
        for (categ in this.options.data){
            var val = this.options.data[categ].length;
            var barWidth = Math.round( canvasActualWidth * val/totalValue);
            drawBar(
                this.ctx,
                widthSoFar,
                0,
                barWidth,
                barSize,
                this.colors[barIndex%this.colors.length]
            );

            barIndex++;
            widthSoFar = widthSoFar + barWidth;
        }

        //drawing series name
        this.ctx.save();
        this.ctx.textBaseline="bottom";
        this.ctx.textAlign="center";
        this.ctx.fillStyle = "#000000";
        this.ctx.font = "bold 14px Roboto";
        this.ctx.fillText(this.options.seriesName, this.canvas.width/2,this.canvas.height);
        this.ctx.restore();

        //draw legend
        barIndex = 0;
        var legend = document.querySelector("legend[for='migratorCanvas']");
        var ul = document.createElement("ul");
        legend.append(ul);
        for (categ in this.options.data){
            var li = document.createElement("li");
            var val = this.options.data[categ].length;
            li.style.listStyle = "none";
            li.style.display = "inline";
            li.style.borderLeft = "20px solid "+this.colors[barIndex%this.colors.length];
            li.style.padding = "5px";
            li.textContent = categ + " (" + val.toString() + ")";
            ul.append(li);
            barIndex++;
        }
    }
}


function createToggleMigratorVisibilityHandler(ident) {
    return function() {
        var x = document.getElementById(ident);
        if (x.style.display === "none") {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }
    }
}


function migratorListing(data, feedstockStatus) {
    var parent = document.getElementById("migratorDiv");
    for (status in data) {
        var statusListId = status + "List";
        var button = document.createElement("button");
        parent.appendChild(button);
        button.innerHTML = status;
        button.onclick = createToggleMigratorVisibilityHandler(statusListId);
        var statusList = document.createElement("ol");
        parent.appendChild(statusList);
        statusList.setAttribute("id", statusListId);
        for (var i = 0; i < data[status].length; i++) {
            var statusItem = document.createElement("li");
            var feedstockName = data[status][i];
            var feedstockData = feedstockStatus[feedstockName];
            if (typeof feedstockData === "undefined") {
                feedstockData = {};
            }
            var innerHtml = "";
            if (typeof feedstockData.pr_url !== "undefined") {
                innerHtml += "<a href=\"" + feedstockData.pr_url + "\">";
            }
            innerHtml += "<b>" + feedstockName + "</b>";
            if (typeof feedstockData.pr_url !== "undefined") {
                innerHtml += "</a>";
            }
            if (typeof feedstockData.num_descendants !== "undefined") {
                innerHtml += (" <span title=\"Total Number of Descendants\">(" +
                              feedstockData.num_descendants.toString() + ")</span>");
                if (feedstockData.num_descendants > 0) {
                    innerHtml += (" <i>Immediate Children:</i> " +
                                  feedstockData.immediate_children.join(", "));
                }
            }
            statusItem.innerHTML = innerHtml;
            statusList.appendChild(statusItem);
        }
        statusList.style.display = "none";
    }
};


loadJSON("https://raw.githubusercontent.com/regro/cf-graph3/master/status/compilerrebuild.json",
         function(response) {
            var migratorData = JSON.parse(response);
            var feedstockStatus = migratorData._feedstock_status;
            delete migratorData._feedstock_status;
            var migratorBarchart = new Barchart({
                canvas:migratorCanvas,
                seriesName:"Compiler Migration Status",
                padding:20,
                gridScale:5,
                gridColor:"#eeeeee",
                data: migratorData,
                colors:['#440154', '#31688e', '#35b779', '#fde725']
            });
            migratorBarchart.draw();
            migratorListing(migratorData, feedstockStatus);
         }
        );
