/*
Copyright 2021, James J. Hayes

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation; either version 2 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program; if not, write to the Free Software Foundation, Inc., 59 Temple
Place, Suite 330, Boston, MA 02111-1307 USA.
*/

/*jshint esversion: 6 */
/* jshint forin: false */
/* globals ObjectViewer, Quilvyn, QuilvynRules, QuilvynUtils */
"use strict";

/*
 * This module loads the rules from the Hellfrost Player's Guide. The Hellfrost
 * function contains methods that load rules for particular parts of the rules:
 * raceRules for character races, arcaneRules for powers, etc. These member
 * methods can be called independently in order to use a subset of the
 * Hellfrost rules. Similarly, the constant fields of Hellfrost (SKILLS, EDGES,
 * etc.) can be manipulated to modify the choices.
 */
function Hellfrost(baseRules) {

  var useSwade =
    baseRules && !baseRules.match(/deluxe/i) && window.SWADE != null;

  var rules = new QuilvynRules(
    'Hellfrost - SW ' + (useSwade ? 'Deluxe' : 'Adventure') + ' Edition',
     Hellfrost.VERSION
  );

  var rules = new QuilvynRules('Savage Worlds', Hellfrost.VERSION);
  Hellfrost.rules = rules;
  rules.basePlugin = useSwade ? SWADE : SWDE;

  rules.defineChoice('choices', rules.basePlugin.CHOICES);
  rules.choiceEditorElements = rules.basePlugin.choiceEditorElements;
  rules.choiceRules = Hellfrost.choiceRules;
  rules.editorElements = rules.basePlugin.initialEditorElements();
  rules.getFormats = rules.basePlugin.getFormats;
  rules.makeValid = rules.basePlugin.makeValid;
  rules.randomizeOneAttribute = rules.basePlugin.randomizeOneAttribute;
  rules.defineChoice('random', rules.basePlugin.RANDOMIZABLE_ATTRIBUTES);
  rules.ruleNotes = Hellfrost.ruleNotes;

  rules.basePlugin.createViewers(rules, rules.basePlugin.VIEWERS);
  rules.defineChoice('extras',
    'edges', 'edgePoints', 'hindrances', 'sanityNotes', 'validationNotes'
  );
  rules.defineChoice('preset',
    'race:Race,select-one,races', 'era:Era,select-one,eras',
    'advances:Advances,text,4', 'arcaneFocus:Arcane Focus?,checkbox,',
    'focusType:Focus Type,select-one,arcanas'
  );

  Hellfrost.attributeRules(rules);
  Hellfrost.combatRules
    (rules, Hellfrost.ARMORS, Hellfrost.SHIELDS, Hellfrost.WEAPONS);
  Hellfrost.arcaneRules(rules, Hellfrost.ARCANAS, Hellfrost.POWERS);
  Hellfrost.identityRules(rules, Hellfrost.RACES, Hellfrost.ERAS);
  Hellfrost.talentRules
    (rules, Hellfrost.EDGES, Hellfrost.FEATURES, Hellfrost.GOODIES,
     Hellfrost.HINDRANCES, Hellfrost.LANGUAGES, Hellfrost.SKILLS);

  Quilvyn.addRuleSet(rules);

}

Hellfrost.VERSION = '2.3.1.0';

