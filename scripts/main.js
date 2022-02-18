let width = 800;
let height = 500;

let margin = {
    top: 30,
    right: 10,
    bottom: 10,
    left: 10
};


let svg = d3.select("body").select("svg")

console.log(svg)

function get_merged_stats(player_stats, player_names) {
    // Merge player names to player stats
    var player_vals = Object.values(player_names);
    player_stats.forEach(function(row) {
        //Update data types
        row.year = +row.year
        row.playoff_wins = +row.playoff_wins
        for (var i = 0; i < player_vals.length; i++) {

            if (player_vals[i].player_id == row.player_id) {
                // Add player name
                row.player_name = player_vals[i].player_name;
                //Add age
                row.age = player_vals[i].age_start + (
                    row.year - player_vals[i].year_start)
                break;
            }
        }
    })
    return player_stats
}

function define_axes(data, margin, x_var, y_var) {
    //d3 scales for the x and y axis
    //domain takes the data we have and maps them into SVG space
    let x = d3.scaleLinear()
        //values
        .domain(d3.extent(data.map(d => d[x_var])))
        //length of axis on screen
        .range([margin.left, width - margin.right])

    let y = d3.scaleLinear()
        .domain(d3.extent(data.map(d => d[y_var])))
        .range([height - margin.bottom, margin.top])

    return [x, y]
}

function set_axes(svg, x, y, margin, width, height) {
    let yAxisSettings = d3.axisRight(y) //set axis to the right
        .tickSize(width) //size of tick lines
        .tickPadding(10) //distance from tick labels to tick marks
        .tickValues([5, 10, 15, 20, 25, 30, 35])

    let xAxisSettings = d3.axisBottom(x)
        .tickSize(10)
        .tickPadding(10)
        .tickFormat(d3.format("0"))
        .ticks(6)

    let xAxisTicks = svg.append("g")
        .attr("class", "x axis")
        .call(xAxisSettings)
        .attr("transform", `translate(0,${height - margin.bottom})`)


    let yAxisTicks = svg.append("g")
        .attr("class", "y axis")
        .call(yAxisSettings)
        .attr("transform", `translate(${margin.left},0)`)

    // return functions we need to reuse later
    return [svg, xAxisSettings, xAxisTicks]
}

function set_colors(d, imp_players) {
    if (get_last_d(d).year >= 2020) { // Players in 2020 are blue
        return "#33b9ff"
    } else if (imp_players.includes(d[0])) { // highlight important players as dark grey
        return "#696969"
    } else { // Everyone else is light grey
        return "#d3d3d3"
    }
}

function set_opacity(d, imp_players) {
    if (get_last_d(d).year >= 2020) { // Players in 2020 are blue
        return 1
    } else if (imp_players.includes(d[0])) { // highlight important players as dark grey
        return 1
    } else { // Everyone else is light grey
        return 0.7
    }
}

function get_last_d(d) {
    // Return last value from data
    //data is nested (grouped) array
    return d[1][d[1].length - 1]
}

let imp_players = [
    "Joe Montana",
    "Terry Bradshaw",
    "Tom Brady",
    "Bart Starr",
    "John Elway",
    "Fran Tarkenton"
];

function if_tom_then_x(d, x, y) {
    if (d[0] == "Tom Brady") {
        return x
    } else {
        return y
    }
}

function define_line(x_var) {
    let line = d3.line() //define a line function
        .x(d => x(d[x_var])) //accessing date 
        .y(d => y(d.playoff_wins)) //accesssing value 
    return line
}

function def_line_path(svg, grouped_data, imp_players, line) {
    let lines = svg.append("g")
        .selectAll(".line")
        .data(grouped_data)
        .join("path")
        .attr("d", d => line(d[1]))
        .style("fill", "none") // We don't want to fill in the lines 
        .style("stroke", d => set_colors(d, imp_players))
        .style("opacity", d => set_opacity(d, imp_players))
        // Make brady line thicker
        .style("stroke-width", d => if_tom_then_x(d, "4px", "1px"))
    return lines
}

