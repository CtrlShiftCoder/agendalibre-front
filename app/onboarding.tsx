import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Building2,
  CalendarSearch,
  Heart,
  Scissors,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FadeInView, StaggerItem } from '@/components/motion';
import { hapticSelection } from '@/lib/haptics';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { TextField } from '@/components/TextField';
import type { Niche, ThemeId, UserRole } from '@/data/types';
import { roleChoiceCopy } from '@/lib/copyChile';
import { coverGradient, nicheMoodLabel } from '@/lib/nicheVisuals';
import { useAppStore } from '@/store/useAppStore';
import { useColors } from '@/store/useTheme';
import {
  fontSize,
  radius,
  shadow,
  spacing,
  themes,
  type AppColors,
} from '@/theme/colors';

const niches: {
  id: Niche;
  label: string;
  theme: ThemeId;
  Icon: LucideIcon;
}[] = [
  { id: 'barber', label: 'Barbería', theme: 'barber', Icon: Scissors },
  { id: 'health', label: 'Salud / Podología', theme: 'health', Icon: Heart },
  { id: 'beauty', label: 'Belleza', theme: 'beauty', Icon: Sparkles },
  { id: 'other', label: 'Otro', theme: 'neutral', Icon: Sparkles },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const complete = useAppStore((s) => s.completeOnboarding);
  const [role, setRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState(0);
  const [niche, setNiche] = useState<Niche>('barber');
  const [theme, setTheme] = useState<ThemeId>('neutral');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const isCliente = role === 'cliente';
  const totalSteps = isCliente ? 2 : 4;

  const finishCliente = () => {
    complete({
      role: 'cliente',
      name: name.trim() || 'Cliente',
      phone: phone.trim() || undefined,
      niche: 'barber',
      theme: 'neutral',
    });
    router.replace('/(tabs)');
  };

  const finishProvider = () => {
    if (!role || role === 'cliente') return;
    complete({
      role,
      niche,
      name:
        name.trim() ||
        (role === 'empresa' ? 'Mi negocio' : 'Mi consulta'),
      theme,
    });
    router.replace('/(tabs)');
  };

  const accent = themes[theme].accent;
  const progressRatio = useSharedValue((step + 1) / totalSteps);

  useEffect(() => {
    progressRatio.value = withTiming((step + 1) / totalSteps, {
      duration: 320,
    });
  }, [step, totalSteps, progressRatio]);

  const progressFillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progressRatio.value }],
  }));

  const goNext = () => {
    if (step === 0 && !role) return;
    if (isCliente) {
      if (step === 0) setStep(1);
      else finishCliente();
      return;
    }
    if (step < 3) setStep((s) => s + 1);
    else finishProvider();
  };

  const canContinue = useMemo(() => {
    if (step === 0) return !!role;
    if (isCliente && step === 1) return name.trim().length > 0;
    return true;
  }, [step, role, isCliente, name]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
      >
      <ResponsiveShell forceMax style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.brand, { color: accent }]}>AgendaLibre</Text>
          <Text style={styles.hello}>
            {step === 0
              ? '¿Quién eres en AgendaLibre?'
              : '¡Hola! Armemos tu agenda en un ratito'}
          </Text>

          {role && role !== 'cliente' ? (
            <MoodPanel niche={niche} themeId={theme} />
          ) : null}

          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: accent },
                progressFillStyle,
              ]}
            />
          </View>
          <Text style={styles.progress}>
            Paso {step + 1} de {totalSteps}
          </Text>

          {step === 0 && (
            <FadeInView key="step-0" preset="fade" duration={280}>
              <Text style={styles.q}>Elige cómo empiezas</Text>
              <Text style={styles.hint}>
                Tres caminos simples — sin jerga. Puedes cambiar después.
              </Text>
              <StaggerItem index={0}>
                <FadeInView preset="zoom" duration={360} delay={40}>
                  <Choice
                    selected={role === 'cliente'}
                    title={roleChoiceCopy('cliente').title}
                    subtitle={roleChoiceCopy('cliente').subtitle}
                    accent={accent}
                    Icon={CalendarSearch}
                    onPress={() => {
                      void hapticSelection();
                      setRole('cliente');
                      setTheme('neutral');
                    }}
                  />
                </FadeInView>
              </StaggerItem>
              <StaggerItem index={1}>
                <FadeInView preset="zoom" duration={360} delay={80}>
                  <Choice
                    selected={role === 'empresa'}
                    title={roleChoiceCopy('empresa').title}
                    subtitle={roleChoiceCopy('empresa').subtitle}
                    accent={accent}
                    Icon={Building2}
                    onPress={() => {
                      void hapticSelection();
                      setRole('empresa');
                      setTheme(niche === 'other' ? 'neutral' : niche);
                    }}
                  />
                </FadeInView>
              </StaggerItem>
              <StaggerItem index={2}>
                <FadeInView preset="zoom" duration={360} delay={120}>
                  <Choice
                    selected={role === 'persona_natural'}
                    title={roleChoiceCopy('persona_natural').title}
                    subtitle={roleChoiceCopy('persona_natural').subtitle}
                    accent={accent}
                    Icon={UserRound}
                    onPress={() => {
                      void hapticSelection();
                      setRole('persona_natural');
                      setTheme(niche === 'other' ? 'neutral' : niche);
                    }}
                  />
                </FadeInView>
              </StaggerItem>
            </FadeInView>
          )}

          {isCliente && step === 1 && (
            <FadeInView key="step-cli-1" preset="fadeUp" duration={360}>
              <Text style={styles.q}>¿Cómo te llamas?</Text>
              <Text style={styles.hint}>
                Así te saludamos al reservar. El teléfono es opcional (+56).
              </Text>
              <TextField
                label="Tu nombre"
                placeholder="Ej. Ignacio Camiletti"
                value={name}
                onChangeText={setName}
                autoFocus
              />
              <TextField
                label="Teléfono (opcional)"
                placeholder="+569…"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </FadeInView>
          )}

          {!isCliente && step === 1 && (
            <FadeInView key="step-prov-1" preset="slideRight" duration={360}>
              <Text style={styles.q}>¿A qué te dedicas?</Text>
              <Text style={styles.hint}>
                Elegimos colores y ejemplos según tu rubro. Se puede cambiar.
              </Text>
              {niches.map((n) => (
                <Choice
                  key={n.id}
                  selected={niche === n.id}
                  title={n.label}
                  subtitle={nicheMoodLabel(n.id)}
                  accent={themes[n.theme].accent}
                  Icon={n.Icon}
                  mood
                  themeId={n.theme}
                  onPress={() => {
                    setNiche(n.id);
                    setTheme(n.theme);
                  }}
                />
              ))}
            </FadeInView>
          )}

          {!isCliente && step === 2 && (
            <FadeInView key="step-prov-2" preset="fadeUp" duration={360}>
              <Text style={styles.q}>
                {role === 'empresa'
                  ? '¿Cómo se llama tu negocio?'
                  : '¿Cómo te llamas?'}
              </Text>
              <TextField
                label={
                  role === 'empresa' ? 'Nombre del negocio' : 'Tu nombre'
                }
                placeholder={
                  role === 'empresa'
                    ? 'Ej. Barbería Norte'
                    : 'Ej. Dra. Camila Soto'
                }
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </FadeInView>
          )}

          {!isCliente && step === 3 && (
            <FadeInView key="step-prov-3" preset="fadeUp" duration={360}>
              <Text style={styles.q}>Elige un estilo visual</Text>
              <Text style={styles.hint}>
                Solo cambia colores — la app queda igual. Lo cambias en Perfil.
              </Text>
              {(Object.keys(themes) as ThemeId[]).map((id) => (
                <Choice
                  key={id}
                  selected={theme === id}
                  title={themes[id].label}
                  accent={themes[id].accent}
                  colorDot={themes[id].accent}
                  mood
                  themeId={id}
                  onPress={() => setTheme(id)}
                />
              ))}
            </FadeInView>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step > 0 ? (
            <Button
              title="Atrás"
              variant="ghost"
              gradient={false}
              onPress={() => setStep((s) => s - 1)}
              fullWidth={false}
              style={{ flex: 1 }}
            />
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <View style={{ flex: 2 }}>
            <GradientCTA
              title={
                (isCliente && step === 1) || (!isCliente && step === 3)
                  ? 'Empezar'
                  : 'Continuar'
              }
              colors={themes[theme].gradient}
              onPress={goNext}
              disabled={!canContinue}
            />
          </View>
        </View>
      </ResponsiveShell>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MoodPanel({ niche, themeId }: { niche: Niche; themeId: ThemeId }) {
  const appColors = useColors();
  const styles = useMemo(() => createStyles(appColors), [appColors]);
  const gradient = coverGradient(themeId);
  const Icon =
    niche === 'health' ? Heart : niche === 'beauty' ? Sparkles : Scissors;
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.moodPanel}
    >
      <View style={styles.moodIcons}>
        <View style={styles.moodIconCircle}>
          <Icon size={22} color="#fff" strokeWidth={2.2} />
        </View>
        <Sparkles size={16} color="rgba(255,255,255,0.7)" />
        <Heart size={14} color="rgba(255,255,255,0.55)" />
      </View>
      <Text style={styles.moodTitle}>{nicheMoodLabel(niche)}</Text>
      <Text style={styles.moodSub}>
        Misma agenda, con la onda de tu rubro
      </Text>
    </LinearGradient>
  );
}

function GradientCTA({
  title,
  colors,
  onPress,
  disabled,
}: {
  title: string;
  colors: [string, string];
  onPress: () => void;
  disabled?: boolean;
}) {
  const appColors = useColors();
  const styles = useMemo(() => createStyles(appColors), [appColors]);
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[anim, disabled && { opacity: 0.45 }]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: Boolean(disabled) }}
        onPressIn={() => {
          if (disabled) return;
          scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 300 });
        }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cta, shadow.md]}
        >
          <Text style={styles.ctaText}>{title}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function Choice({
  selected,
  title,
  subtitle,
  onPress,
  colorDot,
  accent,
  Icon,
  mood,
  themeId,
}: {
  selected: boolean;
  title: string;
  subtitle?: string;
  onPress: () => void;
  colorDot?: string;
  accent: string;
  Icon?: LucideIcon;
  mood?: boolean;
  themeId?: ThemeId;
}) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ selected }}
      style={[
        styles.choice,
        selected && {
          borderColor: accent,
          backgroundColor: accent + '10',
          ...shadow.sm,
        },
      ]}
    >
      {mood && themeId ? (
        <LinearGradient
          colors={coverGradient(themeId).slice(0, 2) as [string, string]}
          style={styles.moodThumb}
        >
          {Icon ? <Icon size={18} color="#fff" strokeWidth={2.2} /> : null}
        </LinearGradient>
      ) : Icon ? (
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: selected ? accent + '22' : colors.cream },
          ]}
        >
          <Icon
            size={20}
            color={selected ? accent : colors.textMuted}
            strokeWidth={2.2}
          />
        </View>
      ) : colorDot ? (
        <View style={[styles.dot, { backgroundColor: colorDot }]} />
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.choiceTitle}>{title}</Text>
        {subtitle ? <Text style={styles.choiceSub}>{subtitle}</Text> : null}
      </View>
      <View
        style={[
          styles.radio,
          selected && { borderColor: accent, backgroundColor: accent },
        ]}
      />
    </Pressable>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.cream },
  scroll: { padding: spacing.xl, paddingBottom: 120 },
  brand: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  hello: {
    fontSize: fontSize.hero - 2,
    fontWeight: '800',
    color: c.text,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    letterSpacing: -0.4,
  },
  moodPanel: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadow.md,
  },
  moodIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  moodIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodTitle: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  moodSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSize.sm,
    marginTop: 4,
    fontWeight: '500',
  },
  progressTrack: {
    height: 6,
    backgroundColor: c.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    width: '100%',
    borderRadius: 3,
    transformOrigin: 'left center',
  },
  progress: {
    color: c.textMuted,
    marginBottom: spacing.xl,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  q: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: c.text,
    marginBottom: spacing.lg,
  },
  hint: {
    color: c.textMuted,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: c.white,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: c.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 72,
  },
  moodThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceTitle: {
    fontSize: fontSize.md + 1,
    fontWeight: '700',
    color: c.text,
  },
  choiceSub: {
    fontSize: fontSize.sm,
    color: c.textMuted,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: c.border,
  },
  dot: { width: 20, height: 20, borderRadius: 10 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: c.cream,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  cta: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: fontSize.md + 1,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
}