Hellfrost.ARCANAS = {
  'Druidism':'Skill=Druidism',
  'Elementalism':'Skill=Elementalism',
  'Heahwisardry':'Skill=Hehwisardry',
  'Hrimwisardry':'Skill=Hrimwisardry',
  'Rune Magic':'Skill=Special',
  'Song Magic':'Skill="Song Magic"'
};
Hellfrost.ARMORS = {};
for(var a in SWADE.ARMORS) {
  if(SWADE.ARMORS[a].match(/medieval/i))
    Hellfrost.ARMORS[a] = SWADE.ARMORS[a];
}
Hellfrost.EDGES_ADDED = {
  // Background
  'Library':'Type=background Require="features.Rich||features.Lorekeeper"',
  'Linguist':'Type=background Require="smarts >= 6"',
  'Noble':'Type=background',
  'Old Family':'Type=background Require="Arcane Background (Heahwisardry)"',
  'Styrimathr':'Type=background Require="skills.Boating >= 8"',
  'Warm Blooded':'Type=background Require="race =~ \'Engro|Hearth Elf|Human\'"'
  // Combat
  // Disciple
  // Leadership
  // Legendary
  // Power
  // Professional
  // Social
};
Hellfrost.EDGES = Object.assign({}, SWADE.EDGES);
delete Hellfrost.EDGES['Ace'];
delete Hellfrost.EDGES['Elan'];
delete Hellfrost.EDGES['Natural Leader'];
Hellfrost.FEATURES_ADDED = {

  // Hindrances
  'Apprentice/Novitiate':
    'Section=skill Note="Maximum starting arcane skill d6"',
  'Apprentice/Novitiate+':'Section=arcana Note="-1 Power Count"',
  'Black Sheep':'Section=skill Note="-2 Persuasion (heahwisards)"',
  'Cold Blooded':'Section=attribute Note="-2 Vigor vs. code"',
  'God Cursed+':
    'Section=feature ' +
    'Note="Beneficial spells from god\'s cleric fail, harmful spells do +2 damage"',
  'Magic Forbiddance+':'Section=feature Note="Cannot use magic items"',
  'Necromantic Weakness':'Section=attribute Note="-2 vs. undead effects"',
  'Necromantic Weakness+':'Section=attribute Note="-4 vs. undead effects"',
  'Orders':'Section=feature Note="Takes orders from outside power"',

  // Races
  'Diverse':'Section=description Note="+2 Improvement Points (edge or skills)"',
  'Forest-Born':'Section=combat Note="No difficult terrain penalty in forests"',
  'Frigit Form':
    'Section=arcana ' +
    'Note="Innate casting of cold <i>Armor</i>, <i>Environmental Protection</i>, <i>Smite</i>, and <i>Speed</i>"',
  'Heat Lethargy':
    'Section=attribute,skill ' +
    'Note="-1 attribute rolls at temperatures above 52",' +
         '"-1 skill rolls at temperatures above 52"',
  'Mountain-Born':
    'Section=combat Note="No difficult terrain penalty in hills and mountains"',
  'Natural Realms':'Section=feature Note="Treat Elfhomes and wilds"',
  'Sneaky':'Section=skill Note="+1 choice of Stealth or Thievery"',
  'Winter Soul':
    'Section=attribute,combat ' +
    'Note="+2 Vigor (cold resistance)",' +
         '"+2 Armor vs. cold attacks"'
};
Hellfrost.FEATURES =
  Object.assign({}, SWADE.FEATURES, Hellfrost.FEATURES_ADDED);
Hellfrost.GOODIES = Object.assign({}, SWADE.GOODIES);
Hellfrost.HINDRANCES_ADDED = {
  'Apprentice/Novitiate':'Severity=Minor Require=powerPoints',
  'Apprentice/Novitiate+':'Severity=Major Require=powerPoints',
  'Black Sheep':'Severity=Minor',
  'Cold Blooded':'Severity=Minor',
  'God Cursed+':'Severity=Major',
  'Magic Forbiddance+':'Severity=Major',
  'Necromantic Weakness':'Severity=Minor',
  'Necromantic Weakness+':'Severity=Major',
  'Orders':'Severity=Minor'
};
Hellfrost.HINDRANCES =
  Object.assign({}, SWADE.HINDRANCES, Hellfrost.HINDRANCES_ADDED);
Hellfrost.POWERS = Object.assign({}, SWADE.POWERS);
Hellfrost.RACES = {
  'Engro':
    'Features=' +
      'Luck,Outsider,Small,Sneaky,Spirited',
  'Frost Dwarf':
    'Features=' +
      '"Heat Lethargy",Outsider,"Low Light Vision",Mountain-Born,Slow,' +
      'Tough,"Winter Soul"',
  'Frostborn':
    'Features=' +
      '"Frigid Form","Heat Lethargy",Outsider,"Winter Soul"',
  'Hearth Elf':
    'Features=' +
      'Agile,"All Thumbs","Forest-Born","Low Light Vision","Natural Realms"',
  'Anari Human':'Features=Diverse',
  'Finnar Human':'Features=Diverse',
  'Saxa Human':'Features=Diverse',
  'Tuomi Human':'Features=Diverse',
  'Taiga Elf':
    'Features=' +
      'Agile,"All Thumbs","Forest-Born","Heat Lethargy",Outsider,' +
      '"Low Light Vision","Natural Realms","Winter Soul"'
};
Hellfrost.LANGUAGES = {};
for(var r in Hellfrost.RACES) {
  Hellfrost.LANGUAGES[r] = '';
}
Hellfrost.SHIELDS = {};
for(a in SWADE.SHIELDS) {
  if(SWADE.SHIELDS[a].match(/medieval/i))
    Hellfrost.SHIELDS[a] = SWADE.SHIELDS[a];
}
Hellfrost.SKILLS = Object.assign({}, SWADE.SKILLS);
Hellfrost.WEAPONS = {};
for(a in SWADE.WEAPONS) {
  if(SWADE.WEAPONS[a].match(/medieval/i))
    Hellfrost.WEAPONS[a] = SWADE.WEAPONS[a];
}

