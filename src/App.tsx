import React, { useState } from "react";
import Autosuggest, {
  SuggestionsFetchRequestedParams,
} from "react-autosuggest";
import cities from "./datos/cities.json";
import "./App.css";
import { City } from "./interfaces/city";

// Datos de ejemplo para autocompletado
const suggestions = cities;

const App: React.FC = () => {
  const [value, setValue] = useState<string>("");
  const [suggestionsState, setSuggestions] = useState<City[]>([]);
  const [ciudadesCercaState, setCiudadesCerca] = useState<City[]>([]);

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    { newValue }: { newValue: string }
  ) => {
    setValue(newValue);
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestions = (value: string): City[] => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? suggestions
      : suggestions.filter(
          (suggestion) =>
            suggestion.name.toLowerCase().slice(0, inputLength) === inputValue
        );
  };

  const renderSuggestion = (suggestion: City) => <div> {suggestion.name} </div>;

  const inputProps = {
    placeholder: "Escribe la ciudad a buscar",
    value,
    onChange: onChange as any,
  };

  const onSuggestionSelected = (
    _event: React.FormEvent<HTMLInputElement>,
    { suggestion }: { suggestion: City }
  ) => {
    setCiudadesCerca(
      encontrarCiudadesCercanas(
        parseInt(suggestion.lat),
        parseInt(suggestion.lng),
        suggestions
      )
    );
  };

  //Funciones para hallar las ciudades mas cercanas

  const calcularDistancia = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distancia en kilómetros
    return d;
  };

  const encontrarCiudadesCercanas = (
    latitud: number,
    longitud: number,
    ciudades: City[]
  ) => {
    // Calcular distancias y mantener un array de objetos {ciudad, distancia}
    const distancias = ciudades.map((ciudad) => {
      const distancia = calcularDistancia(
        latitud,
        longitud,
        parseInt(ciudad.lat),
        parseInt(ciudad.lng)
      );
      return { ciudad, distancia };
    });

    // Ordenar las ciudades por distancia ascendente
    distancias.sort((a, b) => a.distancia - b.distancia);

    // Tomar las primeras tres ciudades como las más cercanas
    const ciudadesCercanas = distancias.slice(0, 4).map((item) => item.ciudad);
    return ciudadesCercanas;
  };

  return (
    <div className="App">
      <div className="container mt-3">
        <h1 className="text-center">Autocompletado en React con TypeScript</h1>
        <div className="row">
          <div className="col-6">
            <Autosuggest
              suggestions={suggestionsState}
              onSuggestionsFetchRequested={onSuggestionsFetchRequested}
              onSuggestionsClearRequested={onSuggestionsClearRequested}
              getSuggestionValue={(suggestion: City) => suggestion.name}
              renderSuggestion={renderSuggestion}
              onSuggestionSelected={onSuggestionSelected}
              inputProps={inputProps as any}
            />
          </div>
          <div className="col-6">
            <div className="title">Ciudades cercanas:</div>
            {ciudadesCercaState.map((dato) => (
              <div key={dato.name} className="dato">
                <li>{dato.name}</li>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
