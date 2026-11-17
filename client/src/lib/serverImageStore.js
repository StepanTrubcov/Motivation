import { createTemporaryImageStore } from './temporaryImageStore.mjs';

// Share one bounded store between both image routes and development hot reloads.
const key = Symbol.for('motivation.temporary-story-images.v1');
export const temporaryImages = globalThis[key] ||= createTemporaryImageStore();
