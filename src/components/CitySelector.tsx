'use client';
import { City } from '@/types';
import FlagIcon from './FlagIcon';

interface CitySelectorProps {
    cities: City[];
    selectedCity: City | null;
    onSelect: (city: City | null) => void;
}

// Group cities by country
const groupByCountry = (cities: City[]): Record<string, City[]> => {
    return cities.reduce((result, city) => {
        const country = city.country;
        if (!result[country]) {
            result[country] = [];
        }
        result[country].push(city);
        return result;
    }, {} as Record<string, City[]>);
};

// Country order: USA first, then Canada, then Mexico
const countryOrder = ['USA', 'Canada', 'Mexico'];

export default function CitySelector({ cities, selectedCity, onSelect }: CitySelectorProps) {
    const groupedCities = groupByCountry(cities);
    const sortedCountries = countryOrder.filter(c => groupedCities[c]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '') {
            onSelect(null);
        } else {
            const city = cities.find(c => c.id === value);
            onSelect(city || null);
        }
    };

    return (
        <div className="city-selector" role="search">
            <label htmlFor="city-select" className="visually-hidden">
                Select city
            </label>
            <div className="city-select-wrapper">
                {selectedCity ? (
                    <span className="select-flag" aria-hidden="true">
                        <FlagIcon code={selectedCity.countryCode} size={18} />
                    </span>
                ) : (
                    <span className="select-icon" aria-hidden="true">🏟️</span>
                )}
                <select
                    id="city-select"
                    value={selectedCity?.id || ''}
                    onChange={handleChange}
                    className="city-select"
                    aria-expanded={!!selectedCity}
                >
                    <option value="">CITY</option>
                    {sortedCountries.map(country => (
                        <optgroup key={country} label={country}>
                            {groupedCities[country]
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map(city => (
                                    <option key={city.id} value={city.id}>
                                        {city.name}
                                    </option>
                                ))}
                        </optgroup>
                    ))}
                </select>
            </div>
        </div>
    );
}
