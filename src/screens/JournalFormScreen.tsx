import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import * as Calendar from 'expo-calendar';

import CameraCapture from '../components/CameraCapture';
import LocationMap from '../components/LocationMap';
import { Coordinates } from '../types';
import { submitIncident } from '../services/api';

const JournalFormScreen = () => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!photoUri || !location) {
      Alert.alert('Erreur', 'Veuillez ajouter une photo et votre position.');
      return;
    }

    setLoading(true);

    try {
      const incidentData = {
        photoUri,
        location,
        description,
        timestamp: Date.now(),
      };

      const response = await submitIncident(incidentData);

      if (!response.success) {
        Alert.alert('Erreur API', response.error || 'Erreur inconnue');
        setLoading(false);
        return;
      }

      console.log('ID serveur :', response.data?.id);

      // Ajout dans le calendrier si permissions ok
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
            title: '🔧 Suivi Intervention',
            startDate: new Date(),
            endDate: new Date(Date.now() + 60 * 60 * 1000), // +1h
            location: `${location.latitude}, ${location.longitude}`,
            notes: description,
          });
          Alert.alert('Agenda', 'Suivi ajouté au calendrier.');
        }
      }

      Alert.alert('Succès', 'Signalement envoyé avec succès !');

      // Reset formulaire
      setPhotoUri(null);
      setLocation(null);
      setDescription('');
    } catch (error: any) {
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
        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.preview} />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => setPhotoUri(null)}
            >
              <Text style={styles.retakeText}>Reprendre la photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraCapture onPictureTaken={setPhotoUri} />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>2. Localisation</Text>
        <View style={styles.mapContainer}>
          <LocationMap onLocationFix={setLocation} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>3. Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Décrivez l'incident..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
        disabled={!isFormValid || loading}
        onPress={handleSubmit}
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
  container: { flex: 1, 
    backgroundColor: '#fff' },
  content: { padding: 20,
     paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  section: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#444' },
  mapContainer: { height: 200, borderRadius: 16, overflow: 'hidden', backgroundColor: '#f5f5f5' },
  cameraContainer: { height: 300, borderRadius: 16, overflow: 'hidden', backgroundColor: '#f5f5f5' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitButtonDisabled: { backgroundColor: '#b0c4de' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  previewContainer: { height: 300, borderRadius: 16, overflow: 'hidden' },
  preview: { flex: 1, resizeMode: 'cover', borderRadius: 16 },
  retakeButton: { position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  retakeText: { color: '#fff', fontWeight: 'bold' },
});

export default JournalFormScreen;