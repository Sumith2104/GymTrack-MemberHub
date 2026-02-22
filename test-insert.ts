import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    const gymId = 'a6e25ae2-6c16-4edd-8f0d-99ea7534f061';
    const senderId = '26SSUMI3210G';
    const receiverId = 'test';
    const senderType = 'member';
    const receiverType = 'admin';
    const content = 'Test message';
    const formattedGymId = 'test';

    const query = `
      INSERT INTO messages (gym_id, sender_id, receiver_id, sender_type, receiver_type, content, formatted_gym_id)
      VALUES (
        '${gymId}',
        '${senderId}',
        '${receiverId}',
        '${senderType}',
        '${receiverType}',
        '${content}',
        '${formattedGymId}'
      )
      RETURNING *
    `;

    console.log("Running Query:", query);

    const apiUrl = process.env.NEXT_PUBLIC_FLUX_API_URL || 'https://fluxbase.vercel.app/api';
    const apiKey = process.env.FLUX_API_KEY;
    const projectId = process.env.FLUX_PROJECT_ID;

    const endpoint = `${apiUrl.replace(/\/$/, '')}/execute-sql`;

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                query: query,
                projectId: projectId
            })
        });

        const data = await res.json();
        console.log("Raw Response:", JSON.stringify(data, null, 2));

    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

test();
