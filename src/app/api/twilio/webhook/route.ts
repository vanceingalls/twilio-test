import Client, { twiml } from 'twilio';

export async function POST(request: Request) {
  const body = await request.json();

  try {
    //   const twimlMessaging = new twiml.MessagingResponse();

    //   const message = twimlMessaging.message('The Robots are coming! Head for the hills!');
    //   message.media('https://farm8.staticflickr.com/7090/6941316406_80b4d6d50e_z_d.jpg');

    //   const headers = new Headers();

    //   headers.set('Content-Type', 'text/xml');

    //   return new Response(twimlMessaging.toString(), {
    //     headers,
    //     status: 200,
    //   });
    const client = Client(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    client.messages.create({
      body: JSON.stringify(body),
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.MY_PHONE_NUMBER!,
      // mediaUrl: [videoUrl],
    });
    return new Response('', {
      // headers,
      status: 200,
    });
  } catch (error) {
    return new Response('error', { status: 400 });
  }
}
