import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import useAuthStore from '../store/useAuthStore';
import useCountdown from '../hooks/useCountdown';

const TIMER_SECONDS = 15;

export default function TimerScreen({ navigation, route }) {
  const { deckId, deckTitle, flashcards } = route.params;
  const { user } = useAuthStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [responseTimes, setResponseTimes] = useState([]);
  const [startTime, setStartTime] = useState(null);

  const total = flashcards.length;
  const currentCard = flashcards[currentIndex];

  const handleTimeout = () => {
    setTimedOut(true);
    setIsRevealed(true);
    setResponseTimes((prev) => [...prev, TIMER_SECONDS]);
  };

  const { timeLeft, start, stop } = useCountdown(TIMER_SECONDS, handleTimeout);

  useEffect(() => {
    setStartTime(Date.now());
    start();
  }, [currentIndex]);

  const handleReveal = () => {
    stop();
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    setResponseTimes((prev) => [...prev, elapsed]);
    setIsRevealed(true);
  };

  const handleNext = async (isCorrect) => {
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    if (currentIndex + 1 >= total) {
      const allTimes = [...responseTimes];
      const avgTime = (allTimes.reduce((a, b) => a + b, 0) / allTimes.length).toFixed(1);
      const fastest = Math.min(...allTimes);
      const slowest = Math.max(...allTimes);

      try {
        await addDoc(collection(db, 'sessions'), {
          userId: user.uid,
          deckId: deckId,
          deckTitle: deckTitle,
          score: newScore,
          totalCards: total,
          avgTime: parseFloat(avgTime),
          fastestTime: fastest,
          slowestTime: slowest,
          mode: 'timer',
          date: new Date(),
        });
      } catch (e) {
        console.log('Session save error:', e);
      }

      navigation.replace('TimerSummary', {
        score: newScore,
        total,
        deckTitle,
        avgTime,
        fastest,
        slowest,
      });
    } else {
      setCurrentIndex(currentIndex + 1);
      setIsRevealed(false);
      setTimedOut(false);
    }
  };

  const timerColor = timeLeft <= 5 ? '#EF4444' : timeLeft <= 10 ? '#F59E0B' : '#10B981';

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

      {/* Timer Ring */}
      <View style={[styles.timerRing, { borderColor: timerColor }]}>
        <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}s</Text>
        <Text style={styles.timerLabel}>remaining</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarWrap}>
        <View style={[styles.progressBarFill, {
          width: `${(timeLeft / TIMER_SECONDS) * 100}%`,
          backgroundColor: timerColor,
        }]} />
      </View>

      {/* Status Badge */}
      {isRevealed && (
        <View style={[
          styles.statusBadge,
          { backgroundColor: timedOut ? '#FEE2E2' : '#D1FAE5' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: timedOut ? '#EF4444' : '#10B981' }
          ]}>
            {timedOut ? '⏰ Time\'s Up!' : '✅ Answered in Time!'}
          </Text>
        </View>
      )}

      {/* Flashcard */}
      <View style={[
        styles.card,
        isRevealed && { borderColor: timedOut ? '#FCA5A5' : '#6EE7B7' }
      ]}>
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
        <TouchableOpacity
          style={[styles.revealBtn, { backgroundColor: timerColor }]}
          onPress={handleReveal}
        >
          <Text style={styles.revealBtnText}>👁 Reveal Answer</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.answerBtns}>
          {timedOut ? (
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => handleNext(false)}
            >
              <Text style={styles.nextBtnText}>→ Next Card</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.incorrectBtn}
                onPress={() => handleNext(false)}
              >
                <Text style={styles.incorrectBtnText}>✗ Incorrect</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.correctBtn}
                onPress={() => handleNext(true)}
              >
                <Text style={styles.correctBtnText}>✓ Correct</Text>
              </TouchableOpacity>
            </>
          )}
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
    marginBottom: 20,
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
  timerRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  timerNum: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  timerLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  progressBarWrap: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusBadge: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 15,
    fontWeight: 'bold',
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
  nextBtn: {
    flex: 1,
    backgroundColor: '#F59E0B',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});