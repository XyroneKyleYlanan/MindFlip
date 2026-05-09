import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import useAuthStore from '../store/useAuthStore';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) setUserData(snap.data());
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => await signOut(auth),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const xp = userData?.xp || 0;
  const level = userData?.level || 1;
  const xpProgress = xp % 100;
  const xpPercent = Math.round((xpProgress / 100) * 100);
  const xpToNext = 100 - xpProgress;

  const getLevelTitle = (level) => {
    if (level < 3) return 'Beginner 🌱';
    if (level < 6) return 'Explorer 🔍';
    if (level < 10) return 'Scholar 📖';
    if (level < 15) return 'Expert 🎓';
    return 'Master 🏆';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {userData?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{userData?.name || 'Student'}</Text>
        <Text style={styles.email}>{userData?.email || ''}</Text>
        <View style={styles.titleBadge}>
          <Text style={styles.titleBadgeText}>{getLevelTitle(level)}</Text>
        </View>
      </View>

      {/* Level & XP Card */}
      <View style={styles.xpCard}>
        <View style={styles.xpCardTop}>
          <View>
            <Text style={styles.xpCardLabel}>Current Level</Text>
            <Text style={styles.xpCardLevel}>Level {level}</Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>⭐ {xp} XP</Text>
          </View>
        </View>

        <View style={styles.xpBarWrap}>
          <View style={[styles.xpBarFill, { width: `${xpPercent}%` }]} />
        </View>

        <View style={styles.xpBarLabels}>
          <Text style={styles.xpBarLabel}>{xpProgress} XP</Text>
          <Text style={styles.xpBarLabel}>{xpToNext} XP to Level {level + 1}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Your Stats</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>🎯</Text>
          <Text style={styles.statNum}>{level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>⚡</Text>
          <Text style={styles.statNum}>{xp}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statEmoji}>🚀</Text>
          <Text style={styles.statNum}>{xpToNext}</Text>
          <Text style={styles.statLabel}>XP Needed</Text>
        </View>
      </View>

      {/* Level Milestones */}
      <Text style={styles.sectionTitle}>Level Milestones</Text>
      <View style={styles.milestonesCard}>
        {[
          { level: 1, title: 'Beginner 🌱', reached: level >= 1 },
          { level: 3, title: 'Explorer 🔍', reached: level >= 3 },
          { level: 6, title: 'Scholar 📖', reached: level >= 6 },
          { level: 10, title: 'Expert 🎓', reached: level >= 10 },
          { level: 15, title: 'Master 🏆', reached: level >= 15 },
        ].map((milestone, index) => (
          <View key={index}>
            <View style={styles.milestoneRow}>
              <View style={[
                styles.milestoneDot,
                milestone.reached && styles.milestoneDotReached,
              ]} />
              <View style={styles.milestoneInfo}>
                <Text style={[
                  styles.milestoneTitle,
                  milestone.reached && styles.milestoneTitleReached,
                ]}>
                  {milestone.title}
                </Text>
                <Text style={styles.milestoneLevel}>Level {milestone.level}</Text>
              </View>
              {milestone.reached && (
                <Text style={styles.milestoneCheck}>✓</Text>
              )}
            </View>
            {index < 4 && <View style={styles.milestoneLine} />}
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FF',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F7FF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  titleBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#818CF8',
  },
  titleBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  xpCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  xpCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  xpCardLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  xpCardLevel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  xpBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  xpBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  xpBarWrap: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  xpBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpBarLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E1B4B',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: 6,
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
  milestonesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  milestoneDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  milestoneDotReached: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  milestoneInfo: { flex: 1 },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  milestoneTitleReached: {
    color: '#1E1B4B',
  },
  milestoneLevel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  milestoneCheck: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  milestoneLine: {
    width: 2,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginLeft: 7,
  },
  logoutBtn: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    backgroundColor: '#fff',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
});