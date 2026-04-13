import { db } from "@/api/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const sendNotification = async (sellerId: string, type: 'order' | 'question' | 'review', title: string, message: string) => {
    try {
        await addDoc(collection(db, "notifications"), {
            sellerId,
            type,
            title,
            message,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error(error);
    }
};