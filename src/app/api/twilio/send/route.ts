import Client from 'twilio';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant who can respond with a total of 4 words to any prompt.',
        },
        { role: 'user', content: body.message },
      ],
      model: 'gpt-4',
    });

    const responseText = completion.choices[0].message.content?.replace(/[\"|\n]/g, '');

    console.log('responseText', responseText);

    const options = {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.HEYGEN_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: `{
        "background": "#ffffff",
        "clips": [
          {
            "avatar_id": "Daisy-inskirt-20220818",
            "avatar_style": "normal",
            "input_text": "${responseText}",
            "offset": {
              "x": 0,
              "y": 0
            },
            "scale": 1,
            "voice_id": "1bd001e7e50f421d891986aad5158bc8"
          }
        ],
        "ratio": "16:9",
        "test": true,
        "version": "v1alpha"
      }`,
    };

    console.log('options', options);

    const res = await fetch(`https://api.heygen.com/v1/video.generate`, options);
    const resJson = await res.json();
    console.log(resJson);

    const videoUrl = await new Promise<string>((resolve, reject) => {
      const checkStatus = () => {
        console.log('checking status');
        fetch(`https://api.heygen.com/v1/video_status.get?video_id=${resJson.data.video_id}`, {
          method: 'GET',
          headers: {
            'X-Api-Key': process.env.HEYGEN_API_KEY!,
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((res) => {
            console.log(res);
            if (res.data.video_url) {
              resolve(res.data.video_url);
            } else {
              setTimeout(checkStatus, 1000);
            }
          });
      };
      checkStatus();
    });

    const client = Client(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const message = await client.messages.create({
      body: body.message,
      from: body.from ?? process.env.TWILIO_PHONE_NUMBER,
      to: body.to ?? process.env.MY_PHONE_NUMBER,
      mediaUrl: [videoUrl],
    });
    return Response.json({ message: responseText }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return Response.json({ error: error.message, type: 'heygen error' }, { status: 400 });
  }
}
