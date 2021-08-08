
    var svgHeight = 500;
    var svgWidth = 800;

    // margins
    var margin = {
        top: 50,
        right: 50,
        bottom: 100,
        left: 100
    };

    // chart area minus margins
    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    // create svg container
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    
    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "obesity";
    var tipXlabel = "Poverty:";
    var tipYlabel = "Obesity:";
    var formatPercent = d3.format(".3r");
    var formatDollar = d3.format("$,.0f");
    var formatInt = d3.format("d");
    var tipXformat = formatPercent;
    var tipYformat = formatPercent;
    var xpercent = '%';
    var ypercent = '%';

    // function used for updating x-scale var upon click on axis label
    function xScale(data, chosenXAxis) {
    // create scales
        var xLinearScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d[chosenXAxis]))
            .range([0, width]);
        return xLinearScale; 
    }

    // function used for updating y-scale var upon click on axis label
    function yScale(data, chosenYAxis) {
        // create scales
            var yLinearScale = d3.scaleLinear()
                .domain(d3.extent(data, d => d[chosenYAxis]))
                .range([height, 0]);
            return yLinearScale; 
        }

    // function used for updating xAxis var upon click on axis label
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
  
        xAxis.transition()
            .duration(250)
            .call(bottomAxis);
  
        return xAxis;
    }

    // function used for updating xAxis var upon click on axis label
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
  
        yAxis.transition()
            .duration(250)
            .call(leftAxis);
  
        return yAxis;
    }
   
    // function used for updating circles group with a transition to new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesGroup.transition()
            .duration(250)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));
    
        return circlesGroup;
    }

    // function used for updating text group with a transition to new text placement
    function renderCirclesText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        textGroup.transition()
        .duration(250)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    
        return textGroup;
    }

    d3.csv("./assets/data/data.csv").then(function(data) {
        
        // var xLinearScale = xScale(data, currentXAxis);

        // parse data
        data.forEach(function(d) {
            d.poverty = +d.poverty;
            d.income = +d.income;
            d.age = +d.age;
            d.obesity = +d.obesity;
            d.smokes = +d.smokes;
            d.healthcare = +d.healthcare;
        });

        var xLinearScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.poverty))
            .range([0, width]);

        // Create y scale function
        var yLinearScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.obesity))
            .range([height, 0]);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append state abbreviations in circles
        var textGroup = chartGroup.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .text(d => d.abbr)
            .attr("x", d => xLinearScale(d.poverty))
            .attr("y", d => yLinearScale(d.obesity))
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style('font-size', '8px')

        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.obesity))
            .attr("r", 10)
            .attr("fill", "lightblue")
            .attr("opacity", ".5");
        
        // // append tooltip div
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([45, 75])
            .html(function(d) {
                return (`${d.state}<br>${tipXlabel} ${tipXformat(d[chosenXAxis])}${xpercent}<br>${tipYlabel} ${tipYformat(d[chosenYAxis])}${ypercent}`);
            });
        
        chartGroup.call(toolTip);

        // Event listeners with transitions
        circlesGroup.on("mouseover", function(d) {
            d3.select(this)
            .transition()
            .duration(500)
            .attr("r", 15)
            .attr("fill", "pink");

            toolTip.show(d, this);

        })
            .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(500)
                .attr("r", 10)
                .attr("fill", "lightblue");

            toolTip.hide(d);

            });

        // append x axis
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        var yAxis = chartGroup.append("g")
            .call(leftAxis);
        
        // create group for x-axis labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);
        
        var povertyXlabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("Poverty Rate (%)");
        
        var incomeXlabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Household Income (Median)");
        
        var ageXlabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");

        // create group for x-axis labels
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");

        var obesityYlabel = yLabelsGroup.append("text")
            .attr("x", 0 - height / 2)
            .attr("y", -70)
            .attr("value", "obesity") // value to grab for event listener
            .classed("active", true)
            .text("Obesity Rate (%)");

        var smokesYlabel = yLabelsGroup.append("text")
            .attr("x", 0 - height / 2)
            .attr("y", -50)
            .attr("value", "smokes") // value to grab for event listener
            .classed("inactive", true)
            .text("Smokers (%)");

        var healthcareYlabel = yLabelsGroup.append("text")
            .attr("x", 0 - height / 2)
            .attr("y", -30)
            .attr("value", "healthcare") // value to grab for event listener
            .classed("inactive", true)
            .text("No Healthcare (%)");
        
        // x axis labels event listener
        xLabelsGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                console.log(chosenXAxis)

                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates circles text with new x values
                textGroup = renderCirclesText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyXlabel
                    .classed("active", true)
                    .classed("inactive", false);
                    incomeXlabel
                    .classed("active", false)
                    .classed("inactive", true);
                    ageXlabel
                    .classed("active", false)
                    .classed("inactive", true);
                    tipXlabel = "Poverty:";
                    tipXformat = formatPercent;
                    xpercent = '%';

                }
                else if (chosenXAxis === "income") {
                    povertyXlabel
                    .classed("active", false)
                    .classed("inactive", true);
                    incomeXlabel
                    .classed("active", true)
                    .classed("inactive", false);
                    ageXlabel
                    .classed("active", false)
                    .classed("inactive", true);
                    tipXlabel = "Income:";
                    tipXformat = formatDollar;
                    xpercent = '';
                }
                else {
                    povertyXlabel
                    .classed("active", false)
                    .classed("inactive", true);
                    incomeXlabel
                    .classed("active", false)
                    .classed("inactive", true);
                    ageXlabel
                    .classed("active", true)
                    .classed("inactive", false);
                    tipXlabel = "Age:";
                    tipXformat = formatInt;
                    xpercent = '';
                }
                }
        });

        // y axis labels event listener
        yLabelsGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var yValue = d3.select(this).attr("value");
                if (yValue !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = yValue;

                console.log(chosenYAxis)

                // updates y scale for new data
                yLinearScale = yScale(data, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates circles text with new y values
                textGroup = renderCirclesText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // changes classes to change bold text
                if (chosenYAxis === "obesity") {
                    obesityYlabel
                    .classed("active", true)
                    .classed("inactive", false);
                    smokesYlabel
                    .classed("active", false)
                    .classed("inactive", true);
                    healthcareYlabel
                    .classed("active", false)
                    .classed("inactive", true);
                    tipYlabel = "Obesity:";
                    tipYformat = formatPercent;
                    ypercent = '%';
                }
                else if (chosenYAxis === "smokes") {
                    obesityYlabel
                    .classed("active", false)
                    .classed("inactive", true);
                    smokesYlabel
                    .classed("active", true)
                    .classed("inactive", false);
                    healthcareYlabel
                    .classed("active", false)
                    .classed("inactive", true);
                    tipYlabel = "Smokers:";
                    tipYformat = formatPercent;
                    ypercent = '%';
                }
                else {
                    obesityYlabel
                    .classed("active", false)
                    .classed("inactive", true);
                    smokesYlabel
                    .classed("active", false)
                    .classed("inactive", true);
                    healthcareYlabel
                    .classed("active", true)
                    .classed("inactive", false);
                    tipYlabel = "No Healthcare:";
                    tipYformat = formatPercent;
                   ypercent = '%';
                }
                }
            });
            
    })