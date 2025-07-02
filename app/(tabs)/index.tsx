import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Linking,
  StatusBar,
  TextInput,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES = ['general', 'technology', 'sports', 'business', 'science', 'health'];
const NEWS_API_KEY = '04713b9e088c40ad9fee47bf50f925d8';

export default function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [category, setCategory] = useState('general');
  const [showingFavorites, setShowingFavorites] = useState(false);
  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    fetchNews();
    loadFavorites();
  }, []);

  const fetchNews = async (selectedCategory = category) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&category=${selectedCategory}&apiKey=${NEWS_API_KEY}`
      );
      const json = await response.json();
      if (json.status === 'ok') {
        const sorted = json.articles.sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        setArticles(sorted);
        filterArticles(search, showingFavorites, sorted, favorites);
      }
    } catch {
      setFilteredArticles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFavorites = async () => {
    const stored = await AsyncStorage.getItem('favorites');
    if (stored) setFavorites(JSON.parse(stored));
  };

  const saveFavorites = async (favs) => {
    await AsyncStorage.setItem('favorites', JSON.stringify(favs));
  };

  const handleSearch = (text) => {
    setSearch(text);
    filterArticles(text, showingFavorites, articles, favorites);
  };

  const filterArticles = (text, onlyFavs, base = articles, favs = favorites) => {
    let result = base;
    if (onlyFavs) result = result.filter(item => favs.includes(item.url));
    if (text) result = result.filter(item => item.title?.toLowerCase().includes(text.toLowerCase()));
    setFilteredArticles(result);
  };

  const toggleFavorite = async (url) => {
    const updated = favorites.includes(url)
      ? favorites.filter(fav => fav !== url)
      : [...favorites, url];
    setFavorites(updated);
    await saveFavorites(updated);
    filterArticles(search, showingFavorites, articles, updated);
  };

  const renderItem = ({ item, index }) => (
    <Animatable.View animation="fadeInUp" delay={index * 60} useNativeDriver>
      <TouchableOpacity
        style={[styles.card, isDark && styles.cardDark]}
        onPress={() => Linking.openURL(item.url)}
      >
        {item.urlToImage && (
          <Image source={{ uri: item.urlToImage }} style={styles.image} />
        )}
        <View style={styles.content}>
          <Text style={[styles.title, isDark && styles.textDark]}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={[styles.description, isDark && styles.textDark]}>
              {item.description}
            </Text>
          )}
          <View style={styles.footer}>
            <Text style={styles.source}>{item.source.name}</Text>
            <TouchableOpacity onPress={() => toggleFavorite(item.url)}>
              <Icon
                name={favorites.includes(item.url) ? 'heart' : 'heart-outline'}
                size={22}
                color={favorites.includes(item.url) ? '#e74c3c' : '#888'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.headerContainer}>
        <Text style={[styles.header, isDark && styles.textLight]}>📰 Today's Highlights</Text>

        <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
          <Icon name="search-outline" size={20} color={isDark ? '#ccc' : '#666'} />
          <TextInput
            style={[styles.searchInput, isDark && styles.searchInputDark]}
            placeholder="Search articles..."
            placeholderTextColor={isDark ? '#aaa' : '#666'}
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setCategory(item);
                fetchNews(item);
              }}
              style={[
                styles.categoryButton,
                isDark && styles.categoryButtonDark,
                category === item && styles.categoryButtonActive,
                category === item && isDark && styles.categoryButtonActiveDark,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  isDark && styles.categoryTextDark,
                  category === item && styles.categoryTextActive,
                ]}
              >
                {item.toUpperCase()}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Botão de favoritos mais para baixo */}
        <TouchableOpacity
          onPress={() => {
            setShowingFavorites(!showingFavorites);
            filterArticles(search, !showingFavorites, articles, favorites);
          }}
          style={[styles.favButton, isDark && styles.favButtonDark, showingFavorites && styles.favButtonActive, showingFavorites && isDark && styles.favButtonActiveDark,]}
        >
        <Icon
          name={showingFavorites ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color={
            showingFavorites
              ? '#fff'
              : isDark
              ? '#ccc'
              : '#007aff'
          }
        />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007aff" />
          <Text style={{ marginTop: 8, color: isDark ? '#ccc' : '#444' }}>Loading...</Text>
        </View>
      ) : filteredArticles.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: isDark ? '#ccc' : '#333' }}>No articles found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          keyExtractor={(item, index) => item.url + index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNews();
              }}
              colors={['#007aff']}
              tintColor={isDark ? '#fff' : '#000'}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f4f6' },
  containerDark: { backgroundColor: '#1c1c1e' },
  headerContainer: { padding: 16, paddingTop: 28 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 12, color: '#222' },
  textDark: { color: '#eee' },
  textLight: { color: '#fff' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 16,
    backgroundColor: '#ececec',
  },
  searchBarDark: {
    backgroundColor: '#2a2a2c',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    marginLeft: 8,
    color: '#333',
  },
  searchInputDark: {
    color: '#fff',
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ddd',
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonDark: {
    backgroundColor: '#3a3a3c'
  },
  categoryButtonActive: {
    backgroundColor: '#007aff',
  },
  categoryButtonActiveDark: {
  backgroundColor: '#0a84ff',
  },
  categoryText: { fontSize: 12, color: '#333' },
  categoryTextDark: { color: '#eee' },
  categoryTextActive: { color: '#fff', fontWeight: 'bold' },
  favButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 30,
    borderColor: '#007aff',
    borderWidth: 1,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  favButtonDark: {
    backgroundColor: '#3a3a3c',
    borderColor: '#0a84ff'
  },
  favButtonActive: {
    backgroundColor: '#007aff',
  },
  favButtonActiveDark: {
    backgroundColor: '#0a84ff'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 5,
  },
  cardDark: { backgroundColor: '#2c2c2e' },
  image: { width: '100%', height: 180 },
  content: { padding: 14 },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  description: { color: '#555', fontSize: 14 },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: { fontSize: 12, color: '#777' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
