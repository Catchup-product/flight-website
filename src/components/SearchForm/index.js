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



  const [isLoading, setIsLoading] = useState(false);
  const [airportSuggestions, setAirportSuggestions] = useState([]);

  const { fetchAmadeusToken, fetchAirportByName, amadeusToken, flightOffers, fetchFlightOffers, dictionaries } = useContext(TequilaContext);
  // console.log("hello",flightOffers)

  const [activeField, setActiveField] = useState('origin'); // New state to track active field



  useEffect(() => {
    fetchAmadeusToken({ clientId: 'NJyhbOUCZAYtLotRqkAsv2iAotS1ll58', clientSecret: 'gfwe9d3YCOMbs6q1' });
  }, [fetchAmadeusToken]);

  const handleAirportSearch = useCallback(debounce(async (input) => {
    let airportCode = getAirportCodeByName(input) || input; // Fallback to input if name is not found
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
    setActiveField(name); // Set the active field based on which input is being changed
    handleAirportSearch(value, name);
  };

  const handleRoundTripChange = (event) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      isRoundTrip: event.target.checked,
      returnDate: event.target.checked ? searchParams.returnDate : null  // Clear return date if unchecked
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
      const formattedReturnDate = returnDate && isRoundTrip ? format(returnDate, 'yyyy-MM-dd') : null

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
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div className={styles.inputWithIcon}>
          <input
            type="checkbox"
            checked={searchParams.isRoundTrip}
            onChange={handleRoundTripChange}
          /> Round Trip
        </div>
        <div className={styles.inputWithIcon}>
          <FontAwesomeIcon icon={faPlaneDeparture} />
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
          {airportSuggestions.length > 0 && activeField === 'origin' && (
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
          <FontAwesomeIcon icon={faPlaneArrival} className={styles.inputIcon} />
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
          {airportSuggestions.length > 0 && activeField === 'destination' && (
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
          <DatePicker selected={searchParams.departureDate} onChange={date => setSearchParams(prev => ({ ...prev, departureDate: date }))} placeholderText="Select departure date" className={styles.inputField} />

        </div>
        {searchParams.isRoundTrip && (
          <div className={styles.inputWithIcon}>

            <DatePicker

              selected={searchParams.returnDate}
              onChange={date => setSearchParams(prev => ({ ...prev, returnDate: date }))}
              placeholderText="Select return date"
              className={styles.inputField}
            />
          </div>

        )}
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>
      {isLoading && (
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
        </div>
      )}


      {!isLoading && flightOffers.length > 0 && (
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
