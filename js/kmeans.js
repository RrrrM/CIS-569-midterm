
"use strict";
//Change these values to choose between random points of fixed points
var fix_centroid = "no";
var fix_points = "no"

function kMeans(divname, w, h, numPoints, numClusters, maxIter)
{

    //numPoints = 500;
    
    //console.log(elt)

    // the current iteration
    var iter = 1;
    var centroids = [];
    var points = [];
    var datapoints = [];



    //var margin = {top: 30, right: 20, bottom: 80, left: 30}
    var margin = {
        top: 10,
        right: 20,
        bottom: 20,
        left: 20
    };


    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;


    var colors = d3.scale.category10().range();


    //To set range for random values
    var min1 = -4;  //-2
    var max1 = 3;   //2
    var min2 = -4;  //-3
    var max2 = 4;   //3

    var xpScale = d3.scale.linear()
        .domain([455, 68])                //改为displacement的范围
        .range([3, -4])
        .clamp('true');
    
    var ypScale = d3.scale.linear()
        .domain([0.020557,0.07291])                //改为HP/W的范围
        .range([4, -4])
        .clamp('true');
        //.nice();

    var xScale = d3.scale.linear()
        .domain([3, -4])                //改为displacement的范围
        .range([0, width])
        .clamp('true');
        //.nice();

    var yScale = d3.scale.linear()
        .domain([4, -4])                //改为HP/W的范围
        .range([height, 0])
        .clamp('true');
        //.nice();

    //console.log(xScale(2))

    //在
    var svg = d3.select(divname).append("svg")
        .attr("id", "chart")
        .attr("width", width + margin.left + margin.right) //The svg does not have margin
        .attr("height", height + margin.top + margin.bottom) //The svg does not have margin

    //在head中增加一个迭代计数器  Add a counter of interation time 
    d3.select("#head")
        .append("p")     
        .attr("class", "label")
        .attr("align","center")
        .text("Drawing cycles");
    //在svg中增加一个添加一个存放cycles的group  Add a group for the cycles
    var group = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")



    /**
     * Computes the euclidian distance between two points.
     */
    function getEuclidianDistance(a, b)
    {
        var dx = b.x - a.x,
            dy = b.y - a.y;
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }

    /**
     * Returns a point with the specified type and fill color and with random 
     * x,y-coordinates.
     */
    //生产随机点！！！
    function getRandomPoint(type, fill)
    {
        return {
            //x: Math.round(Math.random() * width), 
            //y: Math.round(Math.random() * height),
            //x: Math.round(Math.random() * 2),
            //y: Math.round(Math.random() * 2),
            x: Math.random() * (max1 - min1) + min1,
            y: Math.random() * (max2 - min2) + min2,
            type: type,
            fill: fill
        };

    }

    /** 
     * Generates a specified number of random points of the specified type.
     */
    //生成num个type（point or centroid）类型的随机点 
    function initializePoints(num, type)
    {
        var result = [];
        for (var i = 0; i < num; i++)
        {
            var color = colors[i];
            if (type !== "centroid")
            {
                color = "#ccc";
            }

            var point = getRandomPoint(type, color);
            point.id = point.type + "-" + i;
            console.log(point);
            result.push(point);

            //console.log(point.x, point.y,point.type,point.fill)
            //console.log(point)
            //console.log(result)
        }
        return result;
    }

    function getPoint(fill,type,num1,num2,num3)
    {
        return {
            //x: Math.round(Math.random() * width), 
            //y: Math.round(Math.random() * height),
            //x: Math.round(Math.random() * 2),
            //y: Math.round(Math.random() * 2),
            x: num1,
            y: num2,
            type: type,
            fill: fill,
            id: type +"-"+num3
            };

    }

    function initializedataPoints(){
        var result = [];
        d3.csv("data/data.csv", function(data) {
            
            for (var i = 0; i < data.length; i++) {
            //datapoints[i].x=data[i].Displacement;
            //datapoints[i].y=ypScale(data[i].Horsepower/data[i].Weight);
            //datapoints[i].id="point-" + i;
            //datapoints[i].type="point";
            //datapoints[i].fill="#ccc";
            //var point;
            var color = "#ccc";
            var point = getPoint(color,"point",xpScale(data[i].Displacement),ypScale(data[i].Horsepower/data[i].Weight),i);
            //console.log(point);
            result.push(point);     
            
            }
            
        });
        return result;
        console.log(result);
    }
    /**
     * Find the centroid that is closest to the specified point.
     */
    function findClosestCentroid(point)
    {
        var closecenter = {
            i: -1,
            distance: width * 2
        };
        centroids.forEach(function(d, i)
        {
            var distance = getEuclidianDistance(d, point);
            // Only update when the centroid is closer
            if (distance < closecenter.distance)
            {
                closecenter.i = i;
                closecenter.distance = distance;
            }
        });
        return (centroids[closecenter.i]);
        
    }

    /**
     * All points assume the color of the closest centroid.
     */
    function colorizePoints()
    {
        //console.log(points);
        points.forEach(function(d)
        {
            var closecenter = findClosestCentroid(d);
            
            d.fill = closecenter.fill;
            //console.log(d);
        });
    }

    /**
     * Computes the center of the cluster by taking the mean of the x and y 
     * coordinates.
     */
    function computeClusterCenter(cluster)
    {
        return [
            d3.mean(cluster, function(d)
            {
                return d.x;
            }),
            d3.mean(cluster, function(d)
            {
                return d.y;
            })
        ];
    }

    /**
     * Moves the centroids to the center of their cluster.
     */
    function moveCentroids()
    {
        centroids.forEach(function(d)
        {
            // Get clusters based on their fill color
            var cluster = points.filter(function(e)
            {
                return e.fill === d.fill;
            });
            // Compute the cluster centers
            var center = computeClusterCenter(cluster);
            // Move the centroid
            d.x = center[0];
            d.y = center[1];

            //console.log(cluster[0])
            //console.log(d)
            //console.log(d.x,d.y,d.id)
        });
    }

    /**
     * Updates the chart.
     */
    function update()
    {
        var data = points.concat(centroids);

        //console.log(points)

        // The data join
        var circle = group.selectAll("circle")
        .data(data);

        // Create new elements as needed
        circle.enter().append("circle")
            .attr("id", function(d)
            {
                return d.id;
            })
            .attr("class", function(d)
            {
                return d.type;
            })
            //.attr("r", 4);
            .attr("r", function(d,i)
            	{
            		if (d.type == "centroid")
            		{
            			return 4;               //改为0 centroid 消失
            		}
            		else
            		{
            			return 3;
            		}
            	});

        // Update old elements as needed
		circle
			.transition()
			.delay(10).duration(200)
			//.ease('bounce')
			.attr("cx", function(d)
			{
				//return d.x;
				return xScale(d.x)
					//return console.log(xScale(d.x), d.x), xScale(d.x)
			})
			.attr("cy", function(d)
			{
				//return d.y;
				return yScale(d.y)
					//return console.log(yScale(d.y)), yScale(d.y)
			})
			// .style("fill", function(d)
			// {
			//     return d.fill;
			// });
			.style("fill", function(d, i)
			{
				if (d.type == "centroid")
				{
					return "white";
				}
				else
				{
					return d.fill;
				}
			});

        //console.log(data)

        // Remove old nodes
        circle.exit().remove();
    }


    /**
     * Updates the text in the label.
     */
    function ItTime(text)
    {
        d3.selectAll(".label").text(text);
    }

    //var cardata
    
    /**
     * Executes one iteration of the algorithm:
     * - Fill the points with the color of the closest centroid (this makes it 
     *   part of its cluster)
     * - Move the centroids to the center of their cluster.
     */
    function iterate()
    {

        // Update label
        ItTime("Iteration " + iter );

        // Colorize the points
        colorizePoints();
        //console.log(points);
        // Move the centroids
        moveCentroids();

        // Update the chart
        update();
    }

    /** 
     * The main function initializes the algorithm and calls an iteration every 
     * two seconds.
     */
    function initialize()
    {
        centroids = initializePoints(numClusters, "centroid");
        points = initializePoints(numPoints, "point");
        //points = initializedataPoints();  //points 之中没添加到点。
        console.log(points);
        update();

        var interval = setInterval(function()
        {
            if (iter < maxIter + 1)
            {
                iterate();
                iter++;
            }
            else
            {
                clearInterval(interval);
                ItTime("Done");
            }
        }, 7.5 * 50); //time to start iterations
    }

    // Call the main function
    initialize();
}