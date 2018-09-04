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
} else {
    migratorCanvas.width = viewportWidth * 0.7;
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

var myVinyls = {
    "Classical music": 10,
    "Alternative rock": 14,
    "Pop": 2,
    "Jazz": 12
};

var Barchart = function(options){
    this.options = options;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.colors = options.colors;

    this.draw = function(){
        var totalValue = 0;
        for (var categ in this.options.data){
            totalValue = totalValue + this.options.data[categ];
        }
        var canvasActualHeight = this.canvas.height - this.options.padding * 2;
        var canvasActualWidth = this.canvas.width - this.options.padding * 2;

        //drawing the bars
        var barIndex = 0;
        var numberOfBars = Object.keys(this.options.data).length;
        var barSize = canvasActualHeight;

        var widthSoFar = 0;
        for (categ in this.options.data){
            var val = this.options.data[categ];
            var barWidth = Math.round( canvasActualWidth * val/totalValue);
            drawBar(
                this.ctx,
                widthSoFar,
                0,
                barWidth,
                barSize,
                this.colors[barIndex%this.colors.length]
            );
            this.ctx.fillText(val, widthSoFar + Math.round(barWidth/2), 7 + Math.round(barSize/2));

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
            li.style.listStyle = "none";
            li.style.display = "inline";
            li.style.borderLeft = "20px solid "+this.colors[barIndex%this.colors.length];
            li.style.padding = "5px";
            li.textContent = categ;
            ul.append(li);
            barIndex++;
        }
    }
}


var migratorBarchart = new Barchart(
    {
        canvas:migratorCanvas,
        seriesName:"Migration Status",
        padding:20,
        gridScale:5,
        gridColor:"#eeeeee",
        data:myVinyls,
        colors:["#a55ca5","#67b6c7", "#bccd7a","#eb9743"]
    }
);
migratorBarchart.draw();
