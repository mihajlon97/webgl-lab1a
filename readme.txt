Lab 1a, Nikola Stankic, 01549753

Instead of drawing two primitives on the screen, to me it made more sense to only have 1 active,
and instead, I added multiple buttons to switch between the 7 shapes (I asked in class if
this was ok and you said yes)

My current implemention of transformations is that a transformation will be "blocked" if there
is already an ongoing animation in progress (will probably have to change this later, but I hope
it's ok for this assignment)

All input and transformations are handled in transformations.js
shapes.js contains position and color verteces
startup.js is for webgl initialisation

I also used gl-matrix.js, webgl-utils.js and initShaders.js which were linked in the forum.