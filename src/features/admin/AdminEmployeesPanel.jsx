import { useCallback, useRef, useState } from 'react';
import { Alert, Modal, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  inviteEmployee,
  listEmployees,
  patchEmployee,
  resendEmployeeInvite,
} from '../../api/employees';
import { formatCurrencyInr } from '../../utils/format';
import { employeeIdsQueryParam } from '../../utils/employeeIds';
import { attendanceListRangeLabel } from '../../utils/companyAttendanceList';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import ListPagination from '../../components/ListPagination';
import ListRangeMeta from '../../components/ListRangeMeta';
import LoadingState from '../../components/LoadingState';
import LoadingOverlay from '../../components/LoadingOverlay';
import FormError from '../../components/FormError';
import FilterCard from '../../components/FilterCard';
import EmployeeFilterSelect from '../../components/EmployeeFilterSelect';
import TeamPersonCard from '../../components/TeamPersonCard';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { parseDailyAmountForSubmit } from '../../utils/inputFilters';
import { useToast } from '../../context/ToastContext';

const PAGE_SIZE = 20;

function employeeStatus(employee) {
  if (!employee.userId) return { label: 'Invitation pending', tone: 'pending' };
  if (employee.isActive) return { label: 'Active', tone: 'verified' };
  return { label: 'Inactive', tone: 'locked' };
}

