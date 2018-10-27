
"use strict";


function kMeans(divname, w, h, numPoints, numClusters, maxIter)
{
    d3.csv("data/data.csv", function(data) {

        

        var iter = 1;
        var centroids = [];
        var points = [];
        var datapoints = [];

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
        var min2 = 5;  //-3
        var max2 = 6;   //3

        var xpScale = d3.scale.linear()
            .domain([456, 70])                //改为displacement的范围
            .range([3, -4])
            .clamp('true');
        
        var ypScale = d3.scale.linear()
            .domain([0.020557,0.07291])                //改为HP/W的范围
            .range([6, 5])
            .clamp('true');
            //.nice();

        var xScale = d3.scale.linear()
            .domain([3, -4])                //改为displacement的范围
            .range([0, width])
            .clamp('true');
            //.nice();

        var yScale = d3.scale.linear()
            .domain([6, 5])                //改为HP/W的范围
            .range([height, 0])
            .clamp('true');
            //.nice();

        // Define the div for the tooltip
        var div = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);

        //在
        var svg = d3.select(divname).append("svg")
            .attr("id", "chart")
            .attr("width", width + margin.left + margin.right) 
            .attr("height", height + margin.top + margin.bottom) 

        


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
         * Returns a point with the specified type and fill color and with random 
         * x,y-coordinates.
         */
       

        function getPoint(fill,type,num1,num2,num3,Md,Mp,Cd,Dp,Hp,W,Ac,Y,Ori)
        //function getPoint(d,i)
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
                id: type +"-"+num3,
                Model: Md, 
                MPG: Mp, 
                Cylinders: Cd, 
                Displacement: Dp, 
                Horsepower: Hp, 
                Weight: W, 
                Acceleration: Ac, 
                Year: Y, 
                Origin: Ori,
                //x: xpScale(d.Displacement),
                //y: ypScale(d.Horsepower/d.Weight),
                //type: "#ccc",
                //fill: "point",
                //id: type +"-"+u,
                };

        }

        //导入dataset
        for (var i = 0; i < data.length; i++) {
            //datapoints[i].x=data[i].Displacement;
            //datapoints[i].y=ypScale(data[i].Horsepower/data[i].Weight);
            //datapoints[i].id="point-" + i;
            //datapoints[i].type="point";
            //datapoints[i].fill="#ccc";
            //var point;
            var color = "#ccc";
            
            var point = getPoint(color,"point",xpScale(data[i].Displacement),ypScale(data[i].Horsepower/data[i].Weight), i, 
            data[i].Model, 
            data[i].MPG, 
            data[i].Cylinders, 
            data[i].Displacement, 
            data[i].Horsepower, 
            data[i].Weight, 
            data[i].Acceleration, 
            data[i].Year, 
            data[i].Origin);
            //var point = getPoint(data[i],i);
            console.log(point);
            points.push(point); 
            
        };
        
            
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
         * Find the centroid that is closest to the specified point.
         */
        function findClosestCentroid(point)
        {
            var closecenter = {
                i: -1,
                distance: width * 1000
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
             
           
            return (centroids[closecenter.i]); //有-1出现
            
        }

        /**
         * All points assume the color of the closest centroid.
         */
        function colorizePoints()
        {
            //console.log(centroids);
            points.forEach(function(d)
            {
                //console.log(d.fill);
                var closecenter = findClosestCentroid(d); //无法取到未定义的fill
                
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
                    })
                //tip     
                .on("mouseover", function(d) {		
                    div.transition()		
                        .duration(100)		
                        .style("opacity", 0.9);		
                    div	.html("<strong>Model: </strong><span style='color:red'>"+d.Model
                            +"</span>,  <br> <strong>MPG:</strong><span style='color:red'>"+d.MPG
                            +"</span>,  <br> <strong>Cylinders:</strong><span style='color:red'>"+d.Cylinders
                            +"</span>,  <br> <strong>Displacement:</strong><span style='color:red'> "+d.Displacement
                            +"</span>,  <br> <strong>Horsepower:</strong><span style='color:red'> "+d.Horsepower
                            +"</span>,  <br> <strong>Weight:</strong><span style='color:red'> "+d.Weight
                            +"</span>,  <br> <strong>Acceleration:</strong><span style='color:red'> "+d.Acceleration
                            +"</span>,  <br> <strong>Year:</strong><span style='color:red'> "+d.Year
                            +"</span>,  <br> <strong>Origin:</strong><span style='color:red'> "+d.Origin+"</span>")	
                        .style("left", (d3.event.pageX) + "px")		
                        .style("top", (d3.event.pageY - 28) + "px");	
                    })					
                .on("mouseout", function(d) {		
                    div.transition()		
                        .duration(500)		
                        .style("opacity", 0);	
                });    
            // Update old elements as needed
            circle
                .transition()
                .delay(10).duration(200)
                .attr("cx", function(d)
                { 
                    return xScale(d.x)       
                })
                .attr("cy", function(d)
                {
                    return yScale(d.y)   
                })
               
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
                })
                //设置tip.
                
      
                //.attr("title", "We ask for your age only for statistical purposes.");
                

            // delete old circles.
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
            
           
            centroids =[{fill: "#1f77b4", id: "centroid-0", type: "centroid", x: 2.2144482565467025, y: 5.362025436133076}, 
            {fill: "#ff7f0e", id: "centroid-1", type: "centroid", x: -0.2144482565467025, y: 5.335508776339737},
            {fill: "#2ca02c", id: "centroid-2", type: "centroid", x: 1.2144482565467025, y: 5.324098858125044}];
            console.log(centroids);
            update();
            //console.log(points);
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
        //$( cycle ).tooltip();
        //$( function() {
            //$( document ).tooltip();
          //} );
    });
}