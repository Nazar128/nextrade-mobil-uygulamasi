import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Animated } from 'react-native';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  scaleAnim = new Animated.Value(1);

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
  }

  handleReset = () => {
    Animated.sequence([
      Animated.timing(this.scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(this.scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start(() => {
      this.setState({ hasError: false, error: null });
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            
            <LottieView
              source={require('@/assets/animations/bull-error.json')}
              style={styles.lottie}
              autoPlay
              loop
            />
            
            <View style={styles.textContainer}>
              <Text style={styles.title}>Uups! Bir Sorun Oluştu</Text>
              <Text style={styles.description}>
                Görünüşe göre sistemlerimizde kısa süreli bir kesinti yaşandı. Teknik ekibimiz durumu kontrol ediyor.
              </Text>
            </View>

            <Animated.View style={{ transform: [{ scale: this.scaleAnim }], width: '100%' }}>
              <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                <Text style={styles.buttonText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.errorCodeContainer}>
              <Text style={styles.errorCodeLabel}>Hata:</Text>
              <Text style={styles.errorCodeText}>
                {this.state.error?.name || 'UNKNOWN_ERROR'}
              </Text>
            </View>

          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  lottie: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#1e0bd0',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  errorCodeContainer: {
    marginTop: 25,
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 6,
  },
  errorCodeLabel: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 5,
  },
  errorCodeText: {
    fontSize: 12,
    color: '#F1F5F9',
  }
});

export default ErrorBoundary;