// HEALTHCARE CODE BELOW
///////////////////////////////////////////////////////////////////////////////
let width = 800;
let height = 500;

let svg = d3.select("body")
    .select("svg")

let margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 30
};

// Define data columns
let sel_cols = [
    "Medicaid",
    "Medicare",
    "Medicare+Medicaid",
    "Employer",
    "Uninsured",
    "Direct Purchase",
    "Subsidized Exchange",
    "CHIP",
    "Military",
    "Other"
]

// Define colors for columns
let sel_colors = [
    "#f44336", // "Medicaid",
    "#FF9800", // "Medicare",
    "#FDD835", // "Medicare+Medicaid",
    "#FFF8E1", // "Employer",
    "#26A69A", // "Uninsured",
    "#4DD0E1", // "Direct Purchase",
    "#F06292", // "Subsidized Exchange",
    "#5C6BC0", // "CHIP",
    "#90A4AE", // "Military",
    "#E0E0E0" // "Other"
]

// Set legend
let leg_cols = [
    "Medicare+Medicaid",
    "Direct Purchase",
    "Subsidized Exchange",
    "CHIP",
    "Military",
    "Other"
]

let leg_colors = [
    // Define colors for columns
    "#FDD835", // "Medicare+Medicaid",
    "#4DD0E1", // "Direct Purchase",
    "#F06292", // "Subsidized Exchange",
    "#5C6BC0", // "CHIP",
    "#90A4AE", // "Military",
    "#E0E0E0" // "Other"
]

