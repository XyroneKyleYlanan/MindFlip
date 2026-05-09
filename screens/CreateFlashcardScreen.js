import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function CreateFlashcardScreen({ navigation, route }) {
  const { deckId, deckTitle } = route.params;
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert('Error', 'Please fill in both question and answer');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'flashcards'), {
        deckId: deckId,
        question: question.trim(),
        answer: answer.trim(),
        isMastered: false,
        createdAt: new Date(),
      });
      await updateDoc(doc(db, 'decks', deckId), {
        cardCount: increment(1),
      });
      Alert.alert('Success', 'Flashcard saved!', [
        { text: 'Add Another', onPress: () => { setQuestion(''); setAnswer(''); } },
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>New Flashcard</Text>
      <Text style={styles.subtitle}>Deck: {deckTitle}</Text>

      <Text style={styles.label}>Question</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Type your question here..."
        value={question}
        onChangeText={setQuestion}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Answer</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Type the answer here..."
        value={answer}
        onChangeText={setAnswer}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>💾 Save Flashcard</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
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
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  textArea: {
    height: 120,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});