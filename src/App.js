// src/App.js

import React, { useState, useEffect } from 'react';
import { CssBaseline, Grid } from '@material-ui/core';

import { getPlacesData } from './api/index';
import Header from './components/Header/Header';
import List from './components/List/List';
import Map from './components/Map/Map';

const App = () => {
  // Load type and rating from localStorage or fallback
  const [type, setType] = useState(() => localStorage.getItem('selectedType') || 'restaurants');
  const [rating, setRating] = useState(() => localStorage.getItem('selectedRating') || '');

  const [coords, setCoords] = useState({});
  const [bounds, setBounds] = useState(null);

  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);

  const [autocomplete, setAutocomplete] = useState(null);
  const [childClicked, setChildClicked] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get user location on first load
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
      setCoords({ lat: latitude, lng: longitude });
    });
  }, []);

  // Persist filters when they change
  useEffect(() => {
    localStorage.setItem('selectedType', type);
  }, [type]);

  useEffect(() => {
    localStorage.setItem('selectedRating', rating);
  }, [rating]);

  // Fetch places when bounds/type changes
  useEffect(() => {
    if (bounds) {
      setIsLoading(true);

      getPlacesData(type, bounds.sw, bounds.ne)
        .then((data) => {
          const validPlaces = data.filter((place) => place.name && place.num_reviews > 0);
          setPlaces(validPlaces);

          // Apply rating filter if it exists
          if (rating) {
            const filtered = validPlaces.filter((place) => Number(place.rating) >= rating);
            setFilteredPlaces(filtered);
          } else {
            setFilteredPlaces([]);
          }

          setIsLoading(false);
        });
    }
  }, [bounds, type]);

  // Re-filter places when rating changes (post-fetch)
  useEffect(() => {
    if (rating && places.length) {
      const filtered = places.filter((place) => Number(place.rating) >= rating);
      setFilteredPlaces(filtered);
    } else {
      setFilteredPlaces([]);
    }
  }, [rating, places]);

  const onLoad = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = () => {
    const lat = autocomplete.getPlace().geometry.location.lat();
    const lng = autocomplete.getPlace().geometry.location.lng();
    setCoords({ lat, lng });
  };

  return (
    <>
      <CssBaseline />
      <Header onPlaceChanged={onPlaceChanged} onLoad={onLoad} />
      <Grid container spacing={3} style={{ width: '100%' }}>
        <Grid item xs={12} md={4}>
          <List
            isLoading={isLoading}
            childClicked={childClicked}
            places={filteredPlaces.length ? filteredPlaces : places}
            type={type}
            setType={setType}
            rating={rating}
            setRating={setRating}
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={8}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <Map
            setChildClicked={setChildClicked}
            setBounds={setBounds}
            setCoords={setCoords}
            coords={coords}
            places={filteredPlaces.length ? filteredPlaces : places}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default App;
