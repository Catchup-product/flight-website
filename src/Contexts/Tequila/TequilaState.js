import React, { useState } from "react";
import TequilaContext from "./TequilaContext";

const TequilaState = (props) => {
  const HOST = "https://api.tequila.kiwi.com/v2";

  const [routeData, setRouteData] = useState([]);
  const [fligthData, setFligthData] = useState(null);

  // Search Itinery
  const searchItinery = async ({
    apikey,
    flyFrom,
    flyTo,
    dateFrom,
    dateTo,
  }) => {
    const response = await fetch(
      HOST +
        "/search?fly_from=" +
        flyFrom +
        "&fly_to=" +
        flyTo +
        "&date_from=" +
        dateFrom +
        "&date_to=" +
        dateTo,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          apikey,
        },
      }
    );
    const json = await response.json();
    if (response.status === 200) {
      setRouteData(...json.data);
    }
  };

  // Check Flights
  const checkFlights = async ({
    apikey,
    bookingToken,
    bags,
    adults,
    children,
    infants,
    sessionId,
  }) => {
    const response = await fetch(
      HOST +
        "/booking/check_flights?booking_token=" +
        bookingToken +
        "&bnum=" +
        bags +
        "&adults=" +
        adults +
        "&children=" +
        children,
      "&infants=" + infants,
      "&session_id=" + sessionId,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          apikey,
        },
      }
    );
    const json = await response.json();
    if (response.status === 200) {
      setFligthData(...json);
    }
  };

  return (
    <TequilaContext.Provider value={{ searchItinery, checkFlights }}>
      {props.children}
    </TequilaContext.Provider>
  );
};

export default TequilaState;
