import React, { useState,useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlaneDeparture, faPlaneArrival, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { DateRangePicker } from 'react-date-range';
import format from 'date-fns/format';
import 'react-date-range/dist/styles.css'; // main css file for the date range picker
import 'react-date-range/dist/theme/default.css'; // theme css file for the date range picker
import styles from "./SearchForm.module.css";
import TequilaContext from '../../Contexts/Tequila/TequilaContext';

const SearchForm = ({ onSearch }) => {
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
  });

  const [airportSuggestions, setAirportSuggestions] = useState([]);
  const { suggestAirport } = useContext(TequilaContext); // Accessing context


  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setSearchParams(prevState => ({ ...prevState, [name]: value }));

    if (value.length > 2) { 
      try {
        const apikey = "HxbcQFD8rtk3Ev13yGLVQDBa59E_coFX";
        await suggestAirport({ apikey, term: value });
      } catch (error) {
        console.error("Error fetching airport suggestions:", error);
      }
    }
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
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
