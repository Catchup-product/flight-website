import React, { useState } from "react";
import TequilaContext from "./TequilaContext";

const TequilaState = (props) => {
  const AMADEUS_HOST = "https://test.api.amadeus.com";

  const [amadeusToken, setAmadeusToken] = useState(null);

  const fetchAmadeusToken = async ({ clientId, clientSecret }) => {
    try {
      const response = await fetch(`${AMADEUS_HOST}/v1/security/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "client_credentials",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch token. Status: ${response.status}`);
      }

      const data = await response.json();
      setAmadeusToken(data.access_token);
      console.log("token"+amadeusToken);
    } catch (error) {
      console.error("Error fetching Amadeus token:", error);
    }
  };



  return (
    <TequilaContext.Provider
      value={{
        amadeusToken,
        fetchAmadeusToken,
      }}
    >
      {props.children}
    </TequilaContext.Provider>
  );
};

export default TequilaState;
