import React, { useState,useContext,useCallback,useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlaneDeparture, faPlaneArrival, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { DateRangePicker } from 'react-date-range';
import format from 'date-fns/format';
import 'react-date-range/dist/styles.css'; // main css file for the date range picker
import 'react-date-range/dist/theme/default.css'; // theme css file for the date range picker
import styles from "./SearchForm.module.css";
import TequilaContext from '../../Contexts/Tequila/TequilaContext';

const SearchForm = () => {
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    dateRange: {
      startDate: null,
      endDate: null,
      key: 'selection',
    },
    passengers: 1,
    class: 'economy',
    searchResponse: [], // Adding this to hold search results
    bookingToken: null, // Adding this to hold the booking token
  });
  

  const [airportSuggestions, setAirportSuggestions] = useState([]);
  const { fetchAmadeusToken, amadeusToken } = useContext(TequilaContext);
 


    fetchAmadeusToken({ clientId: 'NJyhbOUCZAYtLotRqkAsv2iAotS1ll58', clientSecret: 'gfwe9d3YCOMbs6q1' });

    

  function debounce(func, wait) {
    let timeout;
  
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
  
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  const handleSelect = (ranges) => {
    const { selection } = ranges;
    setSearchParams(prevParams => ({
      ...prevParams,
      dateRange: selection
    }));
    // Automatically close the calendar after selection
    setCalendarOpen(false);
  };

  const toggleCalendar = () => {
    setCalendarOpen(!isCalendarOpen);
  };


  
  
  const displayDateRange = () => {
    const { startDate, endDate } = searchParams.dateRange;
    if (!startDate && !endDate) {
      return 'Select Date Range';
    }
    return `${startDate ? format(startDate, 'MMM dd, yyyy') : 'Early'} - ${endDate ? format(endDate, 'MMM dd, yyyy') : 'Continuous'}`;
  };

  return (
    <div className={styles.searchFormWrapper}>
      <form className={styles.formContainer}>
        {/* Origin and Destination Input */}
        <div className={styles.inputWithIcon}>
          <FontAwesomeIcon icon={faPlaneDeparture} className={styles.inputIcon} />
          <input
            type="text"
            name="origin"
            placeholder="From where?"
            value={searchParams.origin}
            
            className={styles.inputField}
          />
        </div>
        <div className={styles.inputWithIcon}>
          <FontAwesomeIcon icon={faPlaneArrival} className={styles.inputIcon} />
          <input
            type="text"
            name="destination"
            placeholder="Where to?"
            value={searchParams.destination}
             className={styles.inputField}
          />
        </div>
        {airportSuggestions.length > 0 && (
          <div className={styles.suggestionsContainer}>
            {airportSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={styles.suggestionItem}
              >
                {suggestion.name} ({suggestion.code})
              </div>
            ))}
          </div>
        )}
        <div className={styles.inputWithIcon} onClick={toggleCalendar}>
          <FontAwesomeIcon icon={faCalendarAlt} className={styles.inputIcon} />
          <input
            readOnly
            type="text"
            value={displayDateRange()}
            className={styles.inputField}
          />
        </div>
        {isCalendarOpen && (
          <DateRangePicker
            ranges={[searchParams.dateRange]}
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            className={styles.dateRangePicker}
          />
        )}
        {/* Passengers Input */}
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchForm;
