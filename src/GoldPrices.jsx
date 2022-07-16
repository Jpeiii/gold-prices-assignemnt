import React from "react";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { DateRangePicker } from "react-date-range";
import styles from "./styles.module.css";
import { Grid, Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import moment from "moment";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";
import axios from "axios";

class GoldPrices extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(),
      endDate: new Date(),
      goldPrices: [],
      goldPricesDate: [],
      status: null,
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.retrieveGoldPrice = this.retrieveGoldPrice.bind(this);
    this.renderGraph = this.renderGraph.bind(this);
    this.consolidateGoldPrices = this.consolidateGoldPrices.bind(this);
  }

  handleSelect(date) {
    this.setState({ startDate: date.selection["startDate"] });
    this.setState({ endDate: date.selection["endDate"] });
    const start = date.selection["startDate"].toISOString().split("T")[0];
    const end = date.selection["endDate"].toISOString().split("T")[0];
    if (start !== null && end !== null) {
      this.consolidateGoldPrices(start, end);
    }
  }

  consolidateGoldPrices(startDay, endDay) {
    const date1 = new Date(startDay);
    const date2 = new Date(endDay);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // more than 5 years
    if (diffDays >= 1835) {
      this.setState({ status: "not supported" });
    } else if (diffDays >= 367) {
      const getData = (start_day, end_day) =>
        new Promise((resolve) =>
          resolve(
            axios
              .get(`http://api.nbp.pl/api/cenyzlota/${start_day}/${end_day}/`)
              .then((res) => res.data)
          )
        );

      const loop = async () => {
        let result = null;
        let remaindingResult = null;
        let results = [];
        while (startDay <= endDay) {
          var new_endDay = moment(startDay, "YYYY-MM-DD")
            .add(365, "days")
            .toISOString()
            .split("T")[0];
          result = await getData(startDay, new_endDay);
          results.push(result);
          startDay = new_endDay;
        }
        var new_startDay = moment(startDay, "YYYY-MM-DD")
          .subtract(365, "days")
          .toISOString()
          .split("T")[0];
        remaindingResult = await getData(new_startDay, endDay);
        results.push(remaindingResult);
        return results;
      };

      loop().then((res) => {
        let goldDate = [];
        let goldPrice = [];
        let data1arr = [].concat(...res);
        data1arr.map((res) => {
          goldDate.push(res.data);
          goldPrice.push(res.cena);
        });
        this.setState({ status: "ready" });
        this.setState({ goldPricesDate: goldDate });
        this.setState({ goldPrices: goldPrice });
      });
    } else {
      this.retrieveGoldPrice(startDay, endDay);
    }
  }

  retrieveGoldPrice(startDay, endDay) {
    const goldDate = [];
    const goldPrices = [];
    axios
      .get(`http://api.nbp.pl/api/cenyzlota/${startDay}/${endDay}/`)
      .then((respond) => {
        respond.data.map((res) => {
          goldDate.push(res.data);
          goldPrices.push(res.cena);
        });
        this.setState({ status: "ready" });
        this.setState({ goldPricesDate: goldDate });
        this.setState({ goldPrices: goldPrices });
      })
      .catch((error) => {
        if (error.response.data === "404 NotFound - Not Found - Brak danych") {
          this.setState({ status: "loading" });
        } else if (
          error.response.data ===
          "400 BadRequest - Błędny zakres dat / Invalid date range"
        ) {
          this.setState({
            status: "error",
          });
        }
      });
  }

  renderGraph() {
    const { goldPrices, goldPricesDate, status } = this.state;
    console.log(status);
    const data = {
      labels: goldPricesDate,
      datasets: [
        {
          label: `gold prices from ${goldPricesDate[0]} to ${
            goldPricesDate[goldPricesDate.length - 1]
          }`,
          data: goldPrices,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "GOLD PRICES IN USD",
        },
      },
    };
    if (status === null) {
      return <></>;
    } else if (status === "loading") {
      return (
        <Box sx={{ display: "flex" }}>
          <CircularProgress />
        </Box>
      );
    } else if (status === "ready") {
      return <Line data={data} options={options} />;
    } else if (status === "error") {
      return <i>Invalid Date Range, Please select again</i>;
    } else if (status === "not supported") {
      return <i>It is not support data more than 5 years</i>;
    }
  }

  render() {
    const { startDate, endDate } = this.state;
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend
    );

    return (
      <>
        <div className={styles.background}>
          <Box sx={{ flexGrow: 1, p: 5 }}>
            <Grid
              container
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Grid item>
                <DateRangePicker
                  ranges={[
                    {
                      startDate: startDate,
                      endDate: endDate,
                      key: "selection",
                    },
                  ]}
                  onChange={this.handleSelect}
                />
              </Grid>
            </Grid>
            <br />
            <Grid
              container
              direction="row"
              justifyContent="space-between"
              alignItems="flex-end"
            >
              {this.renderGraph()}
            </Grid>
          </Box>
        </div>
      </>
    );
  }
}

export default GoldPrices;
