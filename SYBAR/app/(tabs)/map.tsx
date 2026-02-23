import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import { Search } from 'lucide-react-native';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={{
          latitude: 3.140853, 
          longitude: 101.693207,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />

      <View className="absolute top-16 left-6 right-6 bg-white flex-row items-center px-5 py-4 rounded-full shadow-lg border border-gray-100">
        <Search color="#FF7A00" size={22} />
        <TextInput 
          placeholder="Where are we routing today?" 
          className="flex-1 ml-3 text-base text-[#412048]"
          placeholderTextColor="#A0A0A0"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
});