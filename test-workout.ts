import { flux } from './src/lib/flux/client.ts';

async function testInsertWorkout() {
    const memberId = '26SSUMI0493Y'; // Taken from terminal URL: /me/workout-tracking?memberId=26SSUMI0493Y
    const date = new Date().toISOString();
    const notes = 'Test workout via script';

    const queryWorkout = `
      INSERT INTO workouts (member_id, date, notes)
      VALUES ('${memberId}', '${date}', '${notes}')
      RETURNING *
    `;

    console.log("Running Query:", queryWorkout);

    try {
        const workoutRes = await flux.sql(queryWorkout);
        console.log("Result rows:", workoutRes.rows?.length);
        console.log("Result data:", JSON.stringify(workoutRes.rows, null, 2));
    } catch (e: any) {
        console.error("Error executing query:", e);
        if (e.message) {
            console.error("Error message:", e.message);
        }
    }
}

testInsertWorkout();
