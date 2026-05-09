import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import useAuthStore from '../store/useAuthStore';

export default function LibraryScreen({ navigation }) {
  const { user } = useAuthStore();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Listen to user data for XP/level
    const userUnsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) setUserData(snap.data());
    });

    // Listen to decks
    const q = query(collection(db, 'decks'), where('userId', '==', user.uid));
    const deckUnsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setDecks(data);
      setLoading(false);
    });

    return () => { userUnsub(); deckUnsub(); };
  }, []);

  const handleDeleteDeck = (deckId, deckTitle) => {
    Alert.alert(
      'Delete Deck',
      `Are you sure you want to delete "${deckTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDoc(doc(db, 'decks', deckId));
          },
        },
      ]
    );
  };

  const xp = userData?.xp || 0;
  const level = userData?.level || 1;
  const xpProgress = xp % 100;
  const xpPercent = Math.round((xpProgress / 100) * 100);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading your library...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Hello, {userData?.name?.split(' ')[0] || 'Student'}! 👋</Text>
          <Text style={styles.subtitle}>Ready to study?</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>⭐ Lv.{level}</Text>
        </View>
      </View>

      {/* XP Bar */}
      <View style={styles.xpSection}>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>XP</Text>
          <Text style={styles.xpValue}>{xpProgress}/100</Text>
        </View>
        <View style={styles.xpBarWrap}>
          <View style={[styles.xpBarFill, { width: `${xpPercent}%` }]} />
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{decks.length}</Text>
          <Text style={styles.statLabel}>Decks</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>
            {decks.reduce((acc, d) => acc + (d.cardCount || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Cards</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{xp}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>My Decks</Text>

      {decks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>No decks yet!</Text>
          <Text style={styles.emptySubText}>
            Create your first deck to start studying.
          </Text>
        </View>
      ) : (
        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.deckCard}
              onPress={() => navigation.navigate('DeckDetail', {
                deckId: item.id,
                deckTitle: item.title,
              })}
            >
              <View style={styles.deckLeft}>
                <View style={styles.deckIconBox}>
                  <Text style={styles.deckIcon}>🗂</Text>
                </View>
                <View>
                  <Text style={styles.deckTitle}>{item.title}</Text>
                  <Text style={styles.deckSub}>{item.cardCount || 0} cards</Text>
                </View>
              </View>
              <View style={styles.deckRight}>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteDeck(item.id, item.title)}
                >
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
                <Text style={styles.deckArrow}>›</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => navigation.navigate('CreateDeck')}
      >
        <Text style={styles.createBtnText}>+ Create New Deck</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FF',
    padding: 24,
    paddingTop: 60,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F7FF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E1B4B',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  levelBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  xpSection: {
    marginBottom: 20,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  xpValue: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
  },
  xpBarWrap: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNum: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E1B4B',
    marginBottom: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  deckCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deckLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  deckIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckIcon: {
    fontSize: 20,
  },
  deckTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  deckSub: {
    fontSize: 13,
    color: '#6B7280',
  },
  deckRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    padding: 6,
  },
  deleteBtnText: {
    fontSize: 16,
  },
  deckArrow: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  createBtn: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});