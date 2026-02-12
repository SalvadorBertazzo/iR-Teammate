// Catalogs API functions
import { get } from './client.js';
import { setCatalogs, getCatalogs, setRelationships, getRelationships } from '../state.js';

export async function loadCatalogs() {
    const current = getCatalogs();
    if (current.loaded) {
        return current;
    }

    try {
        const [series, carClasses, cars, events, tracks, languages] = await Promise.all([
            get('/catalogs/series'),
            get('/catalogs/car-classes'),
            get('/catalogs/cars'),
            get('/catalogs/events'),
            get('/catalogs/tracks'),
            get('/catalogs/languages')
        ]);

        const catalogs = {
            series: series || [],
            carClasses: carClasses || [],
            cars: cars || [],
            events: events || [],
            tracks: tracks || [],
            languages: languages || []
        };

        setCatalogs(catalogs);
        return catalogs;
    } catch (error) {
        console.error('Failed to load catalogs:', error);
        throw error;
    }
}

export async function loadRelationships() {
    const current = getRelationships();
    if (current.loaded) {
        return current;
    }

    try {
        const data = await get('/catalogs/relationships');
        const relationships = {
            series_categories: data.series_categories || [],
            series_car_classes: data.series_car_classes || [],
            car_class_cars: data.car_class_cars || []
        };
        setRelationships(relationships);
        return relationships;
    } catch (error) {
        console.error('Failed to load relationships:', error);
        throw error;
    }
}

export function getSeries() {
    return getCatalogs().series;
}

export function getCarClasses() {
    return getCatalogs().carClasses;
}

export function getCars() {
    return getCatalogs().cars;
}

export function getEvents() {
    return getCatalogs().events;
}

export function getTracks() {
    return getCatalogs().tracks;
}

export function getLanguages() {
    return getCatalogs().languages;
}

// Find helpers
export function findSeries(id) {
    return getSeries().find(s => s.id === id);
}

export function findCarClass(id) {
    return getCarClasses().find(c => c.id === id);
}

export function findCar(id) {
    return getCars().find(c => c.id === id);
}

export function findEvent(id) {
    return getEvents().find(e => e.id === id);
}

export function findTrack(id) {
    return getTracks().find(t => t.id === id);
}

export function findLanguage(code) {
    return getLanguages().find(l => l.code === code);
}