export default function AdminEmployeesPanel() {
  const styles = useThemedStyles(createStyles);
  const { showSuccess, showError } = useToast();
  const [employees, setEmployees] = useState([]);
  const [filterEmployeeIds, setFilterEmployeeIds] = useState([]);
  const [page, setPage] = useState(1);
  const pageRef = useRef(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ employeeName: '', employeeEmail: '', dailyAmount: '' });
  const [busy, setBusy] = useState(false);
  const [amountEdit, setAmountEdit] = useState(null);
  const [amountEditValue, setAmountEditValue] = useState('');
  const [amountEditError, setAmountEditError] = useState('');

  const load = useCallback(
    async (pageNum, selectedIds = filterEmployeeIds) => {
      const targetPage = pageNum ?? pageRef.current;
      setLoading(true);
      setError('');
      try {
        const params = { page: targetPage, limit: PAGE_SIZE };
        const employeeId = employeeIdsQueryParam(selectedIds);
        if (employeeId) params.employeeId = employeeId;
        const data = await listEmployees(params);
        const resolvedPage = data.page ?? targetPage;
        pageRef.current = resolvedPage;
        setEmployees(data.items || data.employees || []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 0);
        setPage(resolvedPage);
      } catch (err) {
        setError(err.message);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    },
    [filterEmployeeIds]
  );

  useFocusEffect(
    useCallback(() => {
      load(pageRef.current, filterEmployeeIds);
    }, [load, filterEmployeeIds])
  );

  function handleApplyFilter() {
    pageRef.current = 1;
    setPage(1);
    load(1, filterEmployeeIds);
  }

  function handlePageChange(nextPage) {
    pageRef.current = nextPage;
    setPage(nextPage);
    load(nextPage, filterEmployeeIds);
  }

  async function handleInvite() {
    if (!form.employeeName.trim() || !form.employeeEmail.trim()) {
      showError('Name and email are required.');
      return;
    }
    const amountCheck = parseDailyAmountForSubmit(form.dailyAmount);
    if (!amountCheck.ok) {
      showError(amountCheck.message);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await inviteEmployee({
        employeeName: form.employeeName.trim(),
        employeeEmail: form.employeeEmail.trim(),
        dailyAmount: amountCheck.value,
      });
      setShowInvite(false);
      setForm({ employeeName: '', employeeEmail: '', dailyAmount: '' });
      await load(pageRef.current, filterEmployeeIds);
      showSuccess('Invitation sent.');
    } catch (err) {
      showError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function toggleActive(employee) {
    const next = !employee.isActive;
    Alert.alert(
      next ? 'Activate employee?' : 'Deactivate employee?',
      employee.employeeName,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: next ? 'Activate' : 'Deactivate',
          onPress: async () => {
            try {
              await patchEmployee(employee.employeeId, { isActive: next });
              await load(pageRef.current, filterEmployeeIds);
              showSuccess(next ? 'Employee activated.' : 'Employee deactivated.');
            } catch (err) {
              showError(err.message);
            }
          },
        },
      ]
    );
  }

  function openAmountEdit(employee) {
    setAmountEditError('');
    setAmountEdit(employee);
    setAmountEditValue(
      employee.dailyAmount != null && !Number.isNaN(Number(employee.dailyAmount))
        ? String(employee.dailyAmount)
        : ''
    );
  }

  async function saveAmountEdit() {
    if (!amountEdit) return;
    const amountCheck = parseDailyAmountForSubmit(amountEditValue);
    if (!amountCheck.ok) {
      setAmountEditError(amountCheck.message);
      showError(amountCheck.message);
      return;
    }
    setAmountEditError('');
    setBusy(true);
    setError('');
    try {
      await patchEmployee(amountEdit.employeeId, { dailyAmount: amountCheck.value });
      setAmountEdit(null);
      await load(pageRef.current, filterEmployeeIds);
      showSuccess('Daily amount updated.');
    } catch (err) {
      showError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleResend(employee) {
    setError('');
    setBusy(true);
    try {
      await resendEmployeeInvite({ employeeEmail: employee.employeeEmail });
      await load(pageRef.current, filterEmployeeIds);
      showSuccess('Invitation resent.');
    } catch (err) {
      showError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading && !employees.length && !showInvite) {
    return <LoadingState label="Loading employees…" />;
  }

  return (
    <View>
      <LoadingOverlay visible={busy} label="Please wait…" />
      <FormError message={error} />
      <PrimaryButton
        title={showInvite ? 'Cancel invite' : 'Invite employee'}
        variant={showInvite ? 'outline' : 'primary'}
        onPress={() => setShowInvite((v) => !v)}
      />
      {showInvite ? (
        <View style={styles.inviteBox}>
          <TextField
            label="Name"
            value={form.employeeName}
            onChangeText={(v) => setForm((f) => ({ ...f, employeeName: v }))}
          />
          <TextField
            label="Email"
            icon="email"
            value={form.employeeEmail}
            onChangeText={(v) => setForm((f) => ({ ...f, employeeEmail: v }))}
            keyboardType="email-address"
          />
          <TextField
            label="Daily amount (₹)"
            value={form.dailyAmount}
            onChangeText={(v) => setForm((f) => ({ ...f, dailyAmount: v }))}
            keyboardType="decimal-pad"
          />
          <PrimaryButton title="Send invitation" onPress={handleInvite} loading={busy} />
        </View>
      ) : null}

      <FilterCard compact>
        <EmployeeFilterSelect
          compact
          label="Filter by employee"
          value={filterEmployeeIds}
          onChange={setFilterEmployeeIds}
          disabled={loading}
        />
        <PrimaryButton title="Apply filter" compact onPress={handleApplyFilter} loading={loading} />
      </FilterCard>

      <ListRangeMeta label={attendanceListRangeLabel(page, PAGE_SIZE, total)} loading={loading} />

      {employees.map((emp) => {
        const status = employeeStatus(emp);
        return (
          <TeamPersonCard
            key={emp.employeeId}
            name={emp.employeeName}
            email={emp.employeeEmail}
            photoUrl={emp.profilePicture}
            status={status}
            meta={`Daily: ${emp.dailyAmount != null ? formatCurrencyInr(emp.dailyAmount) : '—'}`}
            secondaryAction={
              emp.userId
                ? { title: 'Edit daily amount', onPress: () => openAmountEdit(emp) }
                : null
            }
            primaryAction={
              !emp.userId
                ? { title: 'Resend invite', onPress: () => handleResend(emp) }
                : {
                    title: emp.isActive ? 'Deactivate' : 'Activate',
                    onPress: () => toggleActive(emp),
                  }
            }
          />
        );
      })}

      <ListPagination
        page={page}
        totalPages={totalPages}
        total={total}
        loading={loading}
        onPageChange={handlePageChange}
      />

      <Modal
        visible={Boolean(amountEdit)}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit daily amount</Text>
            <Text style={styles.modalSubtitle} numberOfLines={1}>{amountEdit?.employeeName}</Text>
            <TextField
              label="Daily amount (₹)"
              value={amountEditValue}
              onChangeText={setAmountEditValue}
              keyboardType="decimal-pad"
            />
            <FormError message={amountEditError} />
            <PrimaryButton title="Save amount" compact onPress={saveAmountEdit} loading={busy} />
            <PrimaryButton title="Cancel" variant="outline" compact onPress={() => setAmountEdit(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(colors) {
  return {
    inviteBox: { marginVertical: 12, gap: 4 },
    modalBackdrop: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    modalCard: {
      borderRadius: 16,
      padding: 20,
      gap: 8,
      backgroundColor: colors.surfaceContainerHighest ?? colors.surface,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface },
    modalSubtitle: { fontSize: 14, color: colors.onSurfaceVariant, marginBottom: 4 },
  };
}
