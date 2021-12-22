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
    'Hellfrost - SW ' + (useSwade ? 'Adventure' : 'Deluxe'), Hellfrost.VERSION
  );
  Hellfrost.rules = rules;
  rules.basePlugin = useSwade ? SWADE : SWDE;

  rules.defineChoice('choices', rules.basePlugin.CHOICES);
  rules.choiceEditorElements = rules.basePlugin.choiceEditorElements;
  rules.choiceRules = Hellfrost.choiceRules;
  rules.editorElements = rules.basePlugin.initialEditorElements();
  rules.getFormats = rules.basePlugin.getFormats;
  rules.makeValid = rules.basePlugin.makeValid;
  rules.randomizeOneAttribute = Hellfrost.randomizeOneAttribute;
  rules.defineChoice('random', rules.basePlugin.RANDOMIZABLE_ATTRIBUTES);
  rules.ruleNotes = Hellfrost.ruleNotes;

  rules.basePlugin.createViewers(rules, rules.basePlugin.VIEWERS);
  rules.defineChoice('extras',
    'edges', 'edgePoints', 'hindrances', 'sanityNotes', 'validationNotes'
  );
  rules.defineChoice('preset',
    'race:Race,select-one,races', 'advances:Advances,text,4',
    'arcaneFocus:Arcane Focus?,checkbox,',
    'focusType:Focus Type,select-one,arcanas'
  );

  Hellfrost.attributeRules(rules);
  Hellfrost.combatRules
    (rules, Hellfrost.ARMORS, Hellfrost.SHIELDS, Hellfrost.WEAPONS);
  Hellfrost.arcaneRules(rules, Hellfrost.ARCANAS, Hellfrost.POWERS);
  Hellfrost.identityRules(rules, Hellfrost.RACES, Hellfrost.DEITIES);
  Hellfrost.talentRules
    (rules, Hellfrost.EDGES, Hellfrost.FEATURES, Hellfrost.GOODIES,
     Hellfrost.HINDRANCES, Hellfrost.LANGUAGES, Hellfrost.SKILLS);

  Quilvyn.addRuleSet(rules);

}

Hellfrost.VERSION = '2.3.1.0';

