/*--------------------------------------------------------------------------
+++ Step 0: Make everything responsive and resizable
--------------------------------------------------------------------------*/
d3.select(window).on("resize", makeResponsive);

makeResponsive();

/*--------------------------------------------------------------------------
+++ Step 1: Set up chart space
--------------------------------------------------------------------------*/
function makeResponsive() {
    // Select currently available size
    var svgArea = d3.select("body").select("svg");

    // if there's something there remove it
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // get width and height of current window. that'll be the size of our chart
    var svgWidth = window.innerWidth - 50;
    var svgHeight = window.innerHeight - 50;

    // set margin sizes
    var margin = {
        top: 40,
        right: 40,
        bottom: 100,
        left: 100
    };

    // subtract our margins from our chart space to get the appropriate chart area
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // set chart attributes
    var svg = d3.select(".chart")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);


    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    /*--------------------------------------------------------------------------
    +++ Step 2: Import data and parse it.
    --------------------------------------------------------------------------*/
    // import data
    d3.csv("data.csv", function (err, healthData) {
        if (err) throw err;

        // Parse data
        healthData.forEach(function (data) {
            healthData.percentBelowPovertyLevel = +healthData.percentBelowPovertyLevel;
            healthData.haveDiabetes = +healthData.haveDiabetes;
        });

        /*--------------------------------------------------------------------------
        +++ Step 3: Use parsed data to create scales
        --------------------------------------------------------------------------*/
        // scale for x axis
        var xLinearScale = d3.scaleLinear()
            .domain([5, 50])
            .range([0, width]);

        // scale for y axis
        var yLinearScale = d3.scaleLinear()
            .domain([6, 16])
            .range([height, 0]);

        /*--------------------------------------------------------------------------
        +++ Step 4: Create axis functions and append axes to the chart
        --------------------------------------------------------------------------*/
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        /*--------------------------------------------------------------------------
        +++ Step 5: Create circles
        --------------------------------------------------------------------------*/
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.percentBelowPovertyLevel))
            .attr("cy", d => yLinearScale(d.haveDiabetes))
            .attr("r", "15")
            .attr("fill", "darkorchid")
            .attr("opacity", ".50")

        /*--------------------------------------------------------------------------
        +++ Step 6: Create tooltip, hide it, and add triggering event listener
        --------------------------------------------------------------------------*/
        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function (d) {
                return (`<h5 class="tooltipTitle">${d.stateOrTerritory}</h5>Percent Population with...<ul><li><strong>...Income Below Poverty Level: </strong> ${d.percentBelowPovertyLevel}%</li><li><strong>...Diabetes: </strong>${d.haveDiabetes}%</li>`);
            });

        chartGroup.call(toolTip);

        circlesGroup
            .on("mouseover", function (data) {
                toolTip.show(data)
                    .style("opacity", .9);
            })

            .on("mouseout", function (data) {
                toolTip.transition()
                    .delay(.0001)
                    .hide(data)
            });

        /*--------------------------------------------------------------------------
        +++ Step 7: Create axes labels and titles
        --------------------------------------------------------------------------*/
        // add axis labels
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 40)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("class", "axisText")
            .text("% Population with Diabetes");

        chartGroup.append("text")
            .attr("transform", `translate(${width/2}, ${height + margin.top + 30})`)
            .attr("class", "axisText")
            .text("% with Income Below Poverty Line");

        // add title
        chartGroup.append("text")
            .attr("transform", `translate(${width/2}, -15)`)
            .attr("class", "titleText")
            .text("Poverty & Diabetes in the United States (2014)");
    });
};
