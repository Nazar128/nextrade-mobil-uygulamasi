import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, StatusBar, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

SplashScreen.preventAutoHideAsync();

interface CustomSplashScreenProps {
  onFinish?: () => void;
}

const BRAND_NAME = "NEXTRADE";

export default function CustomSplashScreen({ onFinish }: CustomSplashScreenProps) {
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const bgScale = useRef(new Animated.Value(1)).current;
  
  const charAnimations = useRef(BRAND_NAME.split('').map(() => ({
    fade: new Animated.Value(0),
    move: new Animated.Value(25)
  }))).current;

  const lineScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoFade, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 10,
        useNativeDriver: true,
      }),
      Animated.timing(bgScale, {
        toValue: 1.2,
        duration: 6000,
        useNativeDriver: true,
      })
    ]).start();

    BRAND_NAME.split('').forEach((_, index) => {
      Animated.sequence([
        Animated.delay(800 + (200 * index)),
        Animated.parallel([
          Animated.timing(charAnimations[index].fade, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(charAnimations[index].move, {
            toValue: 0,
            friction: 5,
            useNativeDriver: true,
          }),
        ])
      ]).start();
    });

    Animated.timing(lineScale, {
      toValue: 1,
      duration: 1200,
      delay: 2800,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync();
      if (onFinish) onFinish();
    }, 6500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Animated.View style={[styles.bgContainer, { transform: [{ scale: bgScale }] }]}>
        <View style={styles.glowMain} />
        <View style={styles.orbitInner} />
        <View style={styles.orbitOuter} />
      </Animated.View>

      <Animated.Image
        source={require('@/assets/images/logo.png')}
        style={[
          styles.logo,
          {
            opacity: logoFade,
            transform: [{ scale: logoScale }],
          },
        ]}
        resizeMode="contain"
      />

      <View style={styles.textRow}>
        {BRAND_NAME.split('').map((char, index) => (
          <Animated.Text 
            key={index} 
            style={[
              styles.char,
              {
                opacity: charAnimations[index].fade,
                transform: [{ translateY: charAnimations[index].move }]
              }
            ]}
          >
            {char}
          </Animated.Text>
        ))}
      </View>

      <View style={styles.lineContainer}>
        <Animated.View 
          style={[
            styles.line, 
            { transform: [{ scaleX: lineScale }] }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowMain: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#38BDF8',
    opacity: 0.08,
    filter: 'blur(50px)',
  },
  orbitInner: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 0.5,
    borderColor: '#334155',
    opacity: 0.3,
  },
  orbitOuter: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    borderWidth: 0.5,
    borderColor: '#1e293b',
    opacity: 0.2,
  },
  logo: {
    width: width * 0.32,
    height: width * 0.32,
    marginBottom: 40,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  char: {
    fontSize: 40,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 4,
    textShadowColor: 'rgba(56, 189, 248, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
  },
  lineContainer: {
    marginTop: 25,
    height: 4,
    width: 120,
    alignItems: 'center',
  },
  line: {
    width: '100%',
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 2,
    shadowColor: '#38BDF8',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  }
});