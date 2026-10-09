import CompanyAttendanceListScreen from '../../src/features/attendance/CompanyAttendanceListScreen';

export default function MemberAttendanceScreen() {
  return (
    <CompanyAttendanceListScreen
      title="Attendance"
      subtitle="Company attendance (read-only)"
      listTitle="Employee Attendance List"
      mode="member"
      readOnly
    />
  );
}
