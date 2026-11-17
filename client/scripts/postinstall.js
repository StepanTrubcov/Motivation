// Database data must never be modified implicitly during install or deployment.
// Achievement catalog updates are explicit and use the canonical template file.
console.log('Postinstall: database synchronization skipped.');
