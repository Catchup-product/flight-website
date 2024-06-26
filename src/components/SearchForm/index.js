import React, { useState, useContext, useCallback, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlaneDeparture, faPlaneArrival, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; import format from 'date-fns/format';
import debounce from 'lodash/debounce'; // Import debounce from lodash
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import styles from "./SearchForm.module.css";
import TequilaContext from '../../Contexts/Tequila/TequilaContext';
import { getAirportCodeByName } from '../../utils/airportUtils'; // adjust the path as necessary
import FlightCard from '../FlightCard/FlightCard';
import LogoContainer from '../logo/LogoContainer';


const SearchForm = () => {
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: null,
    returnDate: null,
    passengers: 1,
    class: 'economy',
    isRoundTrip: false,
  });


  const [travelers, setTravelers] = useState({
    adults: 1,
    children: 0,
    cabinClass: 'Economy',
  });

  const handleCabinClassChange = (event) => {
    setTravelers(prevTravelers => ({
      ...prevTravelers,
      cabinClass: event.target.value,
    }));
  };

  const incrementCount = (field) => {
    setTravelers(prevTravelers => ({
      ...prevTravelers,
      [field]: prevTravelers[field] + 1,
    }));
  };

  const decrementCount = (field) => {
    setTravelers(prevTravelers => ({
      ...prevTravelers,
      [field]: prevTravelers[field] > 0 ? prevTravelers[field] - 1 : 0,
    }));
  };


  const [isLoading, setIsLoading] = useState(false);
  const [airportSuggestions, setAirportSuggestions] = useState([]);

  const { fetchAmadeusToken, fetchAirportByName, amadeusToken, flightOffers, fetchFlightOffers, dictionaries } = useContext(TequilaContext);
  const [activeField, setActiveField] = useState('origin');



  useEffect(() => {
    fetchAmadeusToken({ clientId: 'NJyhbOUCZAYtLotRqkAsv2iAotS1ll58', clientSecret: 'gfwe9d3YCOMbs6q1' });
  }, [fetchAmadeusToken]);

  const handleAirportSearch = useCallback(debounce(async (input) => {
    let airportCode = getAirportCodeByName(input) || input; 
    if (airportCode && airportCode.length >= 3) {
      const suggestions = await fetchAirportByName(airportCode);
      setAirportSuggestions(suggestions);
    } else {
      setAirportSuggestions([]);
    }
  }, 300), [fetchAirportByName]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSearchParams(prevParams => ({
      ...prevParams,
      [name]: value
    }));
    setActiveField(name);
    handleAirportSearch(value, name);
  };

  const handleRoundTripChange = (event) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      isRoundTrip: event.target.checked,
      returnDate: event.target.checked ? searchParams.returnDate : null 
    }));
  };

  const handleSelect = (ranges) => {
    const { selection } = ranges;
    setSearchParams(prevParams => ({
      ...prevParams,
      dateRange: {
        startDate: selection.startDate,
        endDate: selection.endDate,
        key: 'selection',
      }
    }));
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setSearchParams({ ...searchParams, startDate: start, endDate: end });
  };

  const toggleCalendar = () => setCalendarOpen(!isCalendarOpen);


  // In your SearchForm component
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true); // Start loading
    const { originCode, destinationCode, departureDate, returnDate, passengers, isRoundTrip } = searchParams; // Use the stored codes

    console.log(`API Request with origin: ${originCode}, destination: ${destinationCode}`);

    if (!originCode || !destinationCode) {
      alert("Please enter valid airport codes.");
      setIsLoading(false);
      return;
    }

    if (departureDate) {
      console.log("dsajd")
      const formattedDepartureDate = format(departureDate, 'yyyy-MM-dd');
      const formattedReturnDate = returnDate ? format(returnDate, 'yyyy-MM-dd') : null

      await fetchFlightOffers({
        originLocationCode: originCode,
        destinationLocationCode: destinationCode,
        departureDate: formattedDepartureDate,
        returnDate: formattedReturnDate,
        adults: passengers,
        max: 20
      });
    } else {
      console.log("Error: Missing or incorrect date data");
    }
    setIsLoading(false);

  };

  const handleSuggestionClick = (suggestion) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      [activeField]: suggestion.name,
      [`${activeField}Code`]: suggestion.iataCode
    }));
    setAirportSuggestions([]);
    const nextField = activeField === 'origin' ? 'destination' : 'origin';
    setActiveField(nextField);
    if (nextField === 'destination' && destinationInputRef.current) {
      destinationInputRef.current.focus();
    }
  };


  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const displayDateRange = () => {
    const { startDate, endDate } = searchParams.dateRange;
    if (!startDate && !endDate) {
      return 'Select Date Range';
    }
    return `${startDate ? format(startDate, 'MMM dd, yyyy') : 'Early'} - ${endDate ? format(endDate, 'MMM dd, yyyy') : 'Continuous'}`;
  };

  const [isCalendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className={styles.searchFormWrapper}>
      <LogoContainer/>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
      {/* <div className={styles.roundTripContainer}>
  <input
    type="checkbox"
    checked={searchParams.isRoundTrip}
    onChange={handleRoundTripChange}
    className={styles.roundTripCheckbox}
  />
  <label className={styles.roundTripLabel}>Round Trip</label>
</div> */}

        <div className={styles.chooseairportDate}>
        <div className={styles.inputWithIcon}>
          <FontAwesomeIcon icon={faPlaneDeparture} className={styles.icons} />
          <input
            ref={originInputRef}
            type="text"
            name="origin"
            placeholder="From where?"
            value={searchParams.origin}
            onChange={handleInputChange}
            className={styles.inputField}
            onFocus={() => setActiveField('origin')} // Set active field when focused
          />
          {airportSuggestions && airportSuggestions.length > 0 && activeField === 'origin' && (
            <div className={styles.suggestionsContainer}>
              {airportSuggestions.map((suggestion, index) => (
                <div key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)} className={styles.suggestionItem}>
                  {suggestion.name} ({suggestion.iataCode})
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.inputWithIcon}>
          <FontAwesomeIcon icon={faPlaneArrival} className={styles.icons}   />
          <input
            ref={destinationInputRef}
            type="text"
            name="destination"
            placeholder="Where to?"
            value={searchParams.destination}
            onChange={handleInputChange}
            className={styles.inputField}
            onFocus={() => setActiveField('destination')} // Set active field when focused
          />
          {airportSuggestions && airportSuggestions.length > 0 && activeField === 'destination' && (
            <div className={styles.suggestionsContainer}>
              {airportSuggestions.map((suggestion, index) => (
                <div key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)} className={styles.suggestionItem}>
                  {suggestion.name} ({suggestion.iataCode})
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.inputWithIcon}>
        <FontAwesomeIcon icon={faCalendarAlt} className={styles.icons} />
          <DatePicker  selected={searchParams.departureDate} onChange={date => setSearchParams(prev => ({ ...prev, departureDate: date }))} placeholderText="Select departure date" className={styles.inputField} />
        </div>
        {searchParams && (
          <div className={styles.inputWithIcon}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.icons} />
            <DatePicker
              selected={searchParams.returnDate}
              onChange={date => setSearchParams(prev => ({ ...prev, returnDate: date }))}
              placeholderText="Select return date"
              className={styles.inputField}
            />
          </div>

        )}
        </div>

        <select
        className={styles.cabinClassSelect}
        value={travelers.cabinClass}
        onChange={handleCabinClassChange}
      >
        <option value="Economy">Economy</option>
        <option value="Business">Business</option>
        <option value="FirstClass">First Class</option>
      </select>
      
      <div className={styles.countInput}>
        <label>Adults</label>
        <button onClick={() => decrementCount('adults')}>-</button>
        <input readOnly value={travelers.adults} />
        <button onClick={() => incrementCount('adults')}>+</button>
      </div>

      <div className={styles.countInput}>
        <label>Children</label>
        <button onClick={() => decrementCount('children')}>-</button>
        <input readOnly value={travelers.children} />
        <button onClick={() => incrementCount('children')}>+</button>
      </div>

      <button className={styles.applyButton}>Apply</button>
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>
      {isLoading && (
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
        </div>
      )}


      {!isLoading && flightOffers && flightOffers.length > 0 && (
        <div className={styles.flightOffersContainer}>
          {flightOffers.map((offer) => (
            <FlightCard key={offer.id} offer={offer} dictionaries={dictionaries} />
          ))}
        </div>
      )}

      
    </div>
  );
};



export default SearchForm;
