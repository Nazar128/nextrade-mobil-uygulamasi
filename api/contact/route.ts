import { Resend } from 'resend';
import { db } from '@/api/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
    try {
        const { name, email, message, recaptcha, subject } = await req.json();

        let isHuman = false;
        if (recaptcha === "MOBILE_VERIFIED") {
            isHuman = true;
        } else {
            const recaptchaResponse = await fetch(
                `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha}`,
                { method : "POST"}
            );
            const recaptchaResult = await recaptchaResponse.json();
            isHuman = recaptchaResult.success;
        }

        if (!isHuman) {
            return Response.json(
                { message: "reCAPTCHA verification failed."},
                { status: 400 }
            );
        }

        await addDoc(collection(db, "contactMessages"), {
            name: name,
            email: email,
            subject: subject || "Genel Destek",
            message: message,
            status: "unread",
            createdAt: serverTimestamp(),
        });

        const emailResponse = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: "nextrade.support@gmail.com",
            subject: `Mail`,
            html:`
                <h2>Mail</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong>${email}</p>
                <p><strong>Message:</strong>${message}</p>
                `,
        });

        return Response.json({message: "Message Success!"}, { status: 200 });

    } catch (error) {
        console.log("Error:", error);
        return Response.json({message: "Something went wrong."}, { status: 500 });
    }
}