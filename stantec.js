let dataset = "https://raw.githubusercontent.com/julien-blanchard/stantec/main/full_data.csv";

const fetchData = async (csv_file) => {
    return fetch(csv_file)
    .then(
        d => {return d.text()}
    ).then(
        text => {return text.split("\n")}
    )
  };

const getData = async (csv_file) => {
    const data = await fetchData(csv_file)
    let struct = {
        //DateTime: [],
        Day: [],
        Hour: [],
        Level: [],
        SPS_A1_RUNNING: [],
        SPS_A1_STOPPED: [],
        SPS_A2_RUNNING: [],
        SPS_A2_STOPPED: [],
        RG_A: [],
        Delta: [],
        Month: [],
        Week: [],
        Day_name: []
    };

    for (let row of data.slice(1)) {
        parsed = row.split(",");
        struct["Level"].push(parseFloat(parsed[1]).toFixed(2))
        struct["SPS_A1_RUNNING"].push(parsed[2])
        struct["SPS_A1_STOPPED"].push(parsed[3])
        struct["SPS_A2_RUNNING"].push(parsed[4])
        struct["SPS_A2_STOPPED"].push(parsed[5])
        struct["RG_A"].push(parseFloat(parsed[6]).toFixed(2))
        struct["Day"].push(parsed[7])
        struct["Delta"].push(parseFloat(parsed[8]).toFixed(2))
        struct["Hour"].push(parsed[9])
        struct["Month"].push(parsed[10])
        struct["Week"].push(parsed[11])
        struct["Day_name"].push(parsed[12])   
    }
    return struct;
}

const getTable = async (csv_file) => {
    getClear();
    const data = await getData(csv_file)
    const dframe = aq.table(data);
    let viz_df = document.getElementById("viz_df");
    viz_df.innerHTML = aq.table(dframe).toHTML()
  }

const getForecast = async () => {
    let lat = document.getElementById("lat").value //53.350140; 
    let lon = document.getElementById("lon").value //-6.266155
    let api_key = document.getElementById("api_key").value;
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`;
    const request = new Request(url);
    return fetch(request)
        .then(
            req => {return req.json()}
            )
}

const getPlot = async () => {
    getClear();
    const weather = await getForecast();
    let struct = {
        Day: [],
        Humidity: []
    }
    for (let w of weather["list"]) {
        struct["Day"].push(w["dt_txt"]);
        struct["Humidity"].push(w["main"]["humidity"]);
    }
    var options = {
        chart: {
          type: "area"
        },
        series: [{
          name: "Rain levels",
          data: struct["Humidity"]
        }],
        xaxis: {
          categories: struct["Day"]
        },
        stroke: {
          width: 5,
          curve: "smooth"
        }
      }
      
      var chart = new ApexCharts(document.querySelector("#viz_plot"), options);
      
      chart.render();
}

const getClear = () => {
    viz_df.innerHTML = "";
    viz_plot.innerHTML = "";
}

const getChoice = () => {
    let choice = document.getElementById("choice").value;
    if (choice == "Dataframe") {
      getTable(dataset);
    }
    else if (choice === "Forecast") {
      getPlot();
    }
};

let viz_df = document.getElementById("viz_df");
let viz_plot = document.getElementById("viz_plot");
let press_f = document.getElementById("press_fetch");
let press_c = document.getElementById("press_clear");
press_c.addEventListener("click", getClear);
press_f.addEventListener("click", getChoice);