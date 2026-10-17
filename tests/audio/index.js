// Lets `node --test tests/audio/` work on Node 22 (a directory argument is loaded as a module).
import('./audio.test.mjs');
import('./slots.test.mjs');
