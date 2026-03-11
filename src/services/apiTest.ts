import { submitIncident } from './api.js';
import { Incident } from '../types';

const testIncident: Incident = {
  description: 'Test signalement',
  photoUri: 'https://via.placeholder.com/150', 
  location: { latitude: 48.8566, longitude: 2.3522 }, 
  timestamp: Date.now(),
};

async function runTest() {
  console.log('Envoi du signalement test...');
  const response = await submitIncident(testIncident);
  console.log('Résultat :', response);
}

runTest();