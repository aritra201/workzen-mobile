import CompanyAttendanceListScreen from '../../src/features/attendance/CompanyAttendanceListScreen';

export default function AdminAttendanceScreen() {
  return (
    <CompanyAttendanceListScreen
      title="Attendance"
      subtitle="All employees"
      listTitle="Employee Attendance List"
      mode="admin"
    />
  );
}
