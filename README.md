## Hellfrost plugin for the Quilvyn RPG character sheet generator

The quilvyn-hellfrost package bundles modules that extend Quilvyn to work with
the Hellfrost Campaign Setting for the Savage Worlds RPG, applying the rules
from these source books:

- <a href="https://preview.drivethrurpg.com/en/product/63308/hellfrost-player-s-guide">Hellfrost Player's Guide</a>
- <a href="https://preview.drivethrurpg.com/en/product/88781/hellfrost-rassilon-expansion">Hellfrost Rassilon Expansion</a>
- <a href="https://preview.drivethrurpg.com/en/product/129495/hellfrost-rassilon-expansion-ii">Hellfrost Rassilon Expansion II</a>

### Requirements

quilvyn-hellfrost relies on the core modules installed by the quilvyn-core
package and the Savage Worlds modules installed by the quilvyn-savage package.

### Installation

To use quilvyn-hellfrost, unbundle the release package into a plugins/
subdirectory within the Quilvyn installation directory, then append the
following lines to the file plugins/plugins.js:

    RULESETS["Hellfrost Campaign Setting using the SWD rules"] = {
      url:'plugins/Hellfrost.js',
      group:'Savage Worlds',
      require:'SWD.js'
    };
    RULESETS["Hellfrost Campaign Setting using the SWADE rules"] = {
      url:'plugins/Hellfrost.js',
      group:'Savage Worlds',
      require:['SWD.js','SWADE.js']
    };

### Usage

Once the Hellfrost plugin is installed as described above, start Quilvyn and
check the box next to "Hellfrost Campaign Setting" from the rule set
menu in the initial window.