/* Defines the rules related to character attributes and description. */
Hellfrost.attributeRules = function(rules) {
  rules.basePlugin.attributeRules(rules);
  // No changes needed to the rules defined by base method
};

/* Defines the rules related to combat. */
Hellfrost.combatRules = function(rules, armors, shields, weapons) {
  rules.basePlugin.combatRules(rules, armors, shields, weapons);
  // No changes needed to the rules defined by base method
};

/* Defines rules related to basic character identity. */
Hellfrost.identityRules = function(rules, races, eras) {
  rules.basePlugin.identityRules(rules, races, eras);
  // No changes needed to the rules defined by base method
};

/* Defines rules related to powers. */
Hellfrost.arcaneRules = function(rules, arcanas, powers) {
  rules.basePlugin.arcaneRules(rules, arcanas, powers);
  // No changes needed to the rules defined by base method
};

/* Defines rules related to character aptitudes. */
Hellfrost.talentRules = function(
  rules, edges, features, goodies, hindrances, languages, skills
) {
  rules.basePlugin.talentRules
    (rules, edges, features, goodies, hindrances, languages, skills);
  // No changes needed to the rules defined by base method
};

/*
 * Adds #name# as a possible user #type# choice and parses #attrs# to add rules
 * related to selecting that choice.
 */
Hellfrost.choiceRules = function(rules, type, name, attrs) {
  if(type == 'Arcana')
    Hellfrost.arcanaRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Skill')
    );
  else if(type == 'Armor')
    Hellfrost.armorRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Era'),
      QuilvynUtils.getAttrValueArray(attrs, 'Area'),
      QuilvynUtils.getAttrValue(attrs, 'Armor'),
      QuilvynUtils.getAttrValue(attrs, 'MinStr'),
      QuilvynUtils.getAttrValue(attrs, 'Weight')
    );
  else if(type == 'Edge') {
    Hellfrost.edgeRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValueArray(attrs, 'Imply'),
      QuilvynUtils.getAttrValueArray(attrs, 'Type')
    );
    Hellfrost.edgeRulesExtra(rules, name);
  } else if(type == 'Era')
    Hellfrost.eraRules(rules, name);
  else if(type == 'Feature')
    Hellfrost.featureRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Section'),
      QuilvynUtils.getAttrValueArray(attrs, 'Note')
    );
  else if(type == 'Goody')
    Hellfrost.goodyRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Pattern'),
      QuilvynUtils.getAttrValue(attrs, 'Effect'),
      QuilvynUtils.getAttrValue(attrs, 'Value'),
      QuilvynUtils.getAttrValueArray(attrs, 'Attribute'),
      QuilvynUtils.getAttrValueArray(attrs, 'Section'),
      QuilvynUtils.getAttrValueArray(attrs, 'Note')
    );
  else if(type == 'Hindrance') {
    Hellfrost.hindranceRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValue(attrs, 'Severity')
    );
    Hellfrost.hindranceRulesExtra(rules, name);
  } else if(type == 'Language')
    Hellfrost.languageRules(rules, name);
  else if(type == 'Power')
    Hellfrost.powerRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Advances'),
      QuilvynUtils.getAttrValue(attrs, 'PowerPoints'),
      QuilvynUtils.getAttrValue(attrs, 'Description')
    );
  else if(type == 'Race') {
    Hellfrost.raceRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValueArray(attrs, 'Languages')
    );
    Hellfrost.raceRulesExtra(rules, name);
  } else if(type == 'Shield')
    Hellfrost.shieldRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Era'),
      QuilvynUtils.getAttrValue(attrs, 'Parry'),
      QuilvynUtils.getAttrValue(attrs, 'Cover'),
      QuilvynUtils.getAttrValue(attrs, 'MinStr'),
      QuilvynUtils.getAttrValue(attrs, 'Weight')
    );
  else if(type == 'Skill')
    Hellfrost.skillRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Attribute'),
      QuilvynUtils.getAttrValue(attrs, 'Core'),
      QuilvynUtils.getAttrValueArray(attrs, 'Era')
    );
  else if(type == 'Weapon')
    Hellfrost.weaponRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Era'),
      QuilvynUtils.getAttrValue(attrs, 'Damage'),
      QuilvynUtils.getAttrValue(attrs, 'MinStr'),
      QuilvynUtils.getAttrValue(attrs, 'Weight'),
      QuilvynUtils.getAttrValue(attrs, 'Category'),
      QuilvynUtils.getAttrValue(attrs, 'AP'),
      QuilvynUtils.getAttrValue(attrs, 'Range'),
      QuilvynUtils.getAttrValue(attrs, 'ROF'),
      QuilvynUtils.getAttrValue(attrs, 'Parry')
    );
  else {
    console.log('Unknown choice type "' + type + '"');
    return;
  }
  if(type != 'Feature') {
    type =
      type.charAt(0).toLowerCase() + type.substring(1).replaceAll(' ', '') + 's';
    rules.addChoice(type, name, attrs);
  }
};

