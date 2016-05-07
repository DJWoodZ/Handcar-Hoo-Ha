Handcar Hoo Ha
==============

[![Build Status](https://travis-ci.org/DJWoodZ/Handcar-Hoo-Ha.svg?branch=master)](https://travis-ci.org/DJWoodZ/Handcar-Hoo-Ha)

Handcar Hoo Ha is the result of an experiment to create a game in just a couple of days using nothing but pure JavaScript (i.e. without any dependencies on third-party JavaScript libraries).

[Play Handcar Hoo Ha](http://djwoodz.com/games/handcar-hoo-ha/)

The graphics are basic and a number of features are missing, however, the purpose of the experiment was to understand the principles of game production using the HTML Canvas element, rather than actually create a viable game.

Editing the code
----------------

There are many improvements that *could* be made, such as adding sounds and extra screens (title, game over, etc.), not to mention improving the structure of the code, increasing performance (e.g. sprite sheet) and addressing issues with some browsers.

If you would like to edit the code, you should install the development dependencies:

`npm install`

You can then run gulp tasks. The default task will lint and minify the code:

`gulp`

Change Log
----------

* v0.2.0 -
  * CSS and HTML linting
  * Custom number formatting for consistency
  * Improved 'score' and 'best score' displays
  * Added shadow effect to goal
* v0.1.0 - Initial Version

License
-------

This project is licensed under MIT.
