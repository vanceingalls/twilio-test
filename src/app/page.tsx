'use client';

import { useRef } from 'react';

export default function Home() {
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = async () => {
    const response = await fetch('/api/twilio/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageRef.current?.value,
        to: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER,
      }),
    });

    if (response.ok) {
      console.log('Message sent!');
    } else {
      console.error('Error sending message');
    }
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <textarea
        ref={messageRef}
        className="w-96 h-96 p-4 text-black"
        placeholder="Type your message here"
      />
      <button onClick={sendMessage}>Send</button>
    </main>
  );
}
