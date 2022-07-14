import React from "react";
import styles from "./styles.module.css";
import { blueGrey } from "@mui/material/colors";
import { Grid, Avatar, Box } from "@mui/material";

class Header extends React.Component {
  Logo() {
    return (
      <div>
        <section className={styles.logo}>
          <span>ClassHero</span>
        </section>
      </div>
    );
  }

  Avatar() {
    return (
      <div>
        <section className={styles.avatar_header}>
          <Avatar sx={{ bgcolor: blueGrey[500] }}>JP</Avatar>
        </section>
      </div>
    );
  }
  render() {
    return (
      <section className={styles.header}>
        <Grid container spacing={2}>
          <Grid item xs={2}>
            {this.Logo()}
          </Grid>
          <Box sx={{ flexGrow: 1 }} />
          <Grid item xs={1}>
            {this.Avatar()}
          </Grid>
        </Grid>
      </section>
    );
  }
}

export default Header;
