import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { AddressForm } from '@/components/AddressForm';
import PaymentForm from '@/components/PaymentForm';
import OrderSummary from '@/components/OrderSummary';

const { width } = Dimensions.get('window');

export default function CheckOutPage() {
    const [step, setStep] = useState(1);
    const [addressData, setAddressData] = useState(null);
    const [isPaymentComplete, setIsPaymentComplete] = useState(false);
    const [paymentMethodData, setPaymentMethodData] = useState(null);

    const handleAddressSubmit = (data: any) => {
        if (!data) return;
        setAddressData(data);
        setStep(2);
    };

    const handlePaymentComplete = (paymentInfo: any) => {
        if (!paymentInfo) {
            setIsPaymentComplete(false);
            setPaymentMethodData(null);
            return;
        }
        setPaymentMethodData(paymentInfo);
        setIsPaymentComplete(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.stepperContainer}>
                    <View style={styles.stepWrapper}>
                        <View style={[styles.stepCircle, step >= 1 && styles.activeStepCircle]}>
                            <Text style={styles.stepText}>1</Text>
                        </View>
                        <Text style={[styles.stepLabel, step === 1 && styles.activeLabel]}>Teslimat</Text>
                    </View>
                    <View style={[styles.connector, step > 1 && styles.activeConnector]} />
                    <View style={styles.stepWrapper}>
                        <View style={[styles.stepCircle, step === 2 && styles.activeStepCircle]}>
                            <Text style={styles.stepText}>2</Text>
                        </View>
                        <Text style={[styles.stepLabel, step === 2 && styles.activeLabel]}>Ödeme</Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.contentArea}>
                        {step === 1 ? (
                            <AddressForm onNext={(data) => handleAddressSubmit(data)} />
                        ) : (
                            <PaymentForm
                                onBack={() => {
                                    setStep(1);
                                    setIsPaymentComplete(false);
                                }}
                                onComplete={(paymentInfo) => handlePaymentComplete(paymentInfo)}
                            />
                        )}
                    </View>

                    <View style={styles.summaryArea}>
                        <OrderSummary
                            isFinalStep={step === 2 && isPaymentComplete}
                            addressData={addressData}
                            paymentMethod={paymentMethodData}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0a' },
    stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 24, paddingHorizontal: 16 },
    stepWrapper: { alignItems: 'center', gap: 8 },
    stepCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center' },
    activeStepCircle: { backgroundColor: '#2563eb', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
    stepText: { color: '#fff', fontWeight: 'bold' },
    stepLabel: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
    activeLabel: { color: '#fff' },
    connector: { width: 60, height: 2, backgroundColor: '#1f2937', marginHorizontal: 12, marginTop: -20 },
    activeConnector: { backgroundColor: '#2563eb' },
    scrollContent: { paddingBottom: 40 },
    contentArea: { paddingHorizontal: 16, marginBottom: 24 },
    summaryArea: { paddingHorizontal: 16 },
});