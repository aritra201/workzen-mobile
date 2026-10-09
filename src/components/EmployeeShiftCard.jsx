import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { confirmShift, updateShiftDetails } from '../api/attendance';
import EmployeeShiftWorkPictures from './EmployeeShiftWorkPictures';
import { getSubmitGeoLocation } from '../utils/geolocation';
import {
  isShiftDetailsLockedForEmployee,
  shiftDisplayLabel,
  statusLabel,
} from '../utils/attendanceUi';
import { SHIFT_STATUS } from '../constants/shifts';
import { formatCurrencyInr } from '../utils/format';
import PrimaryButton from './PrimaryButton';
import TextField from './TextField';
import StatusChip from './StatusChip';
import FormError from './FormError';
import { colors } from '../theme/colors';
import { useToast } from '../context/ToastContext';

function statusTone(status, locked) {
  if (locked) return 'locked';
  if (status === SHIFT_STATUS.VERIFIED) return 'verified';
  if (status === SHIFT_STATUS.REJECTED) return 'rejected';
  if (status === SHIFT_STATUS.PENDING_VERIFICATION) return 'pending';
  return 'neutral';
}

export default function EmployeeShiftCard({
  shiftKey,
  shift,
  attendance,
  attendanceDate,
  label,
  onUpdated,
}) {
  const { showSuccess, showError } = useToast();
  const [comment, setComment] = useState(shift?.comment ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setComment(shift?.comment ?? '');
  }, [shift?.comment]);

  const marked = Boolean(shift?.marked);
  const locked = attendance?.lockAttendance || !attendance?.canEdit;
  const detailsLocked = isShiftDetailsLockedForEmployee(shift, attendance);
  const disabled = locked || detailsLocked;
  const title = label || shiftDisplayLabel(shiftKey);
  const savedComment = String(shift?.comment || '').trim();
  const commentDirty = comment.trim() !== savedComment;
  const hasAmount =
    shift?.amount != null && !Number.isNaN(Number(shift.amount)) && Number(shift.amount) > 0;

  async function handleConfirm() {
    setBusy(true);
    setError('');
    try {
      const geoLocation = await getSubmitGeoLocation();
      await confirmShift({ geoLocation }, { shiftKey, attendanceDate });
      await onUpdated();
      showSuccess('Attendance marked.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveComment() {
    setBusy(true);
    setError('');
    try {
      await updateShiftDetails({ comment: comment.trim() }, { shiftKey, attendanceDate });
      await onUpdated();
      showSuccess('Comment saved.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <StatusChip tone={statusTone(shift?.status, locked)}>
          {statusLabel(shift?.status, locked)}
        </StatusChip>
      </View>
      <FormError message={error} />
      {marked ? (
        <>
          <Text style={styles.amount}>
            {hasAmount ? formatCurrencyInr(shift.amount) : 'Amount from profile'}
          </Text>
          <TextField
            label="Work comment (optional)"
            value={comment}
            onChangeText={setComment}
            multiline
            editable={!disabled}
          />
          {!disabled && commentDirty ? (
            <PrimaryButton title="Save comment" loading={busy} onPress={handleSaveComment} />
          ) : null}
          <EmployeeShiftWorkPictures
            shift={shift}
            shiftKey={shiftKey}
            attendanceDate={attendanceDate}
            disabled={disabled}
            busy={busy}
            onBusyChange={setBusy}
            onUpdated={onUpdated}
            onError={(msg) => {
              setError(msg);
              showError(msg);
            }}
            onSuccess={() => showSuccess('Photos updated.')}
          />
        </>
      ) : !locked ? (
        <PrimaryButton title={`Confirm ${title}`} loading={busy} onPress={handleConfirm} />
      ) : (
        <Text style={styles.hint}>Locked — request unlock to edit.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: 8,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { fontSize: 16, fontWeight: '600', color: colors.onSurface, flex: 1 },
  amount: { fontSize: 15, color: colors.onSurfaceVariant },
  hint: { fontSize: 13, color: colors.onSurfaceVariant },
});