Hellfrost.ARCANAS = {
  'Druidism':'Skill=Druidism',
  'Elementalism':'Skill=Elementalism',
  'Heahwisardry':'Skill=Heahwisardry',
  'Hrimwisardry':'Skill=Hrimwisardry',
  'Rune Magic':'Skill=Special',
  'Song Magic':'Skill="Song Magic"'
};
Hellfrost.ARMORS = {
  'None':'Area=Body Armor=0 MinStr=4 Weight=0',
  'Hide':'Area=Body Armor=1 MinStr=4 Weight=15',
  'Leather Suit':'Area=Body Armor=1 MinStr=4 Weight=10',
  'Chain Hauberk':'Area=Body Armor=2 MinStr=4 Weight=20',
  'Chain Shirt':'Area=Torso Armor=2 MinStr=4 Weight=10',
  'Chain Leggings':'Area=Legs Armor=2 MinStr=4 Weight=8',
  'Chain Sleeves':'Area=Arms Armor=2 MinStr=4 Weight=6',
  'Scale Hauberk':'Area=Body Armor=2 MinStr=4 Weight=25',
  'Plate Corselet':'Area=Torso Armor=3 MinStr=4 Weight=20',
  'Plate Bracers':'Area=Arms Armor=3 MinStr=4 Weight=8',
  'Plate Greaves':'Area=Legs Armor=3 MinStr=4 Weight=12',
  'Chain Coif':'Area=Head Armor=2 MinStr=4 Weight=3',
  'Pot Helm':'Area=Head Armor=3 MinStr=4 Weight=4',
  'Full Helmet':'Area=Head Armor=3 MinStr=4 Weight=8',
  'Blessed Robes':'Area=Body Armor=1 MinStr=4 Weight=8',
  'Blessed Armor':'Area=Body Armor=3 MinStr=4 Weight=30'
};
Hellfrost.DEITIES = {
  'None':'',
  'Dargar':'',
  'Eira':'',
  'Eostre Animalmother':'',
  'Eostre Plantmother':'',
  'Ertha':'',
  'Freo':'',
  'Hela':'',
  'Hoenir':'',
  'Hothar':'',
  'Kenaz':'',
  'Maera':'',
  'Nauthiz':'',
  'Neorthe':'',
  'Niht':'',
  'The Norns':'',
  'Rigr':'',
  'Scaetha':'',
  'Sigel':'',
  'Thrym':'',
  'Thunor':'',
  'Tiw':'',
  'Ullr':'',
  'The Unknowable One':'',
  'Vali':'',
  'Var':''
};
Hellfrost.EDGES_ADDED = {
  // Background
  'Library':'Type=background Require="features.Rich||features.Lorekeeper"',
  'Linguist':'Type=background Require="smarts >= 6","features.Illiterate==0"',
  'Noble':'Type=background',
  'Old Family':
    'Type=background Require="features.Arcane Background (Heahwisardry)"',
  'Styrimathr':'Type=background Require="skills.Boating >= 8"',
  'Warm Blooded':
    'Type=background Require="race =~ \'Engro|Hearth Elf|Human\'","vigor >= 8"',
  // Combat
  'Blood And Guts':
    'Type=combat ' +
    'Require="advances >= 8","skills.Fighting >= 10 || skills.Shooting >= 10"',
  'Courageous':'Type=combat Require="spirit >= 8"',
  'Double Shot':
    'Type=combat ' +
    'Require="advances >= 4","race =~ \'Elf\'","skills.Shooting >= 8"',
  'Improved Double Shot':
    'Type=combat Require="advances >= 12","features.Double Shot"',
  'Favored Foe':
    'Type=combat ' +
    'Require=' +
      '"advances >= 4",' +
      '"smarts >= 8",' +
      '"skills.Fighting >= 8 || skills.Shooting >= 8"',
  'Improved Giant Killer':
    'Type=combat Require="advances >= 12","features.Giant Killer"',
  'Mighty Shot':
    'Type=combat ' +
    'Require="advances >= 8","strength >= 8","skills.Shooting >= 10"',
  'Mighty Throw':
    'Type=combat ' +
    'Require="advances >= 8","strength >= 8","skills.Fighting >= 10"',
  'Necromantic Severing':
    'Type=combat ' +
    'Require="advances >= 8","spirit >= 8","skills.Fighting >= 10"',
  'Oversized Weapon Master':
    'Type=combat ' +
    'Require=' +
      '"advances >= 8",' +
      '"strength >= 10",' +
      '"skills.Fighting >= 10",' +
      '"size >= 0"',
  'Scamper':
    'Type=combat ' +
    'Require="advances >= 4","race == \'Engro\'","agility >= 8"',
  'Shieldwall':
    'Type=combat ' +
    'Require="advances >= 4",features.Block,"shield =~ \'Medium|Large\'"',
  'Snow Walker':'Type=combat Require="agility >= 6"',
  'Improved Snow Walker':
    'Type=combat Require="advances >= 4","features.Snow Walker"',
  'Sunder':
    'Type=combat ' +
    'Require="advances >= 4","race == \'Frost Dwarf\'","strength >= 8"',
  'Improved Sunder':'Type=combat Require="advances >= 8",features.Sunder',
  'Wall Of Steel':
    'Type=combat ' +
    'Require=' +
      '"advances >= 8",' +
      '"agility >= 8",' +
      '"skills.Fighting >= 8",' +
      '"skills.Notice >= 8"',
  'War Cry':
    'Type=combat ' +
    'Require=' +
      '"advances >= 4",' +
      '"race =~ \'Frost Dwarf|Saxa\' || features.Disciple Of Dargar",' +
      '"skills.Intimidation >= 8"',
  // Disciple
  'Disciple Of Dargar':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"strength >= 8",' +
      '"skills.Faith >= 8",' +
      '"skills.Fighting >= 8",' +
      '"skills.Intimidation >= 8",' +
      '"deity == \'Dargar\'"',
  'Disciple Of Eira':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"spirit >= 8",' +
      '"skills.Faith >= 8",' +
      '"skills.Healing >= 6",' +
      '"deity == \'Eira\'"',
  'Disciple Of Eostre Animalmother':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"spirit >= 8",' +
      '"skills.Faith >= 8",' +
      '"features.Beast Bond",' +
      '"deity == \'Eostre\'"',
  'Disciple Of Eostre Plantmother':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"agility >= 8",' +
      '"spirit >= 8",' +
      '"vigor >= 8",' +
      '"skills.Faith >= 8",' +
      '"deity == \'Eostre\'"',
  'Disciple Of Ertha':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"vigor >= 8",' +
      '"skills.Athletics >= 6",' +
      '"skills.Faith >= 8",' +
      '"skills.Survival >= 6",' +
      '"deity == \'Ertha\'"',
  'Disciple Of Freo':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"agility >= 8",' +
      '"vigor >= 8",' +
      '"skills.Faith >= 8",' +
      '"deity == \'Freo\'"',
  'Disciple Of Hela':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"spirit >= 8",' +
      '"skills.Faith >= 8",' +
      '"deity == \'Hela\'"',
  'Disciple Of Hoenir':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"smarts >= 10",' +
      '"skills.Faith >= 8",' +
      'features.Scholar,' +
      '"deity == \'Hoenir\'"',
  'Disciple Of Hothar':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"smarts >= 8",' +
      '"skills.Faith >= 8",' +
      '"skills.Notice >= 6",' +
      'features.Investigator,' +
      '"deity == \'Hothar\'"',
  'Disciple Of Kenaz':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"vigor >= 8",' +
      '"skills.Faith >= 8",' +
      '"deity == \'Kenaz\'"',
  'Disciple Of Maera':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"smarts >= 8",' +
      '"spirit >= 6",' +
      '"skills.Faith >= 8",' +
      '"deity == \'Maera\'"',
  'Disciple Of Nauthiz':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"agility >= 10",' +
      '"skills.Faith >= 8",' +
      '"skills.Gambling >= 8",' +
      '"skills.Thievery",' +
      '"deity == \'Nauthiz\'"',
  'Disciple Of Neorthe':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"skills.Athletics >= 6",' +
      '"skills.Boating >= 6",' +
      '"skills.Faith >= 6",' +
      '"deity == \'Neorthe\'"',
  'Disciple Of Niht':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"skills.Faith >= 8",' +
      '"skills.Notice >= 8",' +
      '"skills.Stealth >= 8",' +
      '"deity == \'Niht\'"',
  'Disciple Of The Norns':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"smarts >= 8",' +
      '"skills.Faith >= 8",' +
      '"deity == \'The Norns\'"',
  'Disciple Of Rigr':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"vigor >= 8",' +
      '"skills.Faith >= 8",' +
      '"skills.Notice >= 8",' +
      'features.Alertness,' +
      '"deity == \'Rigr\'"',
  'Disciple Of Scaetha':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"spirit >= 6",' +
      '"skills.Faith >= 8",' +
      '"skills.Fighting >= 8",' +
      '"deity == \'Scaetha\'"',
  'Disciple Of Sigel':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"skills.Faith >= 8",' +
      '"skills.Notice >= 8",' +
      '"deity == \'Sigel\'"',
  'Disciple Of Thrym':
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"vigor >= 8",' +
      '"skills.Faith >= 8",' +
      '"deity == \'Thrym\'"',
  'Disciple Of Thunor':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"spirit >= 8",' +
      '"skills.Faith >= 8",' +
      '"deity == \'Thunor\'"',
  'Disciple Of Tiw':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"strength >= 8",' +
      '"vigor >= 8",' +
      '"skills.Faith >= 8",' +
      '"skills.Fighting >= 10",' +
      '"deity == \'Tiw\'"',
  'Disciple Of Ullr':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"skills.Faith >= 8",' +
      '"skills.Shooting >= 8",' +
      '"skills.Stealth >= 6",' +
      '"skills.Survival >= 6",' +
      'features.Marksman,' +
      '"deity == \'Ullr\'"',
  'Disciple Of The Unknowable One':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"agility >= 8",' +
      '"smarts >= 8",' +
      '"skills.Faith >= 6",' +
      '"skills.Taunt >= 8",' +
      '"deity == \'The Unknowable One\'"',
  'Disciple Of Vali':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"vigor >= 6",' +
      '"skills.Faith >= 8",' +
      '"deity == \'Vali\'"',
  'Disciple Of Var':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"skills.Faith >= 8",' +
      '"skills.Persuasion >= 8",' +
      'features.Streetwise,' +
      '"deity == \'Var\'"',
  // Leadership
  'A Few Good Men':
    'Type=leadership ' +
    'Require=' +
      '"advances >= 12",' +
      '"smarts >= 8",' +
      '"skills.Battle >= 10",' +
      'features.Command,' +
      'features.Inspire',
  'Coordinated Firepower':
    'Type=leadership ' +
    'Require=' +
      '"advances >= 8",' +
      '"smarts >= 6",' +
      '"skills.Shooting >= 8",' +
      '"skills.Fighting >= 8",' +
      'features.Command',
  'Cry Havoc!':
    'Type=leadership ' +
    'Require=' +
      '"advances >= 8",' +
      '"spirit >= 8",' +
      '"skills.Battle >= 10",' +
      'features.Command,' +
      'features.Fervor',
  'Death Before Dishonor':
    'Type=leadership ' +
    'Require=' +
      '"advances >= 8",' +
      '"spirit >= 8",' +
      '"skills.Battle >= 8",' +
      'features.Command,' +
      '"features.Hold The Line"',
  'Fanaticism':
    'Type=leadership Require="advances >= 4",features.Command,features.Fervor',
  'Siege Breaker':
    'Type=leadership ' +
    'Require="advances >= 4","smarts >= 8","skills.Battle >= 8"',
  'Siege Mentality':
    'Type=leadership ' +
    'Require="advances >= 4","smarts >= 8","skills.Battle >= 8"',
  // Power
  'Alchemy':
    'Type=power ' +
    'Require=' +
      '"advances >= 4",' +
      'powerCount,' +
      '"arcaneSkill >= 6",' +
      '"skills.Knowledge (Alchemy) >= 6"',
  'Augment Staff (Aura)':
    'Type=power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Heahwisardry)",' +
      '"skills.Heahwisardry >= 8",' +
      '"skills.Occult >= 8"',
  'Augment Staff (Damage)':
    'Type=power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Heahwisardry)",' +
      '"skills.Heahwisardry >= 8",' +
      '"skills.Occult >= 8"',
  'Augment Staff (Deflect)':
    'Type=power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Heahwisardry)",' +
      '"skills.Heahwisardry >= 8",' +
      '"skills.Occult >= 8"',
  'Augment Staff (Spell Store)':
    'Type=power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Heahwisardry)",' +
      '"skills.Heahwisardry >= 8",' +
      '"skills.Occult >= 8"',
  'Combine Spells':
    'Type=power ' +
    'Require=' +
       '"advances >= 12",' +
       'powerCount,' +
       '"arcaneSkill >= 10",' +
       '"skills.Occult >= 10"',
  'Concentration':
    'Type=power ' +
    'Require=' +
      '"advances >= 4",' +
      'powerCount,' +
      '"smarts >= 6",' +
      '"spirit >= 6",' +
      '"vigor >= 6"',
  'Improved Concentration':
    'Type=power Require="advances >= 8",features.Concentration',
  'Elemental Mastery':
    'Type=power ' +
    'Require="advances >= 4","features.Arcane Background (Elementalism)"',
  'Focus':
    'Type=power Require="advances >= 4",powerCount,"spirit >= 6","arcaneSkill >= 8"',
  'Improved Focus':'Type=power Require="advances >= 12",features.Focus',
  'Hellfreeze':
    'Type=power ' +
    'Require=' +
      '"advances >= 8",' +
      'powerCount,' +
      '"arcaneSkill >= 10",' +
      '"skills.Occult >= 10"',
  'Power Surge':
    'Type=power Require="advances >= 4",powerCount,"arcaneSkill >= 10"',
  'Runic Insight':
    'Type=power ' +
    'Require="features.Arcane Background (Rune Magic)","arcaneSkill >= 8"',
  'Spell Finesse (Arcane)':
    'Type=power Require=powerCount,"arcaneSkill >= 8","skills.Occult >= 8"',
  'Spell Finesse (Armor Penetration)':
    'Type=power Require=powerCount,"arcaneSkill >= 8","skills.Occult >= 8"',
  'Spell Finesse (Heavy Weapon)':
    'Type=power Require=powerCount,"arcaneSkill >= 8","skills.Occult >= 8"',
  'Spell Finesse (Range)':
    'Type=power Require=powerCount,"arcaneSkill >= 8","skills.Occult >= 8"',
  'Spell Finesse (Selective)':
    'Type=power Require=powerCount,"arcaneSkill >= 8","skills.Occult >= 8"',
  // Professional
  'Bladedancer':
    'Type=professional ' +
    'Require=' +
      '"race =~ \'Elf\'",' +
      '"agility >= 8",' +
      '"skills.Fighting >= 8",' +
      '"features.Two-Fisted"',
  'Bludgeoner':
    'Type=professional ' +
    'Require=' +
      '"race == \'Engro\'",' +
      '"spirit >= 8",' +
      '"strength >= 6",' +
      '"skills.Intimidation >= 6",' +
      '"skills.Shooting >= 8"',
  'Gray Legionary':
    'Type=professional ' +
    'Require=' +
      '"spirit >= 8",' +
      '"skills.Fighting >= 8",' +
      '"skills.Shooting >= 6"',
  'Guild Thief':
    'Type=professional ' +
    'Require=' +
      '"skills.Thievery"',
  'Hearth Knight':
    'Type=professional ' +
    'Require=' +
      '"spirit >= 8",' +
      '"vigor >= 8",' +
      '"skills.Fighting >= 6",' +
      '"skills.Riding >= 6",' +
      '"skills.Survival >= 8"',
  'Hedge Magic':
    'Type=professional ' +
    'Require=' +
      '"smarts >= 8",' +
      '"skills.Occult >= 6",' +
      '"skills.Survival >= 6"',
  'Holy/Unholy Warrior':
    'Type=professional ' +
    'Require=' +
      '"features.Arcane Background (Miracles)",' +
      '"spirit >= 8",' +
      '"skills.Faith >= 6"',
  'Iron Guild Mercenary':
    'Type=professional ' +
    'Require=' +
      '"strength >= 8",' +
      '"spirit >= 6",' +
      '"skills.fighting >= 6"',
  'Knight Hrafn':
    'Type=professional ' +
    'Require=' +
      '"smarts >= 6",' +
      '"spirit >= 6",' +
      '"skills.Battle >= 8",' +
      'features.Command,' +
      '"leadershipEdgeCount >= 2"',
  'Lorekeeper':
    'Type=professional ' +
    'Require=' +
      '"smarts >= 8",' +
      '"skills.Investigation >= 6",' +
      '"features.Illiterate == 0"',
  'Reliquary (Arcanologist)':
    'Type=professional ' +
    'Require=' +
      '"smarts >= 8",' +
      '"Occult >= 8",' +
      '"skills.Notice >= 6"',
  'Reliquary (Reliqus)':
    'Type=professional ' +
    'Require=' +
      '"agility >= 8",' +
      '"skills.Thievery >= 6",' +
      '"skills.Notice >= 6"',
  'Roadwarden':
    'Type=professional ' +
    'Require=' +
      '"vigor >= 6",' +
      '"skills.Fighting >= 8",' +
      '"skills.Riding >= 6",' +
      '"skills.Survival >= 6"',
  'Sister Of Mercy':
    'Type=professional ' +
    'Require=' +
      '"skills.Healing >= 8",' +
      '"gender == \'Female\'",' +
      '"features.Pacifist || features.Pacifist+"',
  'Wood Warden':
    'Type=professional ' +
    'Require=' +
      '"skills.Shooting >= 8",' +
      '"features.Arcane Background (Druidism) || features.Woodsman"',
  // Social
  'Master Storyteller':
    'Type=background ' +
    'Require=' +
      '"advances >= 4",' +
      '"smarts >= 8",' +
      '"skills.Common Knowledge >= 8",' +
      '"skills.Persuasion >= 8"',
  'Legendary Storyteller':
    'Type=background Require="advances >= 12","features.Master Storyteller"'
};
Hellfrost.EDGES = Object.assign({}, SWADE.EDGES, Hellfrost.EDGES_ADDED);
delete Hellfrost.EDGES['Ace'];
delete Hellfrost.EDGES['Elan'];
delete Hellfrost.EDGES['Filthy Rich'];
delete Hellfrost.EDGES['Natural Leader'];
Hellfrost.FEATURES_ADDED = {

  // Edges
  'A Few Good Men':
    'Section=combat Note="Add one token to army in mass battles"',
  'Alchemy':'Section=power Note="Create arcane devices for known spells"',
  'Augment Staff (Aura)':
    'Section=skill Note="Staff gives +2 Intimidation or +2 Persuasion"',
  'Augment Staff (Damage)':
    'Section=combat Note="Staff does d%{strength}%1+d%2 damage and AP %3"',
  'Augment Staff (Deflect)':'Section=combat Note="Foe ranged attacks -%1"',
  'Augment Staff (Spell Store)':
    'Section=power Note="Staff can store 1 known spell, cast at +2"',
  'Bladedancer':
    'Section=combat Note="-2 attack on every target adjacent to running path"',
  'Blood And Guts':
    'Section=combat ' +
    'Note="Halve negative difference between tokens in mass battle"',
  'Bludgeoner':'Section=combat,skill ' +
    'Note=' +
      '"+%V sling range, sling does %{strength}%1+d6 damage at short range",' +
      '"+1 Persuasion (engro)"',
  'Combine Spells':'Section=power Note="Cast two spells simultaneously"',
  'Concentration':'Section=power Note="+%V to resist spell disruption"',
  'Coordinated Firepower':
    'Section=combat ' +
    'Note="R%{commandRange} Commanded extras fire at single foe simultaneously at +2"',
  'Courageous':'Section=attribute Note="+2 Spirit (fear), -2 Fear Table roll"',
  'Cry Havoc!':
    'Section=combat Note="Charge during Battle Roll 1/mass battle"',
  'Death Before Dishonor':
    'Section=attribute Note="+2 Spirit (mass battle morale)"',
  'Disciple Of Dargar':
    'Section=combat ' +
    'Note="Single blow that incapacitates foe makes adjacent foes Shaken (Spi neg)"',
  'Disciple Of Eira':
    'Section=skill Note="+2 Healing/5 companions +2 natural Healing"',
  'Disciple Of Eostre Animalmother':
    'Section=feature Note="Beast Master with Wild Card companion animal"',
  'Disciple Of Eostre Plantmother':
    'Section=combat,feature,skill ' +
    'Note=' +
      '"Normal movement through vegetated difficult terrain",' +
      '"Use Champion and Holy Warrior edges with plant creatures",' +
      '"+1 Faith (vegetated areas)"',
  'Disciple Of Ertha':
    'Section=combat,skill Note="+1 Toughness","+2 Survival (underground)"',
  'Disciple Of Freo':'Section=combat Note="Treat all terrain as normal ground"',
  'Disciple Of Hela':
    'Section=power,skill ' +
    'Note="Dbl Raise on <i>Zombie</i> creates permanent undead",' +
         '"+1 Faith (graveyards)"',
  'Disciple Of Hoenir':
    'Section=skill Note="+1 Common Knowledge/Make untrained Knowledge skills"',
  'Disciple Of Hothar':'Section=attribute Note="+2 vs. mind effects"',
  'Disciple Of Kenaz':
    'Section=attribute,combat ' +
    'Note=' +
      '"+2 Vigor (resist heat)",' +
      '"+4 Armor vs. heat damage, magically heat metal weapon for +2 damage"',
  'Disciple Of Maera':
    'Section=power Note="Learn any spell at -2 casting, +2 <i>Dispel</i>"',
  'Disciple Of Nauthiz':
    'Section=skill ' +
    'Note="Reroll 1s on Gambling, Stealth, and Thievery, suffer Fatigue if reroll is 1"',
  'Disciple Of Neorthe':
    'Section=feature ' +
    'Note="Survive on half water, survive drowning for %{vigor} rd"',
  'Disciple Of Niht':
    'Section=feature Note="No penalty in Dim and Dark, -2 in Pitch"',
  'Disciple Of The Norns':
    'Section=power Note="Give augury in exchange for benny"',
  'Disciple Of Rigr':
    'Section=feature ' +
    'Note="Nead only 3 hrs sleep, half penalty for missed sleep, counts as active guard when sleeping"',
  'Disciple Of Scaetha':
    'Section=combat,power ' +
    'Note="Use Champion edge vs.undead",' +
         '"+1 casting vs. undead"',
  'Disciple Of Sigel':
    'Section=combat,feature,skill ' +
    'Note="+2 vs. invisible foes",' +
         '"Halve Darkness penalty vs. heat-producing foes",' +
         '"+2 Notice (detect hidden objects and creatures)"',
  'Disciple Of The Unknowable One':
    'Section=combat,skill ' +
    'Note=' +
      '"+1 on Tricks/+1 vs. Tricks",' +
      '"+1 Taunt/+1 vs. Taunt"',
  'Disciple Of Thrym':
    'Section=power Note="More effective casting in cold environment"',
  'Disciple Of Thunor':
    'Section=attribute Note="+1 vs. hot and cold, halve falling damage"',
  'Disciple Of Tiw':
    'Section=feature,power ' +
    'Note="+1 Rank for acquiring combat edges",' +
         '"Cast and attack as single action"',
  'Disciple Of Ullr':
    'Section=combat,skill ' +
    'Note="Use Marksman edge with bow after moving half Pace",' +
         '"+2 Stealth (wilderness)/+2 Survival (wilderness)"',
  'Disciple Of Vali':'Section=feature Note="Immune to disease and poison"',
  'Disciple Of Var':
    'Section=feature Note="Sell goods at 50% price (Raise 75%)"',
  'Double Shot':'Section=combat Note="Fire two arrows at one target%V"',
  'Elemental Mastery':'Section=power Note="+%1 elements, cast at %2"',
  'Fanaticism':
    'Section=combat ' +
    'Note="R%{commandRange} yd Commanded extras +2 vs fear, -2 Fear Table"',
  'Favored Foe':
    'Section=combat ' +
    'Note="+1 Parry and d8 attack raise against chosen creature"',
  'Focus':
    'Section=power ' +
    'Note="Immediate %1Spirit roll to recover from Shaken due to spell failure or siphoning"',
  'Gray Legionary':'Section=feature Note="Member of Gray Legionary mercenary company"',
  'Guild Thief':
    'Section=skill ' +
    'Note="+2 Common Knowledge (home country)/d8 Wild Die choice of Athletics (climbing), Stealth (urban) or Thievery"',
  'Hearth Knight':
    'Section=combat,skill ' +
    'Note=' +
      '"+2 Survival (freezing environments)",' +
      '"+1 Parry and +2 Called Shots vs. cold-resistant and -immune creatures"',
  'Hedge Magic':'Section=skill Note="Identify plants for herbal remedies"',
  'Hellfreeze':
    'Section=power ' +
    'Note="Cold spells do normal damage to resistant, half to immune, dbl to vulnerable, and dbl+4 to targets with weakness"',
  'Holy/Unholy Warrior':
    'Section=power ' +
    'Note="R%{spirit*2} yd Evil/good target Shaken (Spirit vs. Faith neg, multiple targets Faith -2), destroyed or wounded on critical failure"',
  'Improved Concentration':'Section=power Note="Increased Concentration effects"',
  'Improved Double Shot':'Section=feature Note="Increased Double Shot effects"',
  'Improved Focus':'Section=power Note="Increased Focus effects"',
  'Improved Giant Killer':
    'Section=combat ' +
    'Note="Ignore Armor or Size benefits of creatures of Size %{size+3}"',
  'Improved Snow Walker':'Section=combat Note="Increased Snow Walker effects"',
  'Improved Sunder':'Section=feature Note="Increased Sunder effects"',
  'Iron Guild Mercenary':
    'Section=combat,feature Note="Member of Iron Guild mercenary company","+1 Gang Up"',
  'Knight Hrafn':
    'Section=combat,feature ' +
    'Note="Increased Command effects","Member of tactician order"',
  'Legendary Storyteller':'Section=feature Note="Increased Master Storyteller effects"',
  'Library':
    'Section=skill ' +
    'Note="Owns Tomes of Lore that give %V knowledge skill points"',
  'Linguist':'Section=skill Note="Knows %V languages"',
  'Lorekeeper':'Section=skill Note="Used untrained Smarts skills at d4"',
  'Master Storyteller':
    'Section=feature ' +
    'Note="Story subjects use d8%1 for Glory awards, no penalty for critical failure"',
  'Mighty Shot':'Section=combat Note="Bow does %V%1+d6 damage"',
  'Mighty Throw':
    'Section=combat ' +
    'Note="Increase throw range by 1/2/4, +1 Strength die for short throws"',
  'Necromantic Severing':'Section=combat Note="Make Called Shots vs. undead"',
  'Noble':'Section=feature Note="TODO"',
  'Old Family':'Section=skill Note="+2 Occult"',
  'Oversized Weapon Master':
    'Section=combat Note="Use two-handed weapons with one hand"',
  'Power Surge':'Section=combat Note="Dbl damage from arcane skill attack"',
  'Reliquary (Arcanologist)':
    'Section=skill ' +
    'Note="+2 Common Knowledge (relics), use Occult to learn unattuned relic powers"',
  'Reliquary (Reliqus)':
    'Section=attributes,skill ' +
    'Note="-2 Agility (avoid trap effects)","+2 Notice (traps)"',
  'Roadwarden':
    'Section=skill Note="+2 Survival/+2 Notice (ambushes, traps, concealed weapons)"',
  'Runic Insight':'Section=power Note="+1 arcane skill die for chosen spell"',
  'Scamper':'Section=combat Note="Larger foes -1 attack"',
  'Shieldwall':'Section=combat Note="Shield benefit apples to adjacent ally"',
  'Siege Breaker':
    'Section=combat ' +
    'Note="During mass battle, -1 fortification siege bonus, Battle test for -2 (Raise -3)"',
  'Siege Mentality':
    'Section=combat ' +
    'Note="During mass battle, +1 fortification siege bonus, Battle test for +2 (Raise +3)"',
  'Sister Of Mercy':'Section=skill Note="+2 Healing/+1 Persuasion"',
  'Snow Walker':'Section=combat Note="Move %V over snow and ice"',
  'Spell Finesse (Arcane)':'Section=power Note="+1 Wild Die die on chosen spell"',
  'Spell Finesse (Armor Penetration)':'Section=power Note="Chosen spell has AP 2"',
  'Spell Finesse (Heavy Weapon)':
    'Section=power Note="Chosen spell counts as heavy weapon"',
  'Spell Finesse (Range)':'Section=power Note="Selected spell has extended range"',
  'Spell Finesse (Selective)':
    'Section=power ' +
    'Note="Protects %{arcaneSkill//2} creatures from effects of chosen area spell"',
  'Styrimathr':'Section=feature Note="Owns a Smabyrding with no ice rig"',
  'Sunder':'Section=combat Note="Attacks ignore %V Armor points"',
  'Wall Of Steel':'Section=combat Note="Foes gin no Gang Up bonus"',
  'War Cry':
    'Section=combat Note="Force Intimidation Test against all in 40 yd radius"',
  'Warm Blooded':'Section=attribute Note="+2 Vigor (resist cold)"',
  'Wood Warden':
    'Section=power Note="Can speak with normal beasts, cast <i>Beast Friend</i>"',
  'Very Rich':'Section=feature Note="Increased Rich effects"',

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
  'Engro Luck':'Section=feature Note="+1 Benny each session"',
  'Frigid Form':
    'Section=arcana ' +
    'Note="Innate casting of cold <i>Armor</i>, <i>Environmental Protection</i>, <i>Smite</i>, and <i>Speed</i>"',
  'Heat Lethargy':
    'Section=attribute,skill ' +
    'Note="-1 attribute rolls at temperatures above 52",' +
         '"-1 skill rolls at temperatures above 52"',
  'Mountain-Born':
    'Section=combat Note="No difficult terrain penalty in hills and mountains"',
  'Natural Realms':'Section=feature Note="Treat Elfhomes as wilds"',
  'Sneaky':'Section=skill Note="+2 skill step (choice of Stealth or Thievery)"',
  'Winter Soul':
    'Section=attribute,combat ' +
    'Note="+2 Vigor (cold resistance)",' +
         '"+2 Armor vs. cold attacks"'
};
Hellfrost.FEATURES =
  Object.assign({}, SWADE.FEATURES, Hellfrost.FEATURES_ADDED);
