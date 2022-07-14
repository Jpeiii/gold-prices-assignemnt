import React from "react";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { DateRangePicker } from "react-date-range";
import styles from "./styles.module.css";
import { Grid, Box } from "@mui/material";

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
import { addDays } from "date-fns";

class GoldPrices extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(),
      endDate: new Date(),
      goldPrices: [],
      goldPricesDate: [],
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.retrieveGoldPrice = this.retrieveGoldPrice.bind(this);
  }

  handleSelect(date) {
    this.setState({ startDate: date.selection["startDate"] });
    this.setState({ endDate: date.selection["endDate"] });
    const start = date.selection["startDate"].toISOString().split("T")[0];
    const end = date.selection["endDate"].toISOString().split("T")[0];
    if (start !== null && end !== null) {
      this.retrieveGoldPrice(start, end);
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
        this.setState({ goldPricesDate: goldDate });
        this.setState({ goldPrices: goldPrices });
      })
      .catch((error) => {
        console.log("error");
      });
  }

  render() {
    const { startDate, endDate, goldPrices, goldPricesDate } = this.state;
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend
    );
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
              {goldPrices.length === 0 && goldPricesDate.length === 0 ? null : (
                <Line data={data} options={options} />
              )}
            </Grid>
          </Box>
        </div>
      </>
    );
  }
}

export default GoldPrices;
