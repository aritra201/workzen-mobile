import CompanyAttendanceListScreen from '../../src/features/attendance/CompanyAttendanceListScreen';

export default function AdminVerificationScreen() {
  return (
    <CompanyAttendanceListScreen
      title="Verification"
      subtitle="Pending shift reviews"
      listTitle="Verification queue"
      statusFilter="pending_verification"
      mode="admin"
    />
  );
}
