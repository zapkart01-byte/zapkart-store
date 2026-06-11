import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

/**
 * Full-screen modal map location picker component
 * Uses expo-location for location services
 * 
 * Note: For production, integrate with a map library like:
 * - @rnmapbox/maps (Mapbox)
 * - react-native-maps (Google/Apple Maps)
 * - @maplibre/maplibre-react-native (MapLibre)
 * 
 * @param {Object} props
 * @param {boolean} props.visible - Whether modal is visible
 * @param {function} props.onClose - Callback when modal is closed
 * @param {function} props.onLocationConfirm - Callback when location is confirmed (lat, lng, address)
 * @param {Object} props.initialLocation - Initial location {latitude, longitude}
 */
export default function MapLocationPicker({
  visible = false,
  onClose,
  onLocationConfirm,
  initialLocation = null,
}) {
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');

  /**
   * Request location permissions on mount
   */
  useEffect(() => {
    if (visible) {
      requestLocationPermission();
    }
  }, [visible]);

  /**
   * Request and check location permissions
   */
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        getCurrentLocation();
      } else {
        Alert.alert(
          'Permission Required',
          'Location permission is required to pin your store on the map.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  /**
   * Get current device location
   */
  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(coords);
      await reverseGeocode(coords.latitude, coords.longitude);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Convert coordinates to address
   */
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result && result.length > 0) {
        const location = result[0];
        const addressString = [
          location.name,
          location.street,
          location.district,
          location.city,
          location.region,
          location.postalCode,
        ]
          .filter(Boolean)
          .join(', ');

        setAddress(addressString || 'Location pinned');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setAddress('Location pinned');
    }
  };

  /**
   * Handle location confirmation
   */
  const handleConfirmLocation = () => {
    if (currentLocation && onLocationConfirm) {
      onLocationConfirm(
        currentLocation.latitude,
        currentLocation.longitude,
        address
      );
    }
    onClose();
  };

  /**
   * Handle map press/drag (simulated for now)
   * In a real implementation, this would update based on map interaction
   */
  const handleMapPress = async (latitude, longitude) => {
    setCurrentLocation({ latitude, longitude });
    await reverseGeocode(latitude, longitude);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color="#0D0D0D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pin Store Location</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Map Container (Placeholder) */}
        <View style={styles.mapContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B00" />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          ) : permissionStatus !== 'granted' ? (
            <View style={styles.permissionContainer}>
              <Ionicons name="location-outline" size={64} color="#6B7280" />
              <Text style={styles.permissionTitle}>Location Access Required</Text>
              <Text style={styles.permissionText}>
                We need your permission to access your location to pin your store on the map.
              </Text>
              <TouchableOpacity
                onPress={requestLocationPermission}
                style={styles.permissionButton}
              >
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Placeholder Map View */}
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map" size={48} color="#FF6B00" />
                <Text style={styles.placeholderText}>
                  Map View Placeholder
                </Text>
                <Text style={styles.placeholderSubtext}>
                  Integrate with react-native-maps or MapLibre
                </Text>
                
                {currentLocation && (
                  <View style={styles.coordinatesBox}>
                    <Text style={styles.coordinatesText}>
                      📍 Lat: {currentLocation.latitude.toFixed(6)}
                    </Text>
                    <Text style={styles.coordinatesText}>
                      Lng: {currentLocation.longitude.toFixed(6)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Center Pin Indicator */}
              <View style={styles.pinContainer}>
                <Ionicons name="location-sharp" size={48} color="#FF6B00" />
              </View>

              {/* Recenter Button */}
              <TouchableOpacity
                onPress={getCurrentLocation}
                style={styles.recenterButton}
                activeOpacity={0.8}
              >
                <Ionicons name="navigate" size={24} color="#FF6B00" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Bottom Card with Address */}
        {currentLocation && permissionStatus === 'granted' && (
          <View style={styles.bottomCard}>
            {/* Address Info */}
            <View style={styles.addressContainer}>
              <View style={styles.addressHeader}>
                <Ionicons name="location" size={20} color="#FF6B00" />
                <Text style={styles.addressTitle}>Store Location</Text>
              </View>
              <Text style={styles.addressText} numberOfLines={2}>
                {address || 'Fetching address...'}
              </Text>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={handleConfirmLocation}
              style={styles.confirmButton}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirm Location</Text>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Helper Text */}
            <Text style={styles.helperText}>
              Drag the map to adjust the pin location
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D0D0D',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9ECEF',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D0D0D',
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  coordinatesBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  coordinatesText: {
    fontSize: 14,
    color: '#0D0D0D',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  pinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -48,
    zIndex: 10,
  },
  recenterButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 16,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F8F9FA',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0D0D0D',
    marginTop: 16,
  },
  permissionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  permissionButton: {
    marginTop: 24,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D0D0D',
    marginLeft: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: '#FF6B00',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
});
