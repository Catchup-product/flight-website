import React, { useState, useCallback } from 'react';
import TequilaContext from './TequilaContext';
import { da } from 'date-fns/locale';

const TequilaState = (props) => {
  const AMADEUS_HOST = 'https://test.api.amadeus.com';

  const [amadeusToken, setAmadeusToken] = useState(null);
  const [flightOffers, setFlightOffers] = useState([]);
  const [dictionaries, setDictionaries] = useState({});



  const fetchAmadeusToken = async ({ clientId, clientSecret }) => {
    try {
      const response = await fetch(`${AMADEUS_HOST}/v1/security/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch token. Status: ${response.status}`);
      }

      const data = await response.json();
      setAmadeusToken(data.access_token);
    } catch (error) {
      console.error('Error fetching Amadeus token:', error);
    }
  };

  const fetchAirportByName = useCallback(async (keyword) => {
    if (!amadeusToken) {
      console.error('No Amadeus token available');
      return;
    }

    try {
      const response = await fetch(`${AMADEUS_HOST}/v1/reference-data/locations?subType=AIRPORT&keyword=${keyword}`, {
        headers: {
          Authorization: `Bearer ${amadeusToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch airport data. Status: ${response.status}`);
      }

      const data = await response.json();
      return data.data.map(airport => airport); // Assuming you only want the airport names
    } catch (error) {
      console.error('Error fetching airport data:', error);
    }
  }, [amadeusToken]);

  const fetchFlightOffers = useCallback(async (params) => {
    const url = new URL(`${AMADEUS_HOST}/v2/shopping/flight-offers`);
    url.search = new URLSearchParams({
      originLocationCode: params.originLocationCode,
      destinationLocationCode: params.destinationLocationCode,
      departureDate: params.departureDate,
      adults: params.adults,
      max: params.max,
    });
    if (params.returnDate) {
      url.searchParams.append('returnDate', params.returnDate);
    }
  
    console.log("URL for API call:", url.toString()); // Check the full URL being called
  
    const headers = new Headers({
      'Authorization': `Bearer ${amadeusToken}`, // Check if token is appended correctly
    });
  
    try {
      const response = await fetch(url, { headers });
      console.log("API Response status:", response.status); // Check response status
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Flight offers fetched:", data); // Log the data to see what you received
      setFlightOffers(data.data); // Check your response structure if 'data' is the correct field
      setDictionaries(data.dictionaries)
    } catch (error) {
      console.error("Could not fetch flight offers: ", error);
    }
  }, [amadeusToken]);
  

  return (
    <TequilaContext.Provider value={{
      amadeusToken,
      fetchAmadeusToken,
      fetchAirportByName,
      flightOffers,
      dictionaries,
      fetchFlightOffers
    }}>
      {props.children}
    </TequilaContext.Provider>
  );
};

export default TequilaState;
