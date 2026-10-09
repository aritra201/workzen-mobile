import { Redirect } from 'expo-router';
import LoadingState from '../src/components/LoadingState';
import { useAuth } from '../src/auth/AuthContext';
import { homeRouteForRole } from '../src/utils/membership';

export default function Index() {
  const { loading, primaryMembership, user } = useAuth();

  if (loading) {
    return <LoadingState label="Starting WorkZen…" />;
  }

  if (!user || !primaryMembership?.role) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href={homeRouteForRole(primaryMembership.role)} />;
}