d3.csv("data/healthcare-disposable-inc.csv").then(function(data) {

    let year_state = 2009;

    // Filter data
    let d2020 = data.filter(d => d.year == 2020);
    let d2009 = data.filter(d => d.year == 2009);
    let series2020 = d3.stack().keys(sel_cols)(d2020);
    let series2009 = d3.stack().keys(sel_cols)(d2009);

    // Define first headline
    let hed = d3.select(".headline")
    hed.html("Healthcare by Income in 2009")

    // Set colors
    let color = d3.scaleOrdinal()
        .domain(sel_cols)
        .range(sel_colors)

    // define axes
    let x = d3.scaleLinear()
        .domain([0, 100])
        .range([margin.left, width])

    let y = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.bottom, margin.top])

    let area = d3.area()
        .x(d => x(d.data.Percentile))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))

    let xAxisSettings = d3.axisBottom(x)
        .tickSize(6)
        .tickPadding(6)
        .tickValues([5, 10, 20, 30, 40, 50, 60, 70, 60, 80, 90, 95])
        .tickFormat(d3.format(".0f"))

    let yAxisSettings = d3.axisLeft(y)
        .tickValues([.2, .4, .6, .8])
        .tickSize(6)
        .tickPadding(4)
        .tickFormat(d3.format(".0%"))

    let xAxis = svg.append("g")
        .attr("class", "x axis")
        .call(xAxisSettings)
        .call(g => g.selectAll(".domain").remove())
        .attr("transform", `translate(0,${height - margin.bottom})`)

    let yAxis = svg.append("g")
        .attr("class", "y axis")
        .call(yAxisSettings)
        .call(g => g.selectAll(".domain").remove())
        .attr("transform", `translate(${margin.left},0)`)

    let area_lines = svg.append("g")
        .attr("class", "area_lines")

    //Add data
    area_lines
        .selectAll("path")
        .data(series2009)
        .join("path")
        .attr("class", d => d.key)
        // Apply each key to get the correct color
        .attr("fill", d => color(d.key))
        .attr("d", area)

    //Add individual labels
    add_data_label = function(x_pos, y_pos, text, fill = "white") {
        svg.append("text")
            .attr("class", "label")
            .attr("x", x_pos)
            .attr("y", y_pos)
            .text(text)
            .style("fill", fill)
    }
    add_data_label(x_pos = 500, y_pos = 250, text = "Employer", fill = "black");
    add_data_label(x_pos = 75, y_pos = 450, text = "Medicaid");

    let medicare_label = svg.append("text")
        .attr("class", "label")
        .attr("x", 90)
        .attr("y", 320)
        .text("Medicare")
        .style("fill", "black")

    let uninsured_label = svg.append("text")
        .attr("class", "label")
        .attr("x", 100)
        .attr("y", 125)
        .text("Uninsured")
        .style("fill", "white")

    //Add axis labels
    add_ax_label = function(x_pos, text, pos_name) {
        svg.append("text")
            .attr("class", "axis-label")
            .attr("x", x_pos)
            .attr("y", height + 40)
            .text(text)
            .attr("text-anchor", pos_name)
    }
    add_ax_label(width / 2, "income percentile", "middle");
    add_ax_label(width - 30, "higher income", "end");
    add_ax_label(30, "lower income", "start");

    //Add legend
    add_leg_entry = function(y1, fill, text) {
        svg.append("rect")
            .attr("class", "legend")
            .attr("x", 805)
            .attr("y", y1)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", fill)

        svg.append("text")
            .attr("class", "legend-text")
            .attr("x", 820)
            .attr("y", y1 + 10)
            .text(text)
            .attr("fill", "black")
    }
    let start_pos = 15
    for (let i = 0; i < leg_cols.length; i++) {
        add_leg_entry(start_pos, leg_colors[i], leg_cols[i])
        start_pos += 20
    }

    function dance(filtered_data) {
        area_lines
            .selectAll("path")
            .data(filtered_data)
            .join("path")
            .attr("class", d => d.key)
            .transition()
            .duration(600)
            .ease(d3.easeLinear)
            // Apply each key to get the correct color
            .attr("fill", d => color(d.key))
            .attr("d", area)
    }

    function update_labels() {
        if (year_state == 2020) {
            medicare_label
                .transition()
                .duration(600)
                .ease(d3.easeLinear)
                .attr("x", 80)
                .attr("y", 290)

            uninsured_label
                .transition()
                .duration(600)
                .ease(d3.easeLinear)
                .attr("x", 100)
                .attr("y", 90)
        } else {
            medicare_label
                .transition()
                .duration(600)
                .ease(d3.easeLinear)
                .attr("x", 90)
                .attr("y", 320)

            uninsured_label
                .transition()
                .duration(600)
                .ease(d3.easeLinear)
                .attr("x", 100)
                .attr("y", 125)
        }
    }

    function update(year) {
        if (year == 2009) {
            year_state = 2009
            dance(series2009)
            update_labels()
        } else {
            year_state = 2020
            dance(series2020)
            update_labels()

        }
    }
    // var timer = d3.interval(update, 2000);

    // area_lines.on("click", () => {
    //     timer.stop();
    // })



    /////////////////////////////////////////////////////////////////////////////
    const container = d3.select('#scrolly-overlay');
    const stepSel = container.selectAll('.step'); //final all the step nodes


    function updateChart(index) {
        const sel = container.select(`[data-index='${index}']`);
        const width = sel.attr('data-width');

        const year = parseInt(sel.attr('data-year'));
        stepSel.classed('is-active', (d, i) => i === index);


        // container.select('.bar-inner').style('width', width);

        console.log("Year is ", year)
        update(year)

    }

    function init() {

        enterView({ //our main view function
            selector: stepSel.nodes(),
            //when the slide is 50% away then trigger your chart
            offset: 0.5,
            //what's supposed to happen when the slide enters?
            enter: el => {
                console.log("Calling Enter")
                    //extract the data-index attribute. this can be anything: a filter, a date, whatever.
                const index = +d3.select(el).attr('data-index');
                console.log("Index = ", index)
                updateChart(index);
            },
            exit: el => { //what's supposed to happen when the slide exits?
                console.log("Calling Exit")
                let index = +d3.select(el).attr('data-index');
                index = Math.max(0, index - 1);
                console.log("Index = ", index)
                updateChart(index);
            }
        });

    }

    init();

})