import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function DeckDetailScreen({ navigation, route }) {
  const { deckId, deckTitle } = route.params;
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMasteredOnly, setShowMasteredOnly] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'flashcards'), where('deckId', '==', deckId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFlashcards(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleDelete = (cardId) => {
    Alert.alert('Delete Card', 'Are you sure you want to delete this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'flashcards', cardId));
        },
      },
    ]);
  };

  const handleToggleMastered = async (card) => {
    await updateDoc(doc(db, 'flashcards', card.id), {
      isMastered: !card.isMastered,
    });
  };

  const filteredCards = showMasteredOnly
    ? flashcards.filter((c) => c.isMastered)
    : flashcards;

  const masteredCount = flashcards.filter((c) => c.isMastered).length;
  const masteredPercent = flashcards.length > 0
    ? Math.round((masteredCount / flashcards.length) * 100)
    : 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{deckTitle}</Text>
      <Text style={styles.subtitle}>{flashcards.length} cards · {masteredCount} mastered</Text>

      {/* Mastery Progress Bar */}
      {flashcards.length > 0 && (
        <View style={styles.masterySection}>
          <View style={styles.masteryRow}>
            <Text style={styles.masteryLabel}>Mastery Progress</Text>
            <Text style={styles.masteryPercent}>{masteredPercent}%</Text>
          </View>
          <View style={styles.progressBarWrap}>
            <View style={[styles.progressBarFill, { width: `${masteredPercent}%` }]} />
          </View>
        </View>
      )}

      {/* Filter Toggle */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>⭐ Show Mastered Only</Text>
        <Switch
          value={showMasteredOnly}
          onValueChange={setShowMasteredOnly}
          trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
          thumbColor={showMasteredOnly ? '#fff' : '#fff'}
        />
      </View>

      {filteredCards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {showMasteredOnly ? 'No mastered cards yet!' : 'No cards yet!'}
          </Text>
          <Text style={styles.emptySubText}>
            {showMasteredOnly
              ? 'Mark cards as mastered during your study session.'
              : 'Tap the button below to add your first card.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, item.isMastered && styles.masteredCard]}>
              <View style={styles.cardInfo}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardQuestion}>{item.question}</Text>
                  {item.isMastered && (
                    <Text style={styles.masteredBadge}>⭐</Text>
                  )}
                </View>
                <Text style={styles.cardAnswer}>{item.answer}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[
                    styles.masterBtn,
                    item.isMastered && styles.masterBtnActive,
                  ]}
                  onPress={() => handleToggleMastered(item)}
                >
                  <Text style={[
                    styles.masterBtnText,
                    item.isMastered && styles.masterBtnTextActive,
                  ]}>
                    {item.isMastered ? '★ Mastered' : '☆ Master'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate('EditFlashcard', { card: item })}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.deleteBtnText}>Del</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.bottomBtns}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateFlashcard', { deckId, deckTitle })}
        >
          <Text style={styles.addBtnText}>+ Add Card</Text>
        </TouchableOpacity>

        {flashcards.length > 0 && (
          <>
            <TouchableOpacity
              style={styles.quizBtn}
              onPress={() => navigation.navigate('Quiz', { deckId, deckTitle, flashcards })}
            >
              <Text style={styles.quizBtnText}>▶ Quiz</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timerBtn}
              onPress={() => navigation.navigate('Timer', { deckId, deckTitle, flashcards })}
            >
              <Text style={styles.timerBtnText}>⏱ Timer</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    fontSize: 16,
    color: '#4F46E5',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  masterySection: {
    marginBottom: 16,
  },
  masteryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  masteryLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  masteryPercent: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '700',
  },
  progressBarWrap: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F3FF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  masteredCard: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  cardInfo: { marginBottom: 10 },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  masteredBadge: {
    fontSize: 16,
    marginLeft: 8,
  },
  cardAnswer: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  masterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  masterBtnActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6',
  },
  masterBtnText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  masterBtnTextActive: {
    color: '#8B5CF6',
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  editBtnText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomBtns: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#4F46E5',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  quizBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  quizBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  timerBtn: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  timerBtnText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: 'bold',
  },
});