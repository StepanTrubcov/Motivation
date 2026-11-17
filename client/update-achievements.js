// Legacy command line entry point. Uses the same canonical catalog as the app.
import('./src/lib/updateAchievements.mjs')
  .then(({ updateAllUserAchievements }) => updateAllUserAchievements())
  .then((result) => console.log(result.message))
  .catch((error) => {
    console.error('Ошибка при обновлении достижений:', error.message);
    process.exitCode = 1;
  });
