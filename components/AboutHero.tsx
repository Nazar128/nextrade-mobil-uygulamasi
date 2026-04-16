import React from 'react';
import { View, Text, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
const { height, width } = Dimensions.get('window');

interface AboutHeroProps {
  title?: string;
  subTitle?: string;
  bgImage?: string;
}

const AboutHero = ({ title, subTitle, bgImage }: AboutHeroProps) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: bgImage }}
        style={styles.background}
        resizeMode="cover"
        
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subTitle}>{subTitle}</Text>
          </View>
          
          <View style={styles.scrollIndicator}>
            <View style={styles.indicatorLine} />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: height, width: width },
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.7)', justifyContent: 'center', paddingHorizontal: 30 },
  content: { maxWidth: '100%' },
  title: { fontSize: 42, fontWeight: '900', color: '#fff', marginBottom: 20, textTransform: 'uppercase', lineHeight: 46, letterSpacing: -1 },
  subTitle: { fontSize: 18, color: '#CBD5E1', fontWeight: '300', lineHeight: 26 },
  scrollIndicator: { position: 'absolute', bottom: 40, left: width / 2 - 1, alignItems: 'center' },
  indicatorLine: { width: 2, height: 48, backgroundColor: '#3B82F6', borderRadius: 1 }
});

export default AboutHero;