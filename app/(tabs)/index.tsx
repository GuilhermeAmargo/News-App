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

const CATEGORIES = ['general', 'technology', 'sports', 'business', 'science'];
const NEWS_API_KEY = '04713b9e088c40ad9fee47bf50f925d8';

export default function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [category, setCategory] = useState('general');
  const [showingFavorites, setShowingFavorites] = useState(false);

  const isDark = useColorScheme() === 'dark';

  const fetchNews = async (selectedCategory = category) => {
    setLoading(true);
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${selectedCategory}&apiKey=${NEWS_API_KEY}`;
    try {
      const response = await fetch(url);
      const json = await response.json();
      if (json.status === 'ok' && json.articles) {
        const sorted = json.articles.sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        setArticles(sorted);
        filterArticles(search, showingFavorites, sorted, favorites);
      } else {
        setError('No news found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch news.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFavorites = async () => {
    const stored = await AsyncStorage.getItem('favorites');
    if (stored) setFavorites(JSON.parse(stored));
  };

  const saveFavorites = async (newFavs) => {
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  const handleSearch = (text) => {
    setSearch(text);
    filterArticles(text, showingFavorites, articles, favorites);
  };

  const filterArticles = (
    searchText,
    onlyFavorites,
    baseArticles = articles,
    favList = favorites
  ) => {
    let data = baseArticles;

    if (onlyFavorites) {
      data = data.filter(item => favList.includes(item.url));
    }

    if (searchText) {
      data = data.filter(item =>
        item.title?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredArticles(data);
  };

  const toggleFavorite = async (url) => {
    const updated = favorites.includes(url)
      ? favorites.filter(fav => fav !== url)
      : [...favorites, url];
    setFavorites(updated);
    await saveFavorites(updated);
    filterArticles(search, showingFavorites, articles, updated);
  };

  const onCategoryChange = async (cat) => {
    setCategory(cat);
    setSearch('');
    await fetchNews(cat);
  };

  const toggleFavoritesView = () => {
    const newState = !showingFavorites;
    setShowingFavorites(newState);
    filterArticles(search, newState, articles, favorites);
  };

  useEffect(() => {
    fetchNews();
    loadFavorites();
  }, []);

  const renderItem = ({ item, index }) => (
    <Animatable.View animation="fadeInUp" delay={index * 80} useNativeDriver>
      <TouchableOpacity
        style={[styles.card, isDark && styles.cardDark]}
        onPress={() => Linking.openURL(item.url)}
        activeOpacity={0.8}
      >
        {item.urlToImage && (
          <Image source={{ uri: item.urlToImage }} style={styles.image} />
        )}
        <View style={styles.content}>
          <Text style={[styles.title, isDark && styles.textDark]}>{item.title}</Text>
          {item.description && (
            <Text style={[styles.description, isDark && styles.textDark]}>
              {item.description}
            </Text>
          )}
          <View style={styles.footer}>
            <Text style={styles.source}>Fonte: {item.source.name}</Text>
            <TouchableOpacity onPress={() => toggleFavorite(item.url)}>
              <Icon
                name={favorites.includes(item.url) ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={favorites.includes(item.url) ? '#f39c12' : '#888'}
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
        <Text style={[styles.header, isDark && styles.textLight]}>
          📰 Latest News
        </Text>

        <View style={styles.categoryContainer}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => onCategoryChange(cat)}
              style={[
                styles.categoryButton,
                cat === category && styles.categoryButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  cat === category && styles.categoryTextActive,
                ]}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Botão de Favoritos com estilo exclusivo */}
          <TouchableOpacity
            onPress={toggleFavoritesView}
            style={[
              styles.favoritesButton,
              showingFavorites && styles.favoritesButtonActive,
            ]}
          >
            <Text
              style={[
                styles.favoritesText,
                showingFavorites && styles.favoritesTextActive,
              ]}
            >
              ⭐ Favorites
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.searchInput, isDark && styles.searchInputDark]}
          placeholder="Search news..."
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007aff" />
          <Text style={{ marginTop: 8, color: '#555' }}>Loading...</Text>
        </View>
      ) : filteredArticles.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: isDark ? '#ccc' : '#333' }}>
            No news found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          keyExtractor={(item, index) => item.url + index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
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
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9' 
  },
  containerDark: { 
    backgroundColor: '#1c1c1e' 
  },
  headerContainer: { 
    paddingTop: 16, 
    paddingHorizontal: 16 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 12, 
    color: '#333' 
  },
  categoryContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: 12 
  },
  categoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: { 
    backgroundColor: '#007aff' 
  },
  categoryText: { 
    fontSize: 12, 
    color: '#333' 
  },
  categoryTextActive: { 
    color: '#fff' 
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 12,
    color: '#000',
  },
  favoritesButton: { 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    backgroundColor: '#FEFDE0', 
    borderRadius: 12, 
    marginRight: 8, 
    marginBottom: 8, 
    borderWidth: 1, 
    borderColor: '#e5c100' 
  },
  favoritesButtonActive: { 
    backgroundColor: '#ffa500', 
    borderColor: '#e59400' 
  },
  favoritesText: { 
    fontSize: 12, 
    color: '#333', 
    fontWeight: 'bold' 
  },
  favoritesTextActive: { 
    color: '#fff' 
  },
  searchInputDark: { 
    backgroundColor: '#3a3a3c', 
    color: '#fff' 
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  cardDark: { 
    backgroundColor: '#2c2c2e' 
  },
  image: { 
    height: 180, 
    width: '100%' 
  },
  content: { 
    padding: 12 
  },
  title: { 
    fontWeight: 'bold', 
    fontSize: 16, 
    marginBottom: 6, 
    color: '#222' 
  },
  description: { 
    color: '#555', 
    fontSize: 14, 
    marginBottom: 8 
  },
  source: { 
    fontSize: 12, 
    color: '#888', 
    fontStyle: 'italic'
  },
  textDark: { 
    color: '#eee' 
  },
  textLight: { 
    color: '#fff' 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});