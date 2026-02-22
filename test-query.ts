import { flux } from './src/lib/flux/client.js';

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

    try {
        const result = await flux.sql(query);
        console.log("Result rows:", result.rows?.length);
        console.log("Result data:", JSON.stringify(result.rows, null, 2));

        // Let's also try without the email to see if just the memberId works
        const query2 = `SELECT id, email, member_id FROM members WHERE UPPER(member_id) = '${memberId.toUpperCase()}'`;
        console.log("Running Query 2:", query2);
        const result2 = await flux.sql(query2);
        console.log("Result 2 rows:", result2.rows?.length);
        console.log("Result 2 data:", JSON.stringify(result2.rows, null, 2));

    } catch (e) {
        console.error("Error:", e);
    }
}

test();
