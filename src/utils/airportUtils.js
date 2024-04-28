// airportUtils.js

const airportNameToCodeMapping = {
    'Indira Gandhi International Airport': 'DEL',
    'Kempegowda International Airport': 'BLR',
    'Mumbai': 'BOM',
    'New Delhi': 'DEL',
    'Hyderabad': 'HYD',
    'Chennai': 'MAA',
    'Kolkata': 'CCU',
    'Pune': 'PNQ',
    'Jaipur': 'JAI',
    'Lucknow': 'LKO',
    'Kochi': 'COK',
    'Ahmedabad': 'AMD',
    'Goa': 'GOI',
    'Trivandrum': 'TRV',
    'Guwahati': 'GAU',
    'Bhubaneswar': 'BBI',
  };
  
  export const getAirportCodeByName = (inputName) => {
    const airportNameKey = Object.keys(airportNameToCodeMapping).find(key =>
      key.toLowerCase().includes(inputName.trim().toLowerCase())
    );
    return airportNameKey ? airportNameToCodeMapping[airportNameKey] : null;
  };
  