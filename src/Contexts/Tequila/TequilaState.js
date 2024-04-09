import React, { useState } from "react";
import TequilaContext from "./TequilaContext";

const TequilaState = (props) => {
  const HOST = "https://api.tequila.kiwi.com";

  const [routeData, setRouteData] = useState([]);
  const [fligthData, setFligthData] = useState(null);
  const [airportSuggestions, setAirportSuggestions] = useState([]);

// In TequilaState
const searchItinery = async ({ apikey, flyFrom, flyTo, dateFrom, dateTo }) => {
  const response = await fetch(`${HOST}/v2/search?fly_from=${flyFrom}&fly_to=${flyTo}&date_from=${dateFrom}&date_to=${dateTo}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      apikey,
    },
  });

  const json = await response.json();
  if (response.status === 200) {
    return json; // Return the entire JSON response
  } else {
    throw new Error(`API request failed with status ${response.status}`);
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
        "/v2/booking/check_flights?booking_token=" +
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

  // Airport Suggestions
  const suggestAirport = async ({ apikey, term }) => {
    try {
      const response = await fetch(`${HOST}/locations/query?term=${term}`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "apikey": apikey,
        },
      });
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
  
      const json = await response.json();
      console.log(json); // Log to verify the structure
      return json.locations; // Return the locations part of the response
    } catch (error) {
      console.error("Error fetching airport suggestions:", error);
      return []; // Return an empty array in case of error
    }
  };
  

  return (
    <TequilaContext.Provider
      value={{
        routeData,
        fligthData,
        airportSuggestions,
        searchItinery,
        checkFlights,
        suggestAirport,
      }}
    >
      {props.children}
    </TequilaContext.Provider>
  );
};

export default TequilaState;
