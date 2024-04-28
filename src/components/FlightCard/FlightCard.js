import React from "react";
import styles from "../FlightCard/flightcard.module.css";

const FlightCard = ({ offer, dictionaries }) => {
    const carrierCode = offer.itineraries[0].segments[0].carrierCode;
    const airlineName = dictionaries?.carriers?.[carrierCode] ?? 'Unknown Airline';
    const airlineLogo = `https://createcombucket.s3.ap-south-1.amazonaws.com/vistara.png`; // Use actual logo URL

    const formatTime = (dateTimeStr) => new Date(dateTimeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const currencyRate = {
        "EUR": 85, // Example conversion rate
        "USD": 75, // Example conversion rate
    };

    // Format duration from ISO 8601 to a simpler format
    const formatDuration = (duration) => {
        const match = duration.match(/PT(\d+H)?(\d+M)?/);
        return `${match[1] || ''} ${match[2] || ''}`.trim();
    };

    // Convert price to INR
    const priceInINR = (offer.price.total * (currencyRate[offer.price.currency] || 1)).toFixed(2);

    return (
        <div className={styles.flightCard}>
            {offer.itineraries.map((itinerary, index) => (
                <div key={index} className={styles.itinerary}>
                    <h3>{index === 0 ? 'Outbound Flight' : 'Return Flight'}</h3>
                    {itinerary.segments.map((segment, idx) => (
                        <div key={idx} className={styles.segment}>
                            <div className={styles.airlineLogo}>
                                <img src={airlineLogo} alt={airlineName} />
                            </div>
                            <div className={styles.flightDetails}>
                                <span><strong>Departure:</strong> {formatTime(segment.departure.at)} ({segment.departure.iataCode})</span>
                                <span><strong>Arrival:</strong> {formatTime(segment.arrival.at)} ({segment.arrival.iataCode})</span>
                                <span><strong>Duration:</strong> {formatDuration(segment.duration)}</span>
                                <span><strong>Flight Number:</strong> {segment.carrierCode} {segment.number}</span>
                                <span><strong>Aircraft:</strong> {dictionaries.aircraft[segment.aircraft.code]}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
            <div className={styles.priceDetails}>
                <div>{`Price: ₹ ${priceInINR}`}</div> {/* Display price in INR */}
                <button className={styles.selectButton}>Select</button>
            </div>
        </div>
    );
};

export default FlightCard;
