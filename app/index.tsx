import { Redirect } from 'expo-router';

import { useAppStore } from '@/store/useAppStore';

export default function Index() {
  const authDone = useAppStore((s) => s.profile.authDone);
  const onboardingDone = useAppStore((s) => s.profile.onboardingDone);

  if (!authDone) return <Redirect href="/bienvenida" />;
  if (!onboardingDone) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
