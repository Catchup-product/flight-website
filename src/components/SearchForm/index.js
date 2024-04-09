import React, { useState,useContext,useCallback } from 'react';
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
  const { suggestAirport, searchItinery } = useContext(TequilaContext);


const fetchSuggestionsDebounced = useCallback(debounce(async (value, inputName) => {
  if (value.length > 2) {
    try {
      const apikey = "HxbcQFD8rtk3Ev13yGLVQDBa59E_coFX";
      // Call suggestAirport and handle the returned data
      const suggestions = await suggestAirport({ apikey, term: value });
      console.log(suggestions)
      setAirportSuggestions(suggestions); // Update state with the fetched data
    } catch (error) {
      console.error("Error fetching airport suggestions:", error);
      setAirportSuggestions([]); // Ensure state is cleared or handled appropriately on error
    }
  } else {
    setAirportSuggestions([]); 
  }
}, 500), []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prevState => ({ ...prevState, [name]: value }));

    // Call the debounced fetch function
    fetchSuggestionsDebounced(value, name);
  };
  const handleSelectSuggestion = (suggestion) => {
    setSearchParams(prevState => ({
      ...prevState,
      [prevState.destination.length <= 2 ? 'origin' : 'destination']: suggestion.code
    }));
    setAirportSuggestions([]); // Clear suggestions after selection
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
  
    // Assuming `apikey` is defined and available
    const apikey = "HxbcQFD8rtk3Ev13yGLVQDBa59E_coFX";
  
    // Extract parameters from the form's state
    const { origin, destination, dateRange } = searchParams;
    const dateFrom = format(dateRange.startDate, 'yyyy-MM-dd');
    const dateTo = format(dateRange.endDate, 'yyyy-MM-dd');
  
    try {
      const response = await searchItinery({
        apikey,
        flyFrom: origin,
        flyTo: destination,
        dateFrom,
        dateTo,
      });
  
      // Assuming you want to save the entire response for now; adjust as needed
      setSearchParams(prevState => ({
        ...prevState,
        searchResponse: response.data, // Saving the array of flight options
        bookingToken: response.data[0]?.booking_token // Saving booking token of the first flight option
      }));
  
      // Optionally, navigate to another page or show a message
      // console.log("Search successful", response);

      // console.log(searchParams.searchResponse)
      console.log(searchParams.bookingToken)
    
    } catch (error) {
      console.error("Error searching itinerary:", error);
      // Handle errors (e.g., show error message)
    }
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
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        {/* Origin and Destination Input */}
        <div className={styles.inputWithIcon}>
          <FontAwesomeIcon icon={faPlaneDeparture} className={styles.inputIcon} />
          <input
            type="text"
            name="origin"
            placeholder="From where?"
            value={searchParams.origin}
            onChange={handleInputChange}
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
            onChange={handleInputChange}
             className={styles.inputField}
          />
        </div>
        {airportSuggestions.length > 0 && (
          <div className={styles.suggestionsContainer}>
            {airportSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={styles.suggestionItem}
                onClick={() => handleSelectSuggestion(suggestion)}
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
