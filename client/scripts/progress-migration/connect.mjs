export async function connectProgressDb(db) {
  for (let attempt=0;;attempt++) {
    try { await db.$connect(); return; }
    catch (error) {
      if (attempt>=2) throw error;
      await db.$disconnect();
      await new Promise(resolve=>setTimeout(resolve,500));
    }
  }
}
