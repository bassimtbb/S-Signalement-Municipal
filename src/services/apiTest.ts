import { submitIncident } from './api';

const testAPI = async () => {
  const result = await submitIncident({
    description: 'Test Incident',
    photoUri: 'https://example.com/photo.jpg',
    location: { latitude: 48.8566, longitude: 2.3522 },
    timestamp: Date.now(),
  });

  console.log('Résultat API :', result);
};

testAPI();