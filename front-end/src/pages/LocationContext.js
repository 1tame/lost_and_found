import React, { createContext, useContext, useEffect, useState } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
  const saved = localStorage.getItem('userLocation');

  if (saved) {
    setLocation(JSON.parse(saved));
    return;
  }

  // ✅ Avoid asking again if previously denied
  const denied = localStorage.getItem('locationDenied');
  if (denied === 'true') {
    console.warn('Skipping location request due to previous denial.');
    return;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        localStorage.setItem('userLocation', JSON.stringify(coords));
        setLocation(coords);
      },
      (err) => {
        console.warn('Location permission denied:', err);
        // ✅ Save that it was denied so we don’t ask again
        localStorage.setItem('locationDenied', 'true');
      }
    );
  }
}, []);


  return (
    <LocationContext.Provider value={{ location }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
