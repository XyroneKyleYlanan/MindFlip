import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function TimerSummaryScreen({ navigation, route }) {
  const { score, total, deckTitle, avgTime, fastest, slowest } = route.params;
  const percentage = Math.round((score / total) * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚡</Text>
      <Text style={styles.title}>Speed Report</Text>
      <Text style={styles.subtitle}>{deckTitle}</Text>

      {/* Score Row */}
      <View style={styles.scoreRow}>
        <View style={[styles.scoreBox, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.scoreNum, { color: '#F59E0B' }]}>{score}</Text>
          <Text style={styles.scoreLabel}>Answered</Text>
        </View>
        <View style={[styles.scoreBox, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.scoreNum, { color: '#EF4444' }]}>{total - score}</Text>
          <Text style={styles.scoreLabel}>Timed Out</Text>
        </View>
      </View>

      {/* Accuracy Bar */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Accuracy</Text>
          <Text style={styles.sectionValue}>{percentage}%</Text>
        </View>
        <View style={styles.progressBarWrap}>
          <View style={[styles.progressBarFill, {
            width: `${percentage}%`,
            backgroundColor: percentage >= 70 ? '#10B981' : '#EF4444',
          }]} />
        </View>
      </View>

      {/* Speed Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>⚡ Avg Response Time</Text>
          <Text style={styles.statValue}>{avgTime}s</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>🏎 Fastest Card</Text>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{fastest}s</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>🐢 Slowest Card</Text>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{slowest}s</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>🎯 Final Score</Text>
          <Text style={styles.statValue}>{score}/{total}</Text>
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.retryBtnText}>Try Again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.navigate('Library')}
      >
        <Text style={styles.backBtnText}>Back to Library</Text>
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
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  scoreBox: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  scoreNum: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  sectionValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
  progressBarWrap: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  retryBtn: {
    backgroundColor: '#F59E0B',
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