Hellfrost.GOODIES = Object.assign({}, SWADE.GOODIES);
Hellfrost.HINDRANCES_ADDED = {
  'Apprentice/Novitiate':'Severity=Minor Require=powerCount',
  'Apprentice/Novitiate+':'Severity=Major Require=powerCount',
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
Hellfrost.SPELLS_ADDED = {
  'Aim':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Description="Touched +2 attack (Raise +4) w/thrown or missile weapon for conc"',
  'Altered Senses':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Description="Touched gains Infravision or Low Light Vision (Raise both) for conc"',
  'Analyze Foe':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Description="TODO"',
  'Animate War Tree':
    'Advances=12 ' +
    'PowerPoints=8 ' +
    'Description="TODO"',
  'Battle Song':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Description="TODO"',
  'Becalm':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Description="TODO"',
  'Bladebreaker':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Description="TODO"',
  'Bless/Panic':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Description="TODO"',
  'Bridge':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Description="TODO"',
  'Champion Of The Faith':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Description="TODO"',
  'Charismatic Aura':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Description="TODO"',
  'Disease':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Description="TODO"',
  'Elemental Form':
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Description="TODO"',
  'Mimic':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Description="TODO"',
  'Mind Reader':
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Description="TODO"',
  'Negate Arcana':
    'Advances=8 ' +
    'PowerPoints=5 ' +
    'Description="TODO"',
  'Nightmare':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Description="TODO"',
  'Precognition':
    'Advances=8 ' +
    'PowerPoints=2 ' +
    'Description="TODO"',
  'Prolonged Blast':
    'Advances=8 ' +
    'PowerPoints=6 ' +
    'Description="TODO"',
  'Quake':
    'Advances=8 ' +
    'PowerPoints=6 ' +
    'Description="TODO"',
  'Refuge':
    'Advances=4 ' +
    'PowerPoints=4 ' +
    'Description="TODO"',
  'Regenerate':
    'Advances=12 ' +
    'PowerPoints=3 ' +
    'Description="TODO"',
  'Sacrifice':
    'Advances=8 ' +
    'PowerPoints=1 ' +
    'Description="TODO"',
  'Sanctuary':
    'Advances=0 ' +
    'PowerPoints=4 ' +
    'Description="TODO"',
  'Sentry':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Description="TODO"',
  'Sluggish Reflexes':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Description="TODO"',
  'Sphere Of Might':
    'Advances=8 ' +
    'PowerPoints=4 ' +
    'Description="TODO"',
  'Storm':
    'Advances=4 ' +
    'PowerPoints=5 ' +
    'Description="TODO"',
  'Strength Of The Undead':
    'Advances=8 ' +
    'PowerPoints=2 ' +
    'Description="TODO"',
  'Summon Beast':
    'Advances=8 ' +
    'PowerPoints=Special ' +
    'Description="TODO"',
  'Summon Demon':
    'Advances=0 ' +
    'PowerPoints=Special ' +
    'Description="TODO"',
  'Summon Elemental':
    'Advances=8 ' +
    'PowerPoints=4 ' +
    'Description="TODO"',
  'Summon Herald':
    'Advances=12 ' +
    'PowerPoints=8 ' +
    'Description="TODO"',
  'Summon Spirit':
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Description="TODO"',
  'Viper Weapon':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Description="TODO"',
  'Voice On The Wind':
    'Advances=0 ' +
    'PowerPoints=3 ' +
    'Description="TODO"',
  'Wandering Senses':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Description="TODO"',
  'Warding':
    'Advances=4 ' +
    'PowerPoints=5 ' +
    'Description="TODO"',
  'Water Walk':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Description="TODO"',
  'Weaken Undead':
    'Advances=8 ' +
    'PowerPoints=2 ' +
    'Description="TODO"',
  'Weapon Immunity':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Description="TODO"',
  'Wilderness Step':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Description="TODO"',
  'Zephyr':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Description="TODO"'
};
Hellfrost.POWERS = Object.assign({}, SWADE.POWERS, Hellfrost.SPELLS_ADDED);
Hellfrost.RACES = {
  'Engro':
    'Features=' +
      '"Engro Luck",Outsider,"Size -1",Sneaky,Spirited',
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
Hellfrost.SHIELDS = {
  'None':'Parry=0 Cover=0 MinStr=4 Weight=0',
  'Small Shield':'Parry=1 Cover=0 MinStr=4 Weight=8',
  'Medium Shield':'Parry=1 Cover=2 MinStr=4 Weight=12',
  'Large Shield':'Parry=2 Cover=2 MinStr=4 Weight=20'
};
Hellfrost.SKILLS = Object.assign({}, SWADE.SKILLS);
Hellfrost.WEAPONS = {
  'Unarmed':'Damage=0 MinStr=4 Weight=0 Category=Un',
  'Antler Staff':'Damage=d6 MinStr=4 Weight=10 Category=2h Parry=1',
  'Bear Claw':'Damage=d4 MinStr=4 Weight=8 Category=1h Parry=1',
  'Double Toothpick':'Damage=d6 MinStr=4 Weight=5 Category=1h',
  'Twin Toothpick':'Damage=d8 MinStr=4 Weight=5 Category=1h',
  'Boot Spikes':'Damage=d4 MinStr=4 Weight=3 Category=Un',
  'Dagger':'Damage=d4 MinStr=4 Weight=1 Category=1h',
  'Flail':'Damage=d6 MinStr=4 Weight=8 Category=1h',
  'Great Sword':'Damage=d10 MinStr=4 Weight=12 Category=2h Parry=-1',
  'Long Sword':'Damage=d8 MinStr=4 Weight=8 Category=1h',
  'Short Sword':'Damage=d6 MinStr=4 Weight=4 Category=1h',
  'Axe':'Damage=d6 MinStr=4 Weight=2 Category=1h',
  'Battle Axe':'Damage=d8 MinStr=4 Weight=10 Category=1h',
  'Great Axe':'Damage=d10 MinStr=4 Weight=15 Category=2h Parry=-1',
  'Mace':'Damage=d6 MinStr=4 Weight=4 Category=1h',
  'Maul':'Damage=d8 MinStr=4 Weight=20 Category=2h Parry=-1 AP=2',
  'Warhammer':'Damage=d6 MinStr=4 Weight=8 Category=1h AP=1',
  'Halberd':'Damage=d8 MinStr=4 Weight=15 Category=2h',
  'Lance':'Damage=d8 MinStr=4 Weight=10 Category=2h AP=2',
  'Pike':'Damage=d8 MinStr=4 Weight=25 Category=2h',
  'Long Spear':'Damage=d6 MinStr=4 Weight=5 Category=2h Parry=1',
  'Short Spear':'Damage=d6 MinStr=6 Weight=3 Category=1h Range=3',
  'Staff':'Damage=d4 MinStr=4 Weight=8 Category=2h Parry=1',
  'Throwing Axe':'Damage=d6 MinStr=4 Weight=2 Category=1h Range=3',
  'Bow':'Damage=2d6 MinStr=6 Weight=3 Category=R Range=12',
  'Long Bow':'Damage=2d6 MinStr=8 Weight=5 Category=R Range=15',
  'Crossbow':'Damage=2d6 MinStr=6 Weight=10 Category=R Range=15 AP=2',
  'Sling':'Damage=d4 MinStr=4 Weight=1 Category=1h Range=4',
  'Throwing Knife':'Damage=d4 MinStr=4 Weight=1 Category=1h Range=4'
};

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
Hellfrost.identityRules = function(rules, races, deities) {
  rules.basePlugin.identityRules(rules, races, {}, deities);
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
      QuilvynUtils.getAttrValueArray(attrs, 'Area'),
      QuilvynUtils.getAttrValue(attrs, 'Armor'),
      QuilvynUtils.getAttrValue(attrs, 'MinStr'),
      QuilvynUtils.getAttrValue(attrs, 'Weight')
    );
  else if(type == 'Deity')
    Hellfrost.deityRules(rules, name);
  else if(type == 'Edge') {
    Hellfrost.edgeRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValueArray(attrs, 'Imply'),
      QuilvynUtils.getAttrValueArray(attrs, 'Type')
    );
    Hellfrost.edgeRulesExtra(rules, name);
  } else if(type == 'Feature')
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
      QuilvynUtils.getAttrValue(attrs, 'Parry'),
      QuilvynUtils.getAttrValue(attrs, 'Cover'),
      QuilvynUtils.getAttrValue(attrs, 'MinStr'),
      QuilvynUtils.getAttrValue(attrs, 'Weight')
    );
  else if(type == 'Skill')
    Hellfrost.skillRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Attribute'),
      QuilvynUtils.getAttrValue(attrs, 'Core'),
    );
  else if(type == 'Weapon')
    Hellfrost.weaponRules(rules, name,
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
 * Defines in #rules# the rules associated with armor #name#, which covers the
 * body areas listed in #areas#, adds #armor# to the character's Toughness,
 * requires a strength of #minStr# to use effectively, and weighs #weight#.
 */
Hellfrost.armorRules = function(rules, name, areas, armor, minStr, weight) {
  rules.basePlugin.armorRules
    (rules, name, ['Medieval'], areas, armor, minStr, weight);
  // No changes needed to the rules defined by base method
};

/* Defines in #rules# the rules associated with deity #name#. */
Hellfrost.deityRules = function(rules, name) {
  rules.basePlugin.deityRules(rules, name);
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
  if(name == 'Arcane Background (Miracles)') {
    rules.defineRule('features.Connections',
      'features.Arcane Background (Miracles)', '=', '1'
    );
    rules.defineRule
      ('features.Orders', 'features.Arcane Background (Miracles)', '=', '1');
  } else if(name == 'Augment Staff (Damage)') {
    rules.defineRule('combatNotes.augmentStaff(Damage).1',
      'features.Augment Staff (Damage)', '?', null,
      'strengthModifier', '=', 'source<0 ? source : source>0 ? "+" + source : ""'
    );
    rules.defineRule('combatNotes.augmentStaff(Damage).2',
      'features.Augment Staff (Damage)', '=', '4 + source * 2'
    );
    rules.defineRule('combatNotes.augmentStaff(Damage).3',
      'features.Augment Staff (Damage)', '=', null
    );
  } else if(name == 'Augment Staff (Deflect)') {
    rules.defineRule('combatNotes.augmentStaff(Deflect).1',
      'features.Augment Staff (Deflect)', '=', '-source'
    );
  } else if(name == 'Bludgeoner') {
    rules.defineRule
      ('combatRules.bludgeoner', 'advances', '=', 'Math.floor(source/4) + 1');
    rules.defineRule('combatRules.bludgeoner.1',
      'strengthModifier', '=', 'source<0 ? source : source>0 ? "+"+source : ""'
    );
  } else if(name == 'Concentration') {
    rules.defineRule('powerNotes.concentration',
      '', '=', '2',
      'powerNotes.improvedConcentration', '+', '2'
    );
  } else if(name == 'Disciple Of Eostre Animalmother') {
    rules.defineRule('features.Beast Master',
      'features.Disciple Of Eostre Animalmother', '=', '1'
    );
  } else if(name == 'Double Shot') {
    rules.defineRule('combatNotes.doubleShot',
      '', '=', '" at -2 attack"',
      'combatNotes.improvedDoubleShot', '=', '""'
    );
  } else if(name == 'Elemental Mastery') {
    rules.defineRule
      ('powerNotes.elementalMastery.1', 'features.Elemental Mastery', '=', null);
    rules.defineRule('powerNotes.elementalMastery.2',
      'features.Elemental Mastery', '=', '"-" + source'
    );
  } else if(name == 'Focus') {
    rules.defineRule('powerNotes.focus',
      '', '=', '"-2 "',
      'powerNotes.improvedFocus', '=', '""'
    );
  } else if(name == 'Knight Hrafn') {
    rules.defineRule('combatNotes.command', 'combatNotes.knightHrafn', '+', '6');
  } else if(name == 'Library') {
    rules.defineRule
      ('skillNotes.library', 'smarts', '=', 'Math.floor(source / 2)');
    rules.defineRule('skillPoints', 'skillNotes.library', '+', null);
  } else if(name == 'Linguist') {
    rules.defineRule('skillNotes.linguist', 'smarts', '=', null);
  } else if(name == 'Master Storyteller') {
    rules.defineRule('featureNotes.masterStoryteller.1',
      '', '=', '""',
      'featureNotes.legendaryStoryteller', '=', '" (Raise +1d8 each)"'
    );
  } else if(name == 'Mighty Shot') {
    rules.defineRule('combatNotes.mightyShot', 'strength', '=', '"d" + source');
    rules.defineRule('combatNotes.mightyShot.1',
      'strengthModifier', '=', 'source>0 ? "+"+source : source<0 ? source : ""'
    );
  } else if(name == 'Snow Walker') {
    rules.defineRule('combatNotes.snowWalker',
      '', '=', '"3/4 speed"',
      'combatNotes.improvedSnowWalker', '=', '"full speed"'
    );
  } else if(name == 'Sunder') {
    rules.defineRule('combatNotes.sunder',
      '', '=', '1',
      'combatNotes.improvedSunder', '+', '1'
    );
  } else if(name == 'Very Rich') {
    rules.defineRule('featureNotes.rich',
      '', '=', '3',
      'featureNotes.veryRich', '^', '5'
    );
  } else if(name == 'Wood Warden') {
    rules.defineRule('powers.Beast Friend', 'features.Wood Warden', '=', '1');
  } else {
    rules.basePlugin.edgeRulesExtra(rules, name);
  }
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
    rules.defineRule('skillPoints', 'skillNotes.sneaky', '+', '1');
  } else if(name.match(/Human/)) {
    rules.defineRule
      ('improvementPoints', 'descriptionNotes.diverse', '+', '2');
  }
};

