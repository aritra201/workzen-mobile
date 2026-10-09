import { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  adminReplyCommentThread,
  getCompanyAttendanceRecord,
  verifyShift,
} from '../../api/companyAttendance';
import { getMyAttendanceRecord, replyCommentThread } from '../../api/attendance';
import {
  formatActivityActionType,
  getActivityLogListItems,
  listActivityLogsForAttendance,
} from '../../api/activityLogs';
import { formatCurrencyInr, formatDateLabel } from '../../utils/format';
import {
  formatShiftResponseKey,
  formatShiftStatus,
  responseKeyToApiShiftKey,
  shiftStatusChipTone,
} from '../../utils/shiftLabels';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import BackButton from '../../components/BackButton';
import StatusChip from '../../components/StatusChip';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import WorkPicturesRow from '../../components/WorkPicturesRow';
import LoadingState from '../../components/LoadingState';
import FormError from '../../components/FormError';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useToast } from '../../context/ToastContext';
import {
  formatCommentThreadAuthorRole,
  getCommentThreadForShiftKey,
  getCommentThreadReplies,
} from '../../utils/commentThreads';

function getRecordEmployeeName(record) {
  return record?.employee?.name ?? record?.employeeName ?? 'You';
}

function activityLogKey(log, index) {
  if (log.activityLogId != null) return String(log.activityLogId);
  if (log.id != null) return String(log.id);
  if (log._id != null) return String(log._id);
  const stamp = log.createdAt ?? log.created_at ?? index;
  return `${log.actionType ?? log.action_type ?? 'log'}-${stamp}-${index}`;
}

function buildShiftEntries(shifts) {
  if (!shifts) return [];
  const fixed = Object.entries(shifts)
    .filter(([key, shift]) => key !== 'halfShifts' && Boolean(shift))
    .map(([key, shift]) => ({ key, shift }));
  const half = (shifts.halfShifts || [])
    .filter((h) => h?.marked)
    .map((h) => ({ key: h.shiftKey, shift: h }));
  return [...fixed, ...half];
}

function CommentThreadReplies({ record, shiftResponseKey }) {
  const styles = useThemedStyles(createDetailStyles);
  const thread = getCommentThreadForShiftKey(record, shiftResponseKey);
  const replies = getCommentThreadReplies(thread);
  if (replies.length === 0) {
    return null;
  }
  return (
    <View style={styles.threadBlock}>
      <Text style={styles.commentLabel}>Thread</Text>
      {replies.map((message) => (
        <View key={String(message.id)} style={styles.threadMessage}>
          <View style={styles.threadMeta}>
            <Text style={styles.threadAuthor}>{formatCommentThreadAuthorRole(message.authorRole)}</Text>
            {message.createdAt ? (
              <Text style={styles.threadTime}>{new Date(message.createdAt).toLocaleString()}</Text>
            ) : null}
          </View>
          <Text style={styles.comment}>{message.text}</Text>
        </View>
      ))}
    </View>
  );
}

