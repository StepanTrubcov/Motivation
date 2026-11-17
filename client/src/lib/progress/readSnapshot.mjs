// Only read-only callbacks belong here: a transient pool/connection failure can safely retry.
export async function readSnapshot(db, work) {
  for (let attempt=0;;attempt++) {
    try { return await db.$transaction(work,{isolationLevel:'RepeatableRead',maxWait:10000,timeout:20000}); }
    catch(error) {
      if (attempt>=1 || !['P1001','P1002','P2028'].includes(error.code)) throw error;
      await new Promise(resolve=>setTimeout(resolve,100));
    }
  }
}
