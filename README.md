## Hellfrost plugin for the Quilvyn RPG character sheet generator

The quilvyn-hellfrost package bundles modules that extend Quilvyn to work with
the Hellfrost Campaign Setting for the Savage Worlds RPG, applying the rules
of the
<a href="https://www.tripleacegames.com/store/hellfrost-products/hellfrost-players-guide-hb/">Hellfrost Player's Guide</a>.

### Requirements

quilvyn-hellfrost relies on the core modules installed by the quilvyn-core
package and the Savage Worlds modules installed by the quilvyn-savage package.

### Installation

To use quilvyn-hellfrost, unbundle the release package into a plugins/
subdirectory within the Quilvyn installation directory, then append the
following lines to the file plugins/plugins.js:

    RULESETS["Hellfrost Campaign Setting using the SWADE rules"] = {
      url:'plugins/Hellfrost.js',
      group:'Savage Worlds',
      require:'SWADE.js'
    };

### Usage

Once the Hellfrost plugin is installed as described above, start Quilvyn and
check the box next to "Hellfrost Campaign Setting" from the rule set
menu in the initial window.
