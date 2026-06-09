'use client';
import { useMemo, memo } from 'react';
import { City } from '@/types';
import FlagIcon from './FlagIcon';
import DropdownSelect from './DropdownSelect';

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

const CitySelector = memo(function CitySelector({ cities, selectedCity, onSelect }: CitySelectorProps) {
    const groupedCities = useMemo(() => groupByCountry(cities), [cities]);
    const sortedCountries = useMemo(() => countryOrder.filter(c => groupedCities[c]), [groupedCities]);
    const dropdownGroups = useMemo(() => (
        sortedCountries.map(country => ({
            label: country,
            items: [...groupedCities[country]]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(city => ({
                    value: city.id,
                    label: city.name,
                })),
        }))
    ), [groupedCities, sortedCountries]);

    const handleSelect = (value: string | null) => {
        if (value === null) {
            onSelect(null);
            return;
        }

        const city = cities.find(c => c.id === value);
        onSelect(city || null);
    };

    return (
        <div className="city-selector" role="search">
            <label htmlFor="city-select" className="visually-hidden">
                Select city
            </label>
            <DropdownSelect
                id="city-select"
                ariaLabel="Select city"
                wrapperClassName="city-select-wrapper"
                selectClassName="city-select"
                placeholder="CITY"
                selectedValue={selectedCity?.id || null}
                groups={dropdownGroups}
                icon={selectedCity ? (
                    <span className="select-flag" aria-hidden="true">
                        <FlagIcon code={selectedCity.countryCode} size={18} />
                    </span>
                ) : (
                    <span className="select-icon" aria-hidden="true">🏟️</span>
                )}
                onSelect={handleSelect}
            />
        </div>
    );
});

export default CitySelector;
