import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const RequestButton = () => {
    const [message, setMessage] = useState('');
    const [retryAfter, setRetryAfter] = useState(null);
    const requestInterval = useRef(null);

    const sendRequest = async () => {
        try {
            const response = await axios.get('http://localhost:3000');
            setMessage(response.data.message); // Success message
            setRetryAfter(null); // Reset retry after successful request
        } catch (error) {
            if (error.response && error.response.status === 429) {
                setMessage(error.response.data.message); // Rate limit message
                setRetryAfter(error.response.data.retryAfter); // Set retry time in seconds
            } else {
                setMessage('An error occurred');
            }
        }
    };

    // Set interval to send requests every 5 seconds
    useEffect(() => {
        requestInterval.current = setInterval(() => {
            sendRequest();
        }, 10000); // Send a request every 5 seconds

        return () => clearInterval(requestInterval.current); // Clean up on unmount
    }, []);

    // Countdown handler for retryAfter display
    useEffect(() => {
        let countdownInterval;
        if (retryAfter !== null) {
            countdownInterval = setInterval(() => {
                setRetryAfter((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(countdownInterval);
    }, [retryAfter]);

    return (
        <div>
            <p>{message}</p>
            {retryAfter !== null && (
                <p>Retrying in {retryAfter} seconds...</p>
            )}
        </div>
    );
};

export default RequestButton;