/*
 * Defines in #rules# the rules associated with arcane power source #name#,
 * which draws on skill #skill# when casting.
 */
Hellfrost.arcanaRules = function(rules, name, skill) {
  rules.basePlugin.arcanaRules(rules, name, skill);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with armor #name#, found during era
 * #eras#, which covers the body areas listed in #areas#, adds #armor# to the
 * character's Toughness, requires a strength of #minStr# to use effectively,
 * and weighs #weight#.
 */
Hellfrost.armorRules = function(rules, name, eras, areas, armor, minStr, weight) {
  rules.basePlugin.armorRules(rules, name, eras, areas, armor, minStr, weight);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with edge #name#. #require# and
 * #implies# list any hard and soft prerequisites for the edge, and #types#
 * lists the categories of the edge.
 */
Hellfrost.edgeRules = function(rules, name, requires, implies, types) {
  rules.basePlugin.edgeRules(rules, name, requires, implies, types);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with edge #name# that cannot be
 * derived directly from the attributes passed to edgeRules.
 */
Hellfrost.edgeRulesExtra = function(rules, name) {
  // TODO
  rules.basePlugin.edgeRulesExtra(rules, name);
};

/* Defines in #rules# the rules associated with language #name#. */
Hellfrost.eraRules = function(rules, name) {
  rules.basePlugin.eraRules(rules, name);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with feature #name#. #sections# lists
 * the sections of the notes related to the feature and #notes# the note texts;
 * the two must have the same number of elements.
 */
Hellfrost.featureRules = function(rules, name, sections, notes) {
  rules.basePlugin.featureRules(rules, name, sections, notes);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with goody #name#, triggered by
 * a starred line in the character notes that matches #pattern#. #effect#
 * specifies the effect of the goody on each attribute in list #attributes#.
 * This is one of "increment" (adds #value# to the attribute), "set" (replaces
 * the value of the attribute by #value#), "lower" (decreases the value to
 * #value#), or "raise" (increases the value to #value#). #value#, if null,
 * defaults to 1; occurrences of $1, $2, ... in #value# reference capture
 * groups in #pattern#. #sections# and #notes# list the note sections
 * ("attribute", "combat", "companion", "feature", "power", or "skill")
 * and formats that show the effects of the goody on the character sheet.
 */
Hellfrost.goodyRules = function(
  rules, name, pattern, effect, value, attributes, sections, notes
) {
  rules.basePlugin.goodyRules
    (rules, name, pattern, effect, value, attributes, sections, notes);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with hindrance #name#, which has
 * the list of hard prerequisites #requires# and level #severity# (Major or
 * Minor).
 */
Hellfrost.hindranceRules = function(rules, name, requires, severity) {
  rules.basePlugin.hindranceRules(rules, name, requires, severity);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with hindrance #name# that cannot be
 * derived directly from the attributes passed to hindranceRules.
 */
Hellfrost.hindranceRulesExtra = function(rules, name) {
  // TODO
  rules.basePlugin.hindranceRulesExtra(rules, name);
};

/* Defines in #rules# the rules associated with language #name#. */
Hellfrost.languageRules = function(rules, name) {
  rules.basePlugin.languageRules(rules, name);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with power #name#, which may be
 * acquired only after #advances# advances and requires #powerPoints# Power
 * Points to use. #description# is a concise description of the power's effects.
 */
Hellfrost.powerRules = function(rules, name, advances, powerPoints, description) {
  rules.basePlugin.powerRules(rules, name, advances, powerPoints, description);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with race #name#, which has the list
 * of hard prerequisites #requires#. #features# list associated features and
 * #languages# any automatic languages.
 */
Hellfrost.raceRules = function(rules, name, requires, features, languages) {
  rules.basePlugin.raceRules(rules, name, requires, features, languages);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with race #name# that cannot be
 * derived directly from the attributes passed to raceRules.
 */
Hellfrost.raceRulesExtra = function(rules, name) {
  if(name == 'Engro') {
    rules.defineRule('skillPoints', 'skillNotes.sneaky', '+=', '1');
  } else if(name.match(/Human/)) {
    rules.defineRule
      ('improvementPoints', 'descriptionNotes.diverse', '+=', '2');
  }
};

/*
 * Defines in #rules# the rules associated with shield #name#, found during
 * eras #eras#, which adds #parry# to the character's Parry, provides #cover#
 * cover, requires #minStr# to handle, and weighs #weight#.
 */
Hellfrost.shieldRules = function(rules, name, eras, parry, cover, minStr, weight) {
  rules.basePlugin.shieldRules(rules, name, eras, parry, cover, minStr, weight);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with skill #name#, associated with
 * #attribute# (one of 'agility', 'spirit', etc.). If specified, the skill is
 * available only in the eras listed in #eras#.
 */
Hellfrost.skillRules = function(rules, name, attribute, core, eras) {
  rules.basePlugin.skillRules(rules, name, attribute, core, eras);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with weapon #name#, found during
 * eras #eras#, which belongs to category #category#, requires #minStr# to use
 * effectively, and weighs #weight#. The weapon does #damage# HP on a
 * successful attack. If specified, the weapon bypasses #armorPiercing# points
 * of armor. Also if specified, the weapon can be used as a ranged weapon with
 * a range increment of #range# feet, firing #rateOfFire# per round. Parry, if
 * specified, indicates the parry bonus from wielding the weapon.
 */
Hellfrost.weaponRules = function(
  rules, name, eras, damage, minStr, weight, category, armorPiercing, range,
  rateOfFire, parry
) {
  rules.basePlugin.weaponRules(
    rules, name, eras, damage, minStr, weight, category, armorPiercing, range,
    rateOfFire, parry
  );
  // No changes needed to the rules defined by base method
};

/* Returns HTML body content for user notes associated with this rule set. */
Hellfrost.ruleNotes = function() {
  return '' +
    '<h2>Hellfrost Quilvyn Module Notes</h2>\n' +
    'Hellfrost Quilvyn Module Version ' + Hellfrost.VERSION + '\n' +
    '\n' +
    '<h3>Usage Notes</h3>\n' +
    '<ul>\n' +
    '</ul>\n' +
    '<h3>Limitations</h3>\n' +
    '<ul>\n' +
    '</ul>\n' +
    '<h3>Known Bugs</h3>\n' +
    '<ul>\n' +
    '</ul>\n' +
    '<h3>Copyrights and Licensing</h3>\n' +
    '<p>\n' +
    'All copyrights to character, vehicle, and other rules and settings are\n' +
    'owned by their respective copyright holders. This application makes no\n' +
    'claim against any properties.\n' +
    '</p><p>\n' +
    'Quilvyn is not approved or endorsed by Triple Ace Games.\n' +
    'Portions of the materials used are property of Triple Ace Games.\n' +
    '© Triple Ace Games.\n' +
    '</p><p>\n' +
    'Hellfrost Player\'s Guide © 2009 Triple Ace Games.\n' +
    '</p>\n';
};
