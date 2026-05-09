import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
//import { collection, addDoc } from 'firebase/firestore';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import useAuthStore from '../store/useAuthStore';

export default function QuizScreen({ navigation, route }) {
  const { deckId, deckTitle, flashcards } = route.params;
  const { user } = useAuthStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentCard = flashcards[currentIndex];
  const total = flashcards.length;
  const progress = ((currentIndex) / total) * 100;

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleAnswer = async (isCorrect) => {
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    if (currentIndex + 1 >= total) {
      // Quiz finished — save session
      try {
        await addDoc(collection(db, 'sessions'), {
          userId: user.uid,
          deckId: deckId,
          deckTitle: deckTitle,
          score: newScore,
          totalCards: total,
          mode: 'quiz',
          date: new Date(),
        });
        const xpEarned = newScore * 10;
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentXP = userSnap.data().xp || 0;
          const newXP = currentXP + xpEarned;
          const newLevel = Math.floor(newXP / 100) + 1;
          await updateDoc(userRef, { xp: newXP, level: newLevel });
        }
      } catch (e) {
        console.log('Session save error:', e);
      }

      setFinished(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setIsRevealed(false);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setIsRevealed(false);
    setScore(0);
    setFinished(false);
  };

  // ── RESULTS SCREEN ──
  if (finished) {
    const percentage = Math.round((score / total) * 100);
    return (
      <View style={styles.container}>
        <Text style={styles.resultEmoji}>🎉</Text>
        <Text style={styles.resultTitle}>Quiz Complete!</Text>
        <Text style={styles.resultDeck}>{deckTitle}</Text>

        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNum}>{score}/{total}</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>

        <View style={styles.progressBarWrap}>
          <View style={[styles.progressBarFill, {
            width: `${percentage}%`,
            backgroundColor: percentage >= 70 ? '#10B981' : '#EF4444'
          }]} />
        </View>
        <Text style={styles.percentText}>{percentage}% Accuracy</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{score}</Text>
            <Text style={styles.statLabel}>✅ Correct</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{total - score}</Text>
            <Text style={styles.statLabel}>✗ Incorrect</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
          <Text style={styles.retryBtnText}>Retry Quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Back to Deck</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── QUIZ SCREEN ──
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.exitText}>✕ Exit</Text>
        </TouchableOpacity>
        <Text style={styles.cardCount}>Card {currentIndex + 1} of {total}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarWrap}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      {/* Flashcard */}
      <View style={styles.card}>
        <Text style={styles.cardTypeLabel}>
          {isRevealed ? '✅ Answer' : '❓ Question'}
        </Text>
        <Text style={styles.cardText}>
          {isRevealed ? currentCard.answer : currentCard.question}
        </Text>
        {isRevealed && (
          <Text style={styles.cardQuestionSmall}>Q: {currentCard.question}</Text>
        )}
      </View>

      {/* Buttons */}
      {!isRevealed ? (
        <TouchableOpacity style={styles.revealBtn} onPress={handleReveal}>
          <Text style={styles.revealBtnText}>👁 Reveal Answer</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.answerBtns}>
          <TouchableOpacity
            style={styles.incorrectBtn}
            onPress={() => handleAnswer(false)}
          >
            <Text style={styles.incorrectBtnText}>✗ Incorrect</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.correctBtn}
            onPress={() => handleAnswer(true)}
          >
            <Text style={styles.correctBtnText}>✓ Correct</Text>
          </TouchableOpacity>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exitText: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '500',
  },
  cardCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressBarWrap: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  card: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#818CF8',
    marginBottom: 24,
  },
  cardTypeLabel: {
    fontSize: 13,
    color: '#818CF8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  cardText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E1B4B',
    textAlign: 'center',
    lineHeight: 32,
  },
  cardQuestionSmall: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
  revealBtn: {
    backgroundColor: '#4F46E5',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  revealBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  answerBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  incorrectBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  incorrectBtnText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  correctBtn: {
    flex: 1,
    backgroundColor: '#D1FAE5',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  correctBtnText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultEmoji: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
    textAlign: 'center',
    marginBottom: 4,
  },
  resultDeck: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  scoreNum: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  percentText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNum: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  retryBtn: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  backBtnText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
});