import CompanyPayrollListScreen from '../../src/features/payroll/CompanyPayrollListScreen';

export default function MemberReportsScreen() {
  return (
    <CompanyPayrollListScreen
      title="Payroll"
      subtitle="Company payroll (read-only)"
      mode="member"
      readOnly
    />
  );
}