function def_points(svg, grouped_data, imp_players, x, y, x_var) {
    points = svg.append("g")
        .selectAll(".points")
        .data(grouped_data)
        .join("circle")
        .attr("cx", d => x(get_last_d(d)[x_var]))
        .attr("cy", d => y(get_last_d(d).playoff_wins))
        // Brady dot is larger
        .attr("r", d => if_tom_then_x(d, 5, 1.5))
        // Set colors 
        .style("fill", d => set_colors(d, imp_players))
        .style("opacity", d => set_opacity(d, imp_players))
    return points
}

function add_labels(svg, grouped_data, imp_players, x, y, x_var) {
    labels = svg.append("g")
        .selectAll("text")
        .data(grouped_data)
        .join("text")
        //get the last x value (year) for each qb
        .attr("x", d => x(get_last_d(d)[x_var]))
        //Get the last y value (playoff wins) for each qb
        .attr("y", d => y(get_last_d(d).playoff_wins))
        // Move labels slightly 
        .attr("dx", d => if_tom_then_x(d, -50, 5))
        .attr("dy", d => if_tom_then_x(d, -20, 5))
        // Get last name only
        .text(d => d[0].split(' ')[1])
        .style("fill", d => {
            if (imp_players.includes(d[0])) {
                return "black"
            } else {
                return if_tom_then_x(d, "black", "none")
            }
        })
        .style("font-size", d => if_tom_then_x(d, 28, 14))
    return labels
}

function add_baseline(margin, width, y) {
    svg.append("line")
        .attr("x1", margin.left)
        .attr("x2", width + margin.left)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .style("stroke", "black")
        .style("stroke-width", "2px")
}

function x_transition() {
    d3.transition()
        .duration(600)
        .ease(d3.easeLinear)
}

function update_x_var(data, main_x_var, x, xAxisSettings, xAxisTicks,
    line, lines, points, labels) {
    //redefine x function
    x
        .domain(d3.extent(data.map(d => d[main_x_var])))

    xAxisSettings
    d3.axisBottom(x)

    xAxisTicks
        .call(xAxisSettings)

    // redefine line
    line
        .x(d => x(d[main_x_var]))

    // redefine lines
    lines
        .transition(x_transition)
        .attr("d", d => line(d[1]))

    // redefine points
    points
        .transition(x_transition)
        .attr("cx", d => x(get_last_d(d)[main_x_var]))

    // redefine labels
    labels
        .transition(x_transition)
        .attr("x", d => x(get_last_d(d)[main_x_var]))

}

d3.tsv("data/cumulative-stats.tsv").then(function(player_stats) {
    d3.json("data/player_lookup.json").then(function(player_names) {

        let main_x_var = "year";

        // 1. Get updated player stats
        player_stats = get_merged_stats(player_stats, player_names);

        // 5. Group by QB
        let grouped_data = d3.group(player_stats, d => d.player_name);

        // 2. Set up axes
        const [x, y] = define_axes(player_stats, margin, main_x_var, "playoff_wins");

        // 3. define the settings for our axes
        [svg, xAxisSettings, xAxisTicks] = set_axes(svg, x, y, margin, width, height);

        // 4. Define line function
        let line = d3.line()
            .x(d => x(d[main_x_var]))
            .y(d => y(d.playoff_wins))

        //6. Define line path
        lines = def_line_path(svg, grouped_data, imp_players, line)

        // Add points to end of lines
        points = def_points(svg, grouped_data, imp_players, x, y, main_x_var)

        // Add labels for several players
        labels = add_labels(svg, grouped_data, imp_players, x, y, main_x_var)

        add_baseline(margin, width, y);

        function update_year() {
            update_x_var(player_stats, "year", x, xAxisSettings, xAxisTicks,
                line, lines, points, labels)
        }

        function update_age() {
            update_x_var(player_stats, "age", x, xAxisSettings, xAxisTicks,
                line, lines, points, labels)
        }
        let age_button = d3.select(".age-btn").on("click", update_age);
        let year_button = d3.select(".year-btn").on("click", update_year);
    })
})