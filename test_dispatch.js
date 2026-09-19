require('dotenv').config({ path: '.env' });
const { dispatchTrip } = require('./backend/src/jobs/scheduledTrips');

async function test() {
  try {
    const res = await dispatchTrip(1);
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e.message);
  }
  process.exit(0);
}
test();
