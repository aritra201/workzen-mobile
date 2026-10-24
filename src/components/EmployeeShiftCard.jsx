import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { confirmShift, updateShiftDetails } from '../api/attendance';
import EmployeeShiftWorkPictures from './EmployeeShiftWorkPictures';
import AccordionSection from './AccordionSection';
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
import { useToast } from '../context/ToastContext';
import { useThemedStyles } from '../theme/useThemedStyles';

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
  accordionId,
  onUpdated,
}) {
  const { showSuccess, showError } = useToast();
  const styles = useThemedStyles(createStyles);
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

  const headerSubtitle = marked
    ? hasAmount
      ? formatCurrencyInr(shift.amount)
      : 'Marked — amount from profile'
    : 'Tap to expand · confirm when you worked this shift';

  async function runConfirm() {
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

  function promptConfirm() {
    Alert.alert(
      'Confirm shift?',
      `Confirm ${title} for today? Your profile amount will be applied and sent for verification. Location is required.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, confirm', onPress: runConfirm },
      ]
    );
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
    <AccordionSection
      accordionId={accordionId ?? shiftKey}
      title={title}
      subtitle={headerSubtitle}
      trailing={
        <StatusChip tone={statusTone(shift?.status, locked)}>
          {statusLabel(shift?.status, locked)}
        </StatusChip>
      }
      headerActions={
        !disabled && !marked ? (
          <PrimaryButton title="Confirm" compact onPress={promptConfirm} loading={busy} />
        ) : null
      }
    >
      {!marked ? (
        <Text style={styles.help}>
          Confirm this shift if you worked it. Your daily amount from your profile will be applied
          automatically and sent for verification. You can add an optional comment or photos after
          confirming.
        </Text>
      ) : (
        <>
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Shift amount (from profile)</Text>
            <Text style={styles.amountValue}>
              {hasAmount ? formatCurrencyInr(shift.amount) : '—'}
            </Text>
            <Text style={styles.amountHint}>
              Set by your company admin. You do not enter this amount per shift.
            </Text>
          </View>
          <TextField
            label="Work comment (optional)"
            value={comment}
            onChangeText={setComment}
            multiline
            editable={!disabled}
          />
          {!disabled && commentDirty ? (
            <PrimaryButton title="Save comment" compact loading={busy} onPress={handleSaveComment} />
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
      )}
      <FormError message={error} />
    </AccordionSection>
  );
}

function createStyles(colors) {
  return {
    help: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.onSurfaceVariant,
    },
    amountBox: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: 10,
      padding: 12,
      gap: 4,
    },
    amountLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
    },
    amountValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.onSurface,
    },
    amountHint: {
      fontSize: 11,
      color: colors.onSurfaceVariant,
      marginTop: 2,
    },
  };
}