/*
 * Defines in #rules# the rules associated with shield #name#, which adds
 * #parry# to the character's Parry, provides #cover# cover, requires #minStr#
 * to handle, and weighs #weight#.
 */
Hellfrost.shieldRules = function(rules, name, parry, cover, minStr, weight) {
  rules.basePlugin.shieldRules
    (rules, name, ['Medieval'], parry, cover, minStr, weight);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with skill #name#, associated with
 * #attribute# (one of 'agility', 'spirit', etc.).
 */
Hellfrost.skillRules = function(rules, name, attribute, core) {
  rules.basePlugin.skillRules(rules, name, attribute, core, []);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with weapon #name#, which belongs
 * to category #category#, requires #minStr# to use effectively, and weighs
 * #weight#. The weapon does #damage# HP on a successful attack. If specified,
 * the weapon bypasses #armorPiercing# points of armor. Also if specified, the
 * weapon can be used as a ranged weapon with a range increment of #range#
 * feet, firing #rateOfFire# per round. Parry, if specified, indicates the
 * parry bonus from wielding the weapon.
 */
Hellfrost.weaponRules = function(
  rules, name, damage, minStr, weight, category, armorPiercing, range,
  rateOfFire, parry
) {
  rules.basePlugin.weaponRules(
    rules, name, ['Medieval'], damage, minStr, weight, category, armorPiercing,
    range, rateOfFire, parry
  );
  // No changes needed to the rules defined by base method
};

/* Sets #attributes#'s #attribute# attribute to a random value. */
Hellfrost.randomizeOneAttribute = function(attributes, attribute) {
  var attrs = this.applyRules(attributes);
  if(attribute == 'skills' &&
     attrs['features.Sneaky'] != null &&
     !attributes['skillAllocation.Stealth'] &&
     !attributes['skillAllocation.Thievery']) {
    attributes['skillAllocation.' + (QuilvynUtils.random(0, 1) == 0 ? 'Stealth' : 'Thievery')] = 2;
  }
  if(attribute == 'improvements' &&
     attrs['features.Diverse'] &&
     !attributes['improvementPointsAllocation.Edge'] &&
     !attributes['improvementPointsAllocation.Skills']) {
    attributes['improvementPointsAllocation.' + (QuilvynUtils.random(0, 1) == 0 ? 'Edge' : 'Skills')] = 2;
  }
  this.basePlugin.randomizeOneAttribute.apply(this, [attributes, attribute]);
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
