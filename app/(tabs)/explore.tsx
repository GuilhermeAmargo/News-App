import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function About() {
  const isDark = useColorScheme() === 'dark';

  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isDark && styles.containerDark,
      ]}
    >
      <View style={[styles.card, isDark && styles.cardDark]}>
        <Text style={[styles.title, isDark && styles.textLight]}>
          About this App
        </Text>

        <Text style={[styles.text, isDark && styles.textLight]}>
          This app was developed to provide the latest news across various categories such as technology, sports, business, and science.
        </Text>

        <View style={styles.section}>
          <Text style={[styles.subtitle, isDark && styles.textLight]}>
            Features
          </Text>
          <Text style={[styles.text, isDark && styles.textLight]}>
            • Browse news by category{'\n'}
            • Search and save favorites{'\n'}
            • Automatic light and dark mode{'\n'}
            • Real-time updates
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.subtitle, isDark && styles.textLight]}>
            Technologies Used
          </Text>
          <Text style={[styles.text, isDark && styles.textLight]}>
            • React Native{'\n'}
            • NewsAPI.org{'\n'}
            • AsyncStorage for favorites{'\n'}
            • react-native-animatable for animations
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.subtitle, isDark && styles.textLight]}>
            Developer
          </Text>
          <Text style={[styles.text, isDark && styles.textLight]}>
            Guilherme Camargo
          </Text>
        </View>


      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 15,
    elevation: 10,
  },
  cardDark: {
    backgroundColor: '#1f1f1f',
    shadowOpacity: 0.25,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 20,
    color: '#222',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    color: '#007aff',
  },
  text: {
    fontSize: 16,
    lineHeight: 26,
    color: '#444',
  },
  textLight: {
    color: '#ddd',
  },
  section: {
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffd54f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 30,
    alignSelf: 'center',
    shadowColor: '#ffaa00',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
  },
  buttonDark: {
    backgroundColor: '#ffaa00',
    shadowColor: '#cc8800',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  version: {
    marginTop: 40,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
