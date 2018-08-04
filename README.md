atoms-www
=========

A re-implementation of Tom Kuhn's "Atoms" Amiga game using web technologies.

Atoms was originally a game for the Atari ST and an Amiga version was later released which was given away on an Amiga
Format coverdisk. This web-based version of Atoms is based (loosely) on the design of the Amiga version of the game.

Install & run
-------------
Simply clone the repository and then point your web browser at the `game.html` file.

Or you can just run the game from my server at https://atoms.xiven.com/

Gameplay
--------
Each player in turn places an atom in a cell on the board. They can either place it in an empty cell, or any cell with
their own colour atoms in it. If the placed atom causes the cell to be overloaded, the cell will explode with the atoms
moving out into all orthogonally adjacent cells, turning any existing atoms in those cells into the player's colour.
Chain reactions can occur after the initial explosion, which can cause sweeping changes across the board.

The maximum number of atoms a cell can hold before becoming overloaded is:
* Corners: 1
* Sides: 2
* Others: 3

Once a player's last atom has been wiped out, they are out of the game. The winner is the last surviving player.

More about this implementation
------------------------------
There are some notable differences from the original game:
* Visual display of chain reactions is different - this version shows all results of each explosion immediately, whereas
  the original appeared to do some shortcutting of atom drawing when chaining explosions.
* This version allows you to play against computer players, whereas the original was human-only.

Technologies used include:
* HTML5
* CSS, including:
  * [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
  * [CSS Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
  * [CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions)
  * [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables)
* EcmaScript 2018 (Vanilla JS)
* SVG

A modern web browser is definitely required. The latest stable versions of Vivaldi, Opera, Chrome and Firefox will all
work fine. Internet Explorer will not. Edge might…
