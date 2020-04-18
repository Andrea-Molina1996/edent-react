import React from "react";
import "../styles/PagesStyle.css";
import Paper from "@material-ui/core/Paper";

const Calendar = (props) => {

  return (
    <div className={"pageContainer"}>
      <Paper className={"wide-paper"} elevation={2} square={false}>
        <h2>Calendario</h2>
      <iframe title={"Calendar"} style={{minWidth: "800px", width: "100%", height:"83vh", border: "none"}}
              src="https://calendar.google.com/calendar/embed?src=7ramu05buiqo4tbin27tp2qdd0%40group.calendar.google.com&ctz=America%2FGuatemala"/>
      </Paper>
    </div>
  )
};

export {Calendar};