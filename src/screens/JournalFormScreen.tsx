import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import CameraCapture from '../components/CameraCapture';
import LocationMap from '../components/LocationMap';
import { Coordinates } from '../types';
import { submitIncident } from '../services/api';

const JournalFormScreen = () => {
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!photoUri || !location) return;

    setLoading(true);
    try {
      const incidentData = {
        description,
        photoUri,
        location,
        timestamp: Date.now(),
      };

      const response = await submitIncident(incidentData);

      if (response.success) {
        Alert.alert('Succès', 'Signalement envoyé avec succès (201).', [{ text: 'OK' }]);

        // Ajout au calendrier
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status === 'granted') {
          const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
          let targetCalendar = calendars.find(c => c.isPrimary) || calendars[0];
          
          if (Platform.OS === 'ios') {
             try {
               const defaultCalendar = await Calendar.getDefaultCalendarAsync();
               targetCalendar = defaultCalendar || targetCalendar;
             } catch (e) {
               console.log("Impossible d'obtenir le calendrier par défaut iOS", e);
             }
          }

          if (targetCalendar) {
            await Calendar.createEventAsync(targetCalendar.id, {
              title: 'Suivi Intervention',
              startDate: new Date(),
              endDate: new Date(Date.now() + 60 * 60 * 1000), // +1 heure
              location: `${location.latitude}, ${location.longitude}`,
              notes: description,
            });
            Alert.alert('Agenda', 'Suivi ajouté au calendrier.');
          }
        }
        
        // Reset formulaire
        setDescription('');
      } else {
        Alert.alert('Erreur', response.error || 'Erreur inconnue');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de soumettre le signalement');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = photoUri && location;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nouveau Signalement</Text>

      <View style={styles.section}>
        <Text style={styles.label}>1. Preuve photographique</Text>
        <View style={styles.cameraContainer}>
          <CameraCapture onPictureTaken={(uri) => setPhotoUri(uri)} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>2. Localisation</Text>
        <View style={styles.mapContainer}>
          <LocationMap onLocationFix={(coords) => setLocation(coords)} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>3. Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Décrivez l'incident détaillé..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!isFormValid || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Envoyer le signalement</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  cameraContainer: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#b0c4de',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default JournalFormScreen;
