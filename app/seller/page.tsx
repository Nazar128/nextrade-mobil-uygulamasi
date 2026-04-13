import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Button } from '@react-navigation/elements'
import { useRouter } from 'expo-router';

export default function page() {
    const router = useRouter();
  return (
    
    <View>
      <Text>page</Text>
      <TouchableOpacity style={{backgroundColor: 'red', margin: 20,}} onPress={() => router.push("/seller/products")}>
        <Text>Ürünlerim</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/seller/orders")}><Text>Siparişler</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/seller/dashboard")}><Text>Dashboard</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/seller/questions")}><Text>Sorular</Text></TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({})