function ShiftDetailBlock({ mode, attendanceId, entry, record, onReload }) {
  const { showSuccess, showError } = useToast();
  const styles = useThemedStyles(createDetailStyles);
  const { key, shift } = entry;
  const shiftKey = responseKeyToApiShiftKey(key);
  const shiftLabel = formatShiftResponseKey(key);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleReply() {
    if (!reply.trim()) return;
    setBusy(true);
    setError('');
    try {
      if (mode === 'employee') {
        await replyCommentThread({ attendanceId, shiftKey, text: reply.trim() });
      } else if (mode === 'admin') {
        await adminReplyCommentThread({ attendanceId, shiftKey, text: reply.trim() });
      }
      setReply('');
      await onReload();
      showSuccess('Reply sent.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function confirmVerify() {
    Alert.alert(
      'Verify shift?',
      `${shiftLabel} · ${formatCurrencyInr(shift.amount)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: async () => {
            setBusy(true);
            setError('');
            try {
              await verifyShift({ attendanceId, shiftKey });
              await onReload();
              showSuccess('Shift verified.');
            } catch (err) {
              setError(err.message);
              showError(err.message);
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  }

  const canReply = mode === 'admin' || mode === 'employee';
  const canVerify = mode === 'admin' && shift.status === 'pending_verification';

  return (
    <View style={styles.shiftCard}>
      <View style={styles.shiftHeader}>
        <Text style={styles.shiftTitle}>{shiftLabel}</Text>
        <StatusChip tone={shiftStatusChipTone(shift.status)}>
          {formatShiftStatus(shift.status)}
        </StatusChip>
      </View>
      <Text style={styles.amount}>
        {shift.amount != null ? formatCurrencyInr(shift.amount) : 'No amount'}
      </Text>
      <Text style={styles.commentLabel}>Work comment</Text>
      <Text style={styles.comment}>
        {shift.comment?.trim() ? shift.comment.trim() : 'No comment provided.'}
      </Text>
      <WorkPicturesRow shift={shift} />
      <CommentThreadReplies record={record} shiftResponseKey={key} />
      <FormError message={error} />
      {canVerify ? (
        <PrimaryButton title="Verify shift" onPress={confirmVerify} loading={busy} />
      ) : null}
      {canReply ? (
        <>
          <TextField
            label="Thread reply"
            tone="auth"
            value={reply}
            onChangeText={setReply}
            placeholder="Write a reply…"
          />
          <PrimaryButton title="Reply" variant="outline" compact onPress={handleReply} loading={busy} />
        </>
      ) : null}
    </View>
  );
}

export default function AttendanceRecordDetailScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createDetailStyles);
  const params = useLocalSearchParams();
  const attendanceId = params.attendanceId;
  const mode = params.mode || 'employee';

  const [record, setRecord] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const showActivityLog = mode === 'admin' || mode === 'member';

  const loadRecord = useCallback(async () => {
    if (!attendanceId) return;
    const fetcher =
      mode === 'employee'
        ? () => getMyAttendanceRecord({ attendanceId })
        : () => getCompanyAttendanceRecord({ attendanceId });
    const detail = await fetcher();
    setRecord(detail);
  }, [attendanceId, mode]);

  const loadLogs = useCallback(async () => {
    if (!showActivityLog || !attendanceId) return;
    const logData = await listActivityLogsForAttendance(attendanceId);
    setLogs(getActivityLogListItems(logData));
  }, [attendanceId, showActivityLog]);

  const load = useCallback(async () => {
    if (!attendanceId) return;
    setLoading(true);
    setError('');
    try {
      await loadRecord();
      await loadLogs();
    } catch (err) {
      setError(err.message);
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [attendanceId, loadRecord, loadLogs]);

  const refreshAfterAction = useCallback(async () => {
    try {
      await loadRecord();
      await loadLogs();
    } catch (err) {
      setError(err.message);
    }
  }, [loadRecord, loadLogs]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!attendanceId) {
    return (
      <Screen>
        <Text style={styles.mutedText}>Missing attendanceId</Text>
      </Screen>
    );
  }

  if (loading && !record) {
    return <LoadingState label="Loading record…" />;
  }

  if (!record) {
    return (
      <Screen>
        <FormError message={error || 'Record not found'} />
        <BackButton onPress={() => router.back()} />
      </Screen>
    );
  }

  const shiftEntries = buildShiftEntries(record.shifts);
  const employeeName = getRecordEmployeeName(record);

  return (
    <Screen>
      <BackButton onPress={() => router.back()} />
      <AppHeader
        title="Attendance record"
        subtitle={`${employeeName} · ${formatDateLabel(record.date)}`}
        showThemeToggle
      />
      <StatusChip tone={record.lockAttendance ? 'locked' : 'neutral'}>
        {record.lockAttendance ? 'Locked' : 'Open'}
      </StatusChip>
      <FormError message={error} />

      {shiftEntries.map((entry) => (
        <ShiftDetailBlock
          key={entry.key}
          mode={mode}
          attendanceId={attendanceId}
          entry={entry}
          record={record}
          onReload={refreshAfterAction}
        />
      ))}

      {showActivityLog ? (
        <View style={styles.logSection}>
          <Text style={styles.logTitle}>Activity log</Text>
          {logs.length === 0 ? (
            <Text style={styles.logEmpty}>No activity yet.</Text>
          ) : (
            logs.map((log, index) => (
              <View key={activityLogKey(log, index)} style={styles.logRow}>
                <Text style={styles.logAction}>{formatActivityActionType(log.actionType)}</Text>
                <Text style={styles.logMeta}>
                  {log.actorEmail || 'System'} ·{' '}
                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                </Text>
              </View>
            ))
          )}
        </View>
      ) : null}
    </Screen>
  );
}

function createDetailStyles(colors) {
  return {
    mutedText: { color: colors.onSurfaceVariant },
    shiftCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      gap: 8,
    },
    shiftHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    shiftTitle: { fontSize: 16, fontWeight: '600', color: colors.onSurface },
    amount: { fontSize: 18, fontWeight: '700', color: colors.onSurface },
    commentLabel: {
      fontSize: 11,
      textTransform: 'uppercase',
      color: colors.onSurfaceVariant,
      marginTop: 4,
    },
    comment: { fontSize: 14, color: colors.onSurface, lineHeight: 20 },
    threadBlock: { marginTop: 8, gap: 8 },
    threadMessage: {
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerLowest ?? colors.card,
      gap: 4,
    },
    threadMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    threadAuthor: { fontSize: 12, fontWeight: '700', color: colors.primary },
    threadTime: { fontSize: 11, color: colors.onSurfaceVariant },
    logSection: { marginTop: 20, marginBottom: 24 },
    logTitle: { fontSize: 17, fontWeight: '600', color: colors.onSurface, marginBottom: 8 },
    logEmpty: { fontSize: 14, color: colors.onSurfaceVariant },
    logRow: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    logAction: { fontSize: 14, fontWeight: '600', color: colors.onSurface },
    logMeta: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
  };
}
