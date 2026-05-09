import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import useAuthStore from '../store/useAuthStore';

export default function CreateDeckScreen({ navigation }) {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateDeck = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a deck name');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'decks'), {
        title: title.trim(),
        userId: user.uid,
        cardCount: 0,
        createdAt: new Date(),
      });
      Alert.alert('Success', 'Deck created!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create New Deck</Text>
      <Text style={styles.subtitle}>Give your deck a name</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Biology 101, Math Formulas..."
        value={title}
        onChangeText={setTitle}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateDeck}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Deck</Text>
        )}
      </TouchableOpacity>
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
  back: {
    fontSize: 16,
    color: '#4F46E5',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});