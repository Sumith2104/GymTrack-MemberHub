import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    const email = 'sumithsumith4567890@gmail.com';
    const memberId = '26SSUMI3210G';

    const query = `
      SELECT 
        m.id,
        m.member_id,
        m.name,
        m.email,
        m.age,
        m.phone_number,
        m.join_date,
        m.membership_type,
        m.membership_status,
        m.expiry_date,
        m.plan_id,
        m.gym_id,
        m.profile_url,
        p.price as plan_price,
        g.name as gym_name,
        g.formatted_gym_id,
        g.payment_id
      FROM members m
      LEFT JOIN plans p ON m.plan_id = p.id
      LEFT JOIN gyms g ON m.gym_id = g.id
      WHERE LOWER(m.email) = '${email.toLowerCase()}'
      AND UPPER(m.member_id) = '${memberId.toUpperCase()}'
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
        console.log("Raw Response 1:", JSON.stringify(data, null, 2));

        const query2 = `SELECT id, email, member_id FROM members`;
        console.log("Running Query 2 (Fetch All):", query2);

        const res2 = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                query: query2,
                projectId: projectId
            })
        });

        const data2 = await res2.json();
        console.log("Raw Response 2:", JSON.stringify(data2, null, 2));

        const query3 = `
          SELECT m.id, m.member_id, m.email
          FROM members m
          WHERE LOWER(m.email) = '${email.toLowerCase()}'
          AND UPPER(m.member_id) = '${memberId.toUpperCase()}'
        `;
        console.log("\\nRunning Query 3 (No JOINs):", query3);
        const res3 = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ query: query3, projectId })
        });
        const data3 = await res3.json();
        console.log("Raw Response 3:", JSON.stringify(data3, null, 2));

        const query4 = `
          SELECT m.id, m.member_id, m.email
          FROM members m
          WHERE m.email = '${email}'
          AND m.member_id = '${memberId}'
        `;
        console.log("\\nRunning Query 4 (No UPPER/LOWER):", query4);
        const res4 = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ query: query4, projectId })
        });
        const data4 = await res4.json();
        console.log("Raw Response 4:", JSON.stringify(data4, null, 2));

    } catch (e) {
        console.error("Error:", e);
    }
}

test();
