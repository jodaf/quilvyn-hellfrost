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
/* globals Quilvyn, QuilvynRules, QuilvynUtils, SWADE, SWD */
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
    baseRules && !baseRules.match(/deluxe|swd/i) && window.SWADE != null;

  var rules = new QuilvynRules(
    'Hellfrost - SW' + (useSwade ? 'ADE' : 'D'), Hellfrost.VERSION
  );
  Hellfrost.rules = rules;
  rules.basePlugin = useSwade ? SWADE : SWD;

  rules.defineChoice('choices', rules.basePlugin.CHOICES);
  rules.choiceEditorElements = rules.basePlugin.choiceEditorElements;
  rules.choiceRules = Hellfrost.choiceRules;
  rules.editorElements = rules.basePlugin.initialEditorElements();
  rules.getFormats = rules.basePlugin.getFormats;
  rules.getPlugins = Hellfrost.getPlugins;
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

// Individual Arcane Background skill replaced with Spellcasting
Hellfrost.ARCANAS_ADDED = {
  'Druidism':
    'Skill=Spellcasting ' +
    'Powers=' +
      '"Animate War Tree",Protection,Barrier,"Beast Friend",Bolt,' +
      '"Boost/Lower Trait",Bridge,Burrow,Deflection,"Detect/Conceal Arcana",' +
      '"Elemental Form","Elemental Manipulation",Entangle,' +
      '"Environmental Protection",Farsight,Feast,"Fog Cloud",Growth/Shrink,' +
      'Healing,Havoc,Leaping,Light/Darkness,Light/Darkness,Quake,Refuge,' +
      'Sanctuary,Sentry,"Shape Change",Sound/Silence,Smite,"Sphere Of Might",' +
      'Storm,"Summon Beast","Summon Elemental","Viper Weapon",' +
      '"Voice On The Wind","Wall Walker",Warding,Havoc,"Wilderness Step"',
  'Elementalism (Eir)':
    'Skill=Spellcasting ' +
    'Powers=' +
      'Aim,Banish,Becalm,"Beast Friend",Bolt,Deflection,' +
      '"Detect/Conceal Arcana","Elemental Form","Elemental Manipulation",' +
      '"Energy Immunity","Environmental Protection",Intangibility,' +
      'Farsight,Fatigue,Fly,Glyph,Invisibility,Havoc,Leaping,Light/Darkness,' +
      'Sloth/Speed,Sanctuary,Sentry,Sound/Silence,Slumber,"Speak Language",' +
      '"Sphere Of Might",Storm,"Summon Elemental",Telekinesis,Teleport,' +
      '"Voice On The Wind","Wandering Senses",Warding,Havoc,Zephyr',
  'Elementalism (Ertha)':
    'Skill=Spellcasting ' +
    'Powers=' +
      'Protection,Banish,Barrier,"Beast Friend",Bladebreaker,Blast,Bolt,' +
      'Bridge,Burrow,"Detect/Conceal Arcana","Elemental Form",' +
      '"Elemental Manipulation","Energy Immunity",Entangle,Glyph,' +
      'Growth/Shrink,Havoc,Lock/Unlock,Mend,"Prolonged Blast",Quake,' +
      'Refuge,Sanctuary,"Sphere Of Might","Summon Elemental","Viper Weapon",' +
      '"Wall Walker",Warding,"Weapon Immunity","Wilderness Step"',
  'Elementalism (Fyr)':
    'Skill=Spellcasting ' +
    'Powers=' +
      '"Damage Field",Banish,Barrier,Bladebreaker,Blast,Bolt,Burst,' +
      'Deflection,"Detect/Conceal Arcana","Elemental Form",' +
      '"Elemental Manipulation","Energy Immunity","Environmental Protection",' +
      'Fatigue,Glyph,"Heat Mask",Light/Darkness,"Prolonged Blast",Sanctuary,' +
      'Smite,"Sphere Of Might","Summon Elemental",Warding',
  'Elementalism (Waeter)':
    'Skill=Spellcasting ' +
    'Powers=' +
      'Banish,"Beast Friend",Bolt,"Detect/Conceal Arcana","Elemental Form",' +
      '"Elemental Manipulation","Energy Immunity","Environmental Protection",' +
      'Fatigue,"Fog Cloud",Glyph,Healing,Havoc,Sanctuary,Sloth/Speed,' +
      '"Sphere Of Might",Storm,Stun,Relief,"Summon Elemental",Warding,' +
      '"Water Walk"',
  'Heahwisardry':
    'Skill=Spellcasting ' +
    'Powers=' +
      '"Arcane Protection",Protection,"Damage Field",Banish,Barrier,' +
      'Bladebreaker,Blast,"Summon Ally",Bolt,"Boost/Lower Trait",Burst,' +
      'Deflection,"Detect/Conceal Arcana",Dispel,"Energy Immunity",Entangle,' +
      '"Environmental Protection",Farsight,Fatigue,Fear,"Fog Cloud",Glyph,' +
      'Havoc,Mimic,"Negate Arcana","Prolonged Blast",Puppet,Refuge,' +
      'Sanctuary,Slumber,Sound/Silence,Smite,Sloth/Speed,"Sphere Of Might",' +
      'Storm,Stun,"Summon Elemental",Telekinesis,Teleport,Warding,' +
      '"Weapon Immunity"',
  'Hrimwisardry':
    'Skill=Spellcasting ' +
    'Powers=' +
      'Protection,"Damage Field",Barrier,Bladebreaker,Blast,Bolt,Bridge,' +
      'Burrow,Burst,Deflection,"Detect/Conceal Arcana",Dispel,' +
      '"Elemental Form","Energy Immunity","Environmental Protection",Fatigue,' +
      'Invisibility,Havoc,Light/Darkness,"Prolonged Blast",Refuge,Sanctuary,' +
      '"Sluggish Reflexes",Smite,"Sphere Of Might",Storm,Stun,' +
      '"Summon Elemental","Voice On The Wind",Warding,Havoc,' +
      '"Wilderness Step"',
  'Rune Magic':
    'Skill=Spellcasting ' +
    'Powers=' +
      'Protection,Bladebreaker,"Weapon Immunity",' +
      'Aim,Bolt,"Boost/Lower Trait",' +
      '"Boost/Lower Trait","Gift Of Battle","Warrior\'s Gift",' +
      '"Beast Friend","Summon Beast","Viper Weapon",' +
      '"Arcane Protection","Fortune\'s Favored",Luck/Jinx,' +
      'Becalm,Bless/Panic,Slumber,' +
      'Intangibility,Growth/Shrink,"Shape Change",' +
      '"Boost/Lower Trait","Charismatic Aura",Puppet,' +
      'Burst,"Environmental Protection","Sluggish Reflexes",' +
      'Confusion,Disease,Fatigue,' +
      '"Boost/Lower Trait","Battle Song",Smite,' +
      'Dispel,"Negate Arcana",Sound/Silence,' +
      'Bridge,Burrow,Quake,' +
      '"Elemental Form","Elemental Manipulation","Summon Elemental",' +
      '"Altered Senses","Heat Mask",Light/Darkness,' +
      '"Boost/Lower Trait",Healing,Relief,' +
      '"Detect/Conceal Arcana","Object Reading",Invisibility,' +
      'Barrier,Deflection,Warding,' +
      '"Gravespeak","Speak Language","Voice On The Wind",' +
      // Quickness replaced with Sanctuary per SWADE conversion guide
      'Sanctuary,Sloth/Speed,"Wilderness Step",' +
      '"Fog Cloud",Storm,Havoc',
  'Song Magic':
    'Skill=Spellcasting ' +
    'Powers=' +
      '"Arcane Protection",Banish,"Battle Song","Beast Friend",Bless/Panic,' +
      '"Boost/Lower Trait","Charismatic Aura",Confusion,' +
      '"Detect/Conceal Arcana",Dispel,"Elemental Manipulation",Fatigue,Fear,' +
      'Healing,Lock/Unlock,Mimic,"Negate Arcana",Nightmare,Puppet,Sanctuary,' +
      'Sound/Silence,Slumber,"Speak Language",Stun,Relief,"Summon Beast",' +
      '"Voice On The Wind",Warding,"Warrior\'s Gift","Wilderness Step"'
};
Hellfrost.ARCANAS = Object.assign({}, SWADE.ARCANAS, Hellfrost.ARCANAS_ADDED);
delete Hellfrost.ARCANAS['Magic'];
delete Hellfrost.ARCANAS['Psionics'];
delete Hellfrost.ARCANAS['Weird Science'];
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
  'Eostre':'',
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
      '"Sum \'features\\.Scholar\' > 0",' +
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
      '"features.Hold The Line!"',
  'Fanaticism':
    'Type=leadership Require="advances >= 4",features.Command,features.Fervor',
  'Siege Breaker':
    'Type=leadership ' +
    'Require="advances >= 4","smarts >= 8","skills.Battle >= 8"',
  'Siege Mentality':
    'Type=leadership ' +
    'Require="advances >= 4","smarts >= 8","skills.Battle >= 8"',
  'Tactician':
    'Type=leadership ' +
    'Require="advances >= 4","smarts >= 8","skills.Battle >= 6",features.Command',
  // Power
  'Alchemy':
    'Type=power ' +
    'Require=' +
      '"advances >= 4",' +
      'powerCount,' +
      '"arcaneSkill >= 6",' +
      '"skills.Weird Science >= 6"',
  'Augment Staff (Aura)':
    'Type=power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Heahwisardry)",' +
      '"skills.Spellcasting >= 8",' +
      '"skills.Occult >= 8"',
  'Augment Staff (Damage)':
    'Type=power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Heahwisardry)",' +
      '"skills.Spellcasting >= 8",' +
      '"skills.Occult >= 8"',
  'Augment Staff (Deflect)':
    'Type=power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Heahwisardry)",' +
      '"skills.Spellcasting >= 8",' +
      '"skills.Occult >= 8"',
  'Augment Staff (Spell Store)':
    'Type=power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Heahwisardry)",' +
      '"skills.Spellcasting >= 8",' +
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
    'Require=' +
      '"advances >= 4",' +
      '"Sum \'features.Arcane Background .Elementalism\' > 0"',
  'Focus':
    'Type=power ' +
    'Require="advances >= 4",powerCount,"spirit >= 6","arcaneSkill >= 8"',
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
      '"skills.Fighting >= 6"',
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
      '"skills.Research >= 6",' +
      '"features.Illiterate == 0"',
  'Reliquary (Arcanologist)':
    'Type=professional ' +
    'Require=' +
      '"smarts >= 8",' +
      '"skills.Occult >= 8",' +
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
  // Override SW Brave prerequisite with Hellfrost's Courageous
  'Iron Will':
    'Type=social ' +
    'Require="advances >= 4","features.Courageous","features.Strong Willed"',
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
delete Hellfrost.EDGES['Brave'];
delete Hellfrost.EDGES['Elan'];
delete Hellfrost.EDGES['Filthy Rich'];
delete Hellfrost.EDGES['Martial Artist'];
delete Hellfrost.EDGES['Martial Warrior'];
delete Hellfrost.EDGES['Master Tactician'];
delete Hellfrost.EDGES['Natural Leader'];
Hellfrost.FEATURES_ADDED = {

  // Edges
  'A Few Good Men':
    'Section=combat Note="Adds one token to army in mass battles"',
  'Alchemy':'Section=arcana Note="Can create arcane devices for known spells"',
  'Arcane Background (Druidism)':
    'Section=arcana,skill ' +
    'Note="Power Count 3/Power Points 10",' +
         '"+1 arcane skill in natural environments, -1 in urban environments"',
  'Arcane Background (Elementalism (Eir))':
    'Section=arcana Note="Power Count 3/Power Points 10"',
  'Arcane Background (Elementalism (Ertha))':
    'Section=arcana Note="Power Count 3/Power Points 10"',
  'Arcane Background (Elementalism (Fyr))':
    'Section=arcana Note="Power Count 3/Power Points 10"',
  'Arcane Background (Elementalism (Waeter))':
    'Section=arcana Note="Power Count 3/Power Points 10"',
  'Arcane Background (Heahwisardry)':
    'Section=arcana,skill ' +
    'Note="Power Count 3/Power Points 10",' +
         '"-2 arcane skill, +1 per extra round taken (+%{smarts//2} max)"',
  'Arcane Background (Hrimwisardry)':
    'Section=arcana,combat,feature,skill ' +
    'Note="Power Count 2/Power Points 10",' +
         '"-4 damage from cold, +4 from heat",' +
         '"Treated with deep suspicion",' +
         '"Arcane skill modified by temperature"',
  'Arcane Background (Rune Magic)':
    'Section=arcana Note="Power Count 1/Power Points 10"',
  'Arcane Background (Song Magic)':
    'Section=arcana,skill ' +
    'Note="Power Count 3/Power Points 10",' +
         '"+1 Common Knowledge/+1 Persuasion/+1 Knowledge (folklore)"',
  'Augment Staff (Aura)':
    'Section=skill Note="Staff gives +2 Intimidation or +2 Persuasion"',
  'Augment Staff (Damage)':
    'Section=combat Note="Staff does d%{strength}%1+d%2 damage and AP %3"',
  'Augment Staff (Deflect)':'Section=combat Note="Foe ranged attacks %1"',
  'Augment Staff (Spell Store)':
    'Section=arcana Note="Staff can store %1 known spell(s), cast at +2"',
  'Bladedancer':
    'Section=combat ' +
    'Note="Can make -2 attack on every creature adjacent to running path"',
  'Blood And Guts':
    'Section=combat ' +
    'Note="Halves negative difference between tokens when attacking in mass battle"',
  // TODO implement
  'Bludgeoner':'Section=combat,skill ' +
    'Note=' +
      '"+%V sling range, sling does d%{strength}%1+d6 damage at short range",' +
      '"+1 Persuasion (engros)"',
  'Combine Spells':'Section=arcana Note="Can cast two spells simultaneously"',
  'Concentration':'Section=arcana Note="+%V to resist spell disruption"',
  'Coordinated Firepower':
    'Section=combat ' +
    'Note="R%{commandRange}%{in} Commanded extras fire at single foe simultaneously at +2, doing cumulative damage"',
  'Courageous':
    'Section=attribute Note="+2 Spirit vs. fear, -2 fear table roll"',
  'Cry Havoc!':
    'Section=combat ' +
    'Note="Can charge during Battle roll 1/mass battle, success removes 1 foe token"',
  'Death Before Dishonor':
    'Section=attribute Note="+2 Spirit (mass battle morale)"',
  'Disciple Of Dargar':
    'Section=combat ' +
    'Note="Single blow that incapacitates foe makes adjacent foes Shaken (Spirit neg)"',
  'Disciple Of Eira':
    'Section=skill Note="+2 Healing/5 companions +2 natural Healing"',
  'Disciple Of Eostre Animalmother':
    'Section=feature ' +
    'Note="Has Beast Master feature with Wild Card companion animal"',
  'Disciple Of Eostre Plantmother':
    'Section=combat,feature,skill ' +
    'Note=' +
      '"Can move normally through vegetated difficult terrain",' +
      '"Can use Champion and Holy Warrior edges with plant creatures",' +
      '"+1 Faith (vegetated areas)"',
  'Disciple Of Ertha':
    'Section=combat,skill Note="+1 Toughness","+2 Survival (underground)"',
  'Disciple Of Freo':
    'Section=combat Note="Treats all terrain as normal ground"',
  'Disciple Of Hela':
    'Section=arcana,skill ' +
    'Note="Dbl Raise on <i>Zombie</i> creates permanent undead",' +
         '"+1 Faith (graveyards)"',
  'Disciple Of Hoenir':
    'Section=skill ' +
    'Note="+1 Common Knowledge/+1 all Knowledge/Can make untrained Knowledge skills"',
  'Disciple Of Hothar':'Section=attribute Note="+2 vs. mind effects"',
  'Disciple Of Kenaz':
    'Section=attribute,combat ' +
    'Note=' +
      '"+2 Vigor (resist heat)",' +
      '"+4 Armor vs. heat damage, can magically heat metal weapon for +2 damage vs. cold resistant and +4 vs cold immune"',
  'Disciple Of Maera':
    'Section=arcana Note="Can cast off-list spell at -2, +2 <i>Dispel</i>"',
  'Disciple Of Nauthiz':
    'Section=skill ' +
    'Note="Can reroll 1s on Gambling, Stealth, and Thievery; suffers Fatigue for 1 dy if reroll is 1"',
  'Disciple Of Neorthe':
    'Section=feature ' +
    'Note="Can survive on half water, can survive drowning for %{vigor} rd"',
  'Disciple Of Niht':
    'Section=feature ' +
    'Note="No penalty in dim and dark illumination, -2 in pitch dark"',
  'Disciple Of The Norns':'Section=arcana Note="Can spend benny for augury"',
  'Disciple Of Rigr':
    'Section=feature ' +
    'Note="Needs only 3 hrs sleep, suffers half penalty for missed sleep, counts as active guard when asleep"',
  'Disciple Of Scaetha':
    'Section=arcana,combat ' +
    'Note="+1 casting vs. undead",' +
         '"+2 damage vs. undead"',
  'Disciple Of Sigel':
    'Section=combat,feature,skill ' +
    'Note="+2 vs. invisible foes",' +
         '"Halves illumination penalty vs. heat-producing foes",' +
         '"+2 Notice (detect hidden objects and creatures)"',
  'Disciple Of The Unknowable One':
    'Section=combat,skill ' +
    'Note=' +
      '"+1 on Tricks/+1 vs. Tricks",' +
      '"+1 Taunt/+1 vs. Taunt"',
  'Disciple Of Thrym':
    'Section=arcana Note="More effective casting in cold environment"',
  'Disciple Of Thunor':
    'Section=attribute ' +
    'Note="+1 Vigor (resist hot and cold), suffers half falling damage"',
  'Disciple Of Tiw':
    'Section=arcana,feature ' +
    'Note="Can cast and attack in single action",' +
         '"+1 Rank for acquiring combat edges"',
  'Disciple Of Ullr':
    'Section=combat,skill ' +
    'Note="Can move half Pace before using Marksman with bow",' +
         '"+2 Stealth (wilderness)/+2 Survival (wilderness)"',
  'Disciple Of Vali':'Section=feature Note="Immune to disease and poison"',
  'Disciple Of Var':
    'Section=feature Note="Can sell goods at 50% price (Raise 75%)"',
  'Double Shot':'Section=combat Note="Can fire two arrows at one target%1"',
  'Elemental Mastery':'Section=arcana Note="Know %1 elements, cast at %2"',
  'Fanaticism':
    'Section=combat ' +
    'Note="R%{commandRange}%{in} Commanded extras +2 vs fear, -2 fear table"',
  'Favored Foe':
    'Section=combat ' +
    'Note="+1 Parry and d8 attack raise against chosen creature type"',
  'Focus':
    'Section=arcana ' +
    'Note="Immediate %1Spirit roll to recover from Shaken due to spell failure or siphoning"',
  'Gray Legionary':
    'Section=feature Note="Member of Gray Legionary mercenary company"',
  'Guild Thief':
    'Section=skill ' +
    'Note="+2 Common Knowledge (home country)/d8 Wild Die choice of Athletics (climbing), Stealth (urban) or Thievery"',
  'Hearth Knight':
    'Section=combat,skill ' +
    'Note=' +
      '"+2 Survival (freezing environments)",' +
      '"+1 Parry and +2 called shots vs. cold-resistant and -immune creatures"',
  'Hedge Magic':'Section=skill Note="Can identify plants for herbal remedies"',
  'Hellfreeze':
    'Section=arcana ' +
    'Note="Cold spells do normal damage to resistant, half to immune, dbl to vulnerable, and dbl+4 to targets with weakness"',
  'Holy/Unholy Warrior':
    'Section=arcana ' +
    'Note="R%{spirit}%{in} Evil/good target Shaken (Spirit vs. Faith neg, multiple targets Faith -2), destroyed or wounded on critical failure"',
  'Improved Concentration':
    'Section=arcana Note="Increased Concentration effects"',
  'Improved Double Shot':'Section=combat Note="Increased Double Shot effects"',
  'Improved Focus':'Section=arcana Note="Increased Focus effects"',
  'Improved Giant Killer':
    'Section=combat ' +
    'Note="Ignores Armor or Size benefits of creatures of Size %{size+3} or greater"',
  'Improved Snow Walker':'Section=combat Note="Increased Snow Walker effects"',
  'Improved Sunder':'Section=combat Note="Increased Sunder effects"',
  'Iron Guild Mercenary':
    'Section=combat,feature ' +
    'Note="Member of Iron Guild mercenary company","+1 using Gang Up"',
  'Knight Hrafn':
    'Section=combat,feature,skill ' +
    'Note="Increased Command effects",' +
         '"Member of tactician order",' +
         '"+1 Battle"',
  'Legendary Storyteller':
    'Section=feature Note="Increased Master Storyteller effects"',
  // TODO implement in randomizeOneAttribute
  'Library':'Section=skill Note="+%V Skill Points (choice of Knowledge)"',
  'Linguist':'Section=skill Note="Knows %V languages"',
  'Lorekeeper':'Section=skill Note="d4 on untrained Smarts skills"',
  'Master Storyteller':
    'Section=feature ' +
    'Note="Story subjects use d8%1 for Glory awards, no penalty for critical failure"',
  // TODO implement
  'Mighty Shot':'Section=combat Note="Bow does %V%1+d6 damage"',
  // TODO implement
  'Mighty Throw':
    'Section=combat ' +
    'Note="+1 thrown weapon range, +1 Strength die for short throws"',
  'Necromantic Severing':
    'Section=combat Note="Can make called shots vs. undead"',
  'Noble':'Section=feature,skill Note="Has Rich feature","+2 Persuasion"',
  'Old Family':'Section=skill Note="+2 Occult"',
  'Oversized Weapon Master':
    'Section=combat Note="Can use two-handed weapons with one hand"',
  'Power Surge':'Section=combat Note="Dbl damage from arcane skill attack"',
  'Reliquary (Arcanologist)':
    'Section=skill ' +
    'Note="+2 Common Knowledge (relics)/+2 Knowledge (relics)/Can use Occult to learn unattuned relic powers"',
  'Reliquary (Reliqus)':
    'Section=attribute,skill ' +
    'Note="Test Agility-2 to avoid trap effects",' +
         '"+2 Notice (traps)/+2 disarm traps"',
  'Roadwarden':
    'Section=skill ' +
    'Note="+2 Survival/+2 Notice (ambushes, traps, concealed weapons)"',
  'Runic Insight':
    'Section=arcana Note="+1 arcane skill die for spells of %1 chosen runes"',
  'Scamper':'Section=combat Note="Larger foes -1 attack"',
  'Shieldwall':'Section=combat Note="Shield benefit apples to adjacent ally"',
  'Siege Breaker':
    'Section=combat ' +
    'Note="-1 fortification siege bonus during mass battle, test Battle for -2 (Raise -3)"',
  'Siege Mentality':
    'Section=combat ' +
    'Note="+1 fortification siege bonus during mass battle, test Battle for +2 (Raise +3)"',
  'Sister Of Mercy':'Section=skill Note="+2 Healing/+1 Persuasion"',
  'Snow Walker':'Section=combat Note="Moves %V over snow and ice"',
  'Spell Finesse (Arcane)':
    'Section=arcana Note="+1 Wild Die die on chosen spell skill"',
  'Spell Finesse (Armor Penetration)':
    'Section=arcana Note="Chosen spell has AP 2"',
  'Spell Finesse (Heavy Weapon)':
    'Section=arcana Note="Chosen spell counts as heavy weapon"',
  'Spell Finesse (Range)':
    'Section=arcana Note="Chosen spell has extended range"',
  'Spell Finesse (Selective)':
    'Section=arcana ' +
    'Note="Can exclude %{arcaneSkill//2} creatures from effects of chosen area spell"',
  'Styrimathr':'Section=feature Note="Owns a Smabyrding"',
  'Sunder':'Section=combat Note="+%V AP with any weapon"',
  'Tactician':
    'Section=combat ' +
    'Note="R%{commandRange}%{in} Make Battle test before combat, receive 1 Action Card per success and raise to distribute to commanded extras"',
  'Wall Of Steel':'Section=combat Note="Foes gain no Gang Up bonus"',
  'War Cry':
    'Section=combat Note="Make Intimidation test against all in 4%{in} radius"',
  'Warm Blooded':'Section=attribute Note="+2 Vigor (resist cold)"',
  'Wood Warden':
    'Section=arcana ' +
    'Note="Can speak with normal beasts, cast <i>Beast Friend</i>"',
  'Very Rich':'Section=feature Note="Increased Rich effects"',

  // Hindrances
  'Apprentice/Novitiate':
    'Section=skill Note="Maximum starting arcane skill d6"',
  'Apprentice/Novitiate+':'Section=arcana Note="-1 Power Count"',
  'Black Sheep':
    'Section=feature,skill ' +
    'Note="Ostracized by magocratic nobility",' +
         '"-2 Persuasion (heahwisards)"',
  'Cold Blooded':'Section=attribute Note="-2 Vigor (resist cold)"',
  'God Cursed+':
    'Section=feature ' +
    'Note="Beneficial spells from god\'s cleric fail, harmful spells do +2 damage and negate arcane resistance"',
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
    'Note="Innate casting on self of cold <i>Environmental Protection</i>, <i>Protection</i>, <i>Smite</i>, and <i>Speed</i>"',
  'Heat Lethargy':
    'Section=attribute,skill ' +
    'Note="-1 attribute rolls at temperatures above 52",' +
         '"-1 skill rolls at temperatures above 52"',
  'Mountain-Born':
    'Section=combat Note="No difficult terrain penalty in hills and mountains"',
  'Natural Realms':'Section=feature Note="Treats Elfhomes as wilds"',
  'Sneaky':
    'Section=skill Note="+2 Skill Points (choice of Stealth or Thievery)"',
  'Winter Soul':
    'Section=attribute,combat ' +
    'Note="+2 Vigor (resist cold)",' +
         '"+2 Armor vs. cold attacks"'
};
Hellfrost.FEATURES =
  Object.assign({}, SWADE.FEATURES, Hellfrost.FEATURES_ADDED);
Hellfrost.GOODIES = Object.assign({}, SWADE.GOODIES);
Hellfrost.HINDRANCES_ADDED = {
  'Apprentice/Novitiate':
    'Severity=Minor Require=powerCount,"features.Apprentice/Novitiate+ == 0"',
  'Apprentice/Novitiate+':
    'Severity=Major Require=powerCount,"features.Apprentice/Novitiate == 0"',
  'Black Sheep':'Severity=Minor',
  'Cold Blooded':'Severity=Minor',
  'God Cursed+':'Severity=Major',
  'Magic Forbiddance+':'Severity=Major',
  'Necromantic Weakness':
    'Severity=Minor Require="features.Necromantic Weakness+ == 0"',
  'Necromantic Weakness+':
    'Severity=Major Require="features.Necromantic Weakness == 0"',
  'Orders':'Severity=Minor'
};
Hellfrost.HINDRANCES =
  Object.assign({}, SWADE.HINDRANCES, Hellfrost.HINDRANCES_ADDED);
Hellfrost.SPELLS_ADDED = {
  'Aim':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Description="Touched +2 attack (Raise +4) w/thrown or missile weapon for 5 rd"',
  'Altered Senses':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Description="Touched gains Infravision or Low Light Vision (Raise both) for 10 min"',
  'Analyze Foe':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Description=' +
      '"Self knows number of edges and highest attack skill of target (Raise names of edges and attack skill dice)"',
  'Animate War Tree':
    'Advances=12 ' +
    'PowerPoints=8 ' +
    'Description="Touched 30\' tree animates for 5 rd"',
  'Battle Song':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Description=' +
      '"Creatures in 4%{in} gain Berserk edge for conc (Spirit neg) for 5 rd"',
  'Becalm':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Description="Target ship suffers half speed for 1 dy"',
  'Bladebreaker':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Description=' +
      '"R%{smarts}%{in} Target weapon destroyed (Weapon die type neg)"',
  'Bless/Panic':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Description=' +
      '"Allies in %{spirit}%{in} gain +2 Spirit vs. fear (Raise +4) for 10 min"',
  'Bridge':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Description=' +
      '"Creates horizontal surface 0.5%{in} wide by 2%{in} long for 5 rd"',
  'Champion Of The Faith':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Description="Self gains Champion or Holy Warrior edge for 5 rd"',
  'Charismatic Aura':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Description="Self gains +1 Persuasion (Raise +2) for 10 min"',
  'Disease':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Description="R%{spirit}%{in} Target suffers disease (Vigor neg)"',
  'Elemental Form':
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Description="Self gains elemental form abilities for 5 rd"',
  'Energy Immunity':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Description=' +
      '"Touched takes half damage (Raise no damage) from chosen energy attack for 5 rd"',
  'Enhance Undead':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Description="R%{smarts}%{in} Undead targets gain advance benefit"',
  'Fatigue':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Description=' +
      '"R12/24/48 4%{in} radius (Raise 6%{in}) inflicts Fatigue (Vigor neg)"',
  'Feast':
    'Advances=0 ' +
    'PowerPoints=5 ' +
    'Description="R%{smarts} Creates %{((advances//4)+1)*5} lb of basic food"',
  'Fog Cloud':
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Description=' +
      '"%{(advances//4)+1} mile fog reduces lighting 2 levels for 1 hr"',
  "Fortune's Favored":
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Description="Target can reroll failed benny-purchased reroll for 5 rd"',
  'Gift Of Battle':
    'Advances=0 ' +
    'PowerPoints=4 ' +
    'Description="Touched gains leadership edge (Raise 2 edges) for 1 hr"',
  'Glyph':
    'Advances=8 ' +
    'PowerPoints=4 ' +
    'Description="Glyph stores spell effects until triggered"',
  'Gravespeak':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Description="Self can ask spirit %{spirit} questions"',
  'Greater Zombie':
    'Advances=12 ' +
    'PowerPoints=4 ' +
    'Description="R%{smarts}%{in} Animates and controls corpse for 1 hr"',
  'Heat Mask':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Description="Touched invisible to infravision for 1 h4"',
  'Leaping':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Description="Touched gains dbl jumping distance (Raise x4) for 5 rd"',
  'Lock/Unlock':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Description=' +
      '"Locks touched w/-2 pick penalty and +2 Toughness (Raise -4 and +4) or unlocks touched normal lock"',
  'Luck/Jinx':
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Description="Touched takes the best/worst of two Trait rolls for 5 rd"',
  'Mend':
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Description="Repairs damage done to touched wooden vehicle w/in past hr"',
  'Mimic':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Description=' +
      '"R%{spirit}%{in} Self knows spell used by another for use w/in 1 hr"',
  'Mind Rider':
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Description="Self can use target\'s senses for 1 hr (Spirit neg)"',
  'Negate Arcana':
    'Advances=8 ' +
    'PowerPoints=5 ' +
    'Description="R%{smarts}%{in} 4%{in} radius suppresses magic for 1 hr"',
  'Nightmare':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Description=' +
      '"R%{smarts} miles Target loses benefit of sleep, becomes frightened (Spirit neg)"',
  'Precognition':
    'Advances=8 ' +
    'PowerPoints=2 ' +
    'Description="Self can rearrange two Action Cards (Raise 4) next rd"',
  'Prolonged Blast':
    'Advances=8 ' +
    'PowerPoints=6 ' +
    'Description=' +
      '"R%{smarts*2}%{in} Choice of 1%{in} or 2%{in} radius inflicts 2d6 damage (Raise 3d6) for 5 rd"',
  'Quake':
    'Advances=8 ' +
    'PowerPoints=6 ' +
    'Description=' +
      '"R%{smarts*3}%{in} 6%{in} radius inflicts 2d10 damage (Agility neg)"',
  'Refuge':
    'Advances=4 ' +
    'PowerPoints=4 ' +
    'Description=' +
      '"R%{smarts}%{in} 10\'x6\' shelter gives +2 Vigor vs. cold (Raise +4) for 12 hr"',
  'Regenerate':
    'Advances=12 ' +
    'PowerPoints=3 ' +
    'Description="Touched gains free -2 Soak roll (Raise -0) for 5 rd"',
  'Sacrifice':
    'Advances=8 ' +
    'PowerPoints=1 ' +
    'Description="Self gains +1 arcane skill per victim Spirit die for 5 rd"',
  'Sanctuary':
    'Advances=0 ' +
    'PowerPoints=4 ' +
    'Description="Self returns to safe location"',
  'Sentry':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Description=' +
      '"R%{smarts*2}%{in} Creates overnight ghostly sentry or object alarm"',
  'Sluggish Reflexes':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Description=' +
      '"R%{smarts*2}%{in} Target draws 1 fewer Action Card or takes the worst of 2 cards for 5 rd"',
  'Sphere Of Might':
    'Advances=8 ' +
    'PowerPoints=4 ' +
    'Description="$%{smarts}%{in} 1%{in} sphere around target inflicts -1 attacks (Raise -2), attacks as d%{arcaneSkill} Fighting doing d%{arcaneSkill}+d4 damge (Raise d%{arcaneSkill}+d8)"',
  'Storm':
    'Advances=4 ' +
    'PowerPoints=5 ' +
    'Description=' +
      '"Creates or dissipates 10 mile lightning storm or blizzard for 1 hr"',
  'Strength Of The Undead':
    'Advances=8 ' +
    'PowerPoints=2 ' +
    'Description=' +
      '"Self mimics touched undead\'s power (Raise 2 powers) for 5 rd"',
  'Summon Beast':
    'Advances=8 ' +
    'PowerPoints=Special ' +
    'Description=' +
      '"R%{smarts*2}%{in} Self controls summoned beast actions for 10 min"',
  'Summon Demon':
    'Advances=0 ' +
    'PowerPoints=Special ' +
    'Description="R%{smarts*2}%{in} Brings demon from the Abyss for 1 hr"',
  'Summon Elemental':
    'Advances=8 ' +
    'PowerPoints=4 ' +
    'Description=' +
      '"R%{smarts*2}%{in} Self controls summoned elemental actions for 5 rd"',
  'Summon Herald':
    'Advances=12 ' +
    'PowerPoints=8 ' +
    'Description="R%{smarts*2} Brings herald of deity for support"',
  'Viper Weapon':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Description=' +
      '"R%{smarts*2}%{in} Transforms target weapon into viper until slain"',
  'Voice On The Wind':
    'Advances=0 ' +
    'PowerPoints=3 ' +
    'Description=' +
      '"R%{smarts*50} miles Transmits %{advances//4*10}-word message to known target"',
  'Wandering Senses':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Description="R%{smarts*10}%{in} Self senses remotely for 10 min"',
  'Warding':
    'Advances=4 ' +
    'PowerPoints=5 ' +
    'Description=' +
      '"Bars specified creature type from 4%{in} radius (Raise 6%{in} radius) for 1 hr"',
  'Water Walk':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Description="Touched can traverse calm water for 10 min"',
  'Weaken Undead':
    'Advances=8 ' +
    'PowerPoints=2 ' +
    'Description="R%{spirit}%{in} Target undead loses undead ability for 5 rd"',
  'Weapon Immunity':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Description="Touched takes half damage (Raise no damage) from specified weapon for 5 rd"',
  'Wilderness Step':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Description="Touched treats all terrain as normal for 1 h4"',
  'Zephyr':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Description="Creates moderate wind for 1 dy"'
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
Hellfrost.SKILLS_ADDED = {
  // Individual Arcane Background skill replaced with Spellcasting
};
Hellfrost.SKILLS = Object.assign({}, SWADE.SKILLS, Hellfrost.SKILLS_ADDED);
Hellfrost.WEAPONS = {
  'Unarmed':'Damage=Str+0 MinStr=4 Weight=0 Category=Un',
  'Antler Staff':'Damage=Str+d6 MinStr=4 Weight=10 Category=2h Parry=1',
  'Bear Claw':'Damage=Str+d4 MinStr=4 Weight=8 Category=1h Parry=1',
  'Double Toothpick':'Damage=Str+d6 MinStr=4 Weight=5 Category=1h',
  'Twin Toothpick':'Damage=Str+d8 MinStr=4 Weight=5 Category=1h',
  'Boot Spikes':'Damage=Str+d4 MinStr=4 Weight=3 Category=Un',
  'Dagger':'Damage=Str+d4 MinStr=4 Weight=1 Category=1h',
  'Flail':'Damage=Str+d6 MinStr=4 Weight=8 Category=1h',
  'Great Sword':'Damage=Str+d10 MinStr=4 Weight=12 Category=2h Parry=-1',
  'Long Sword':'Damage=Str+d8 MinStr=4 Weight=8 Category=1h',
  'Short Sword':'Damage=Str+d6 MinStr=4 Weight=4 Category=1h',
  'Axe':'Damage=Str+d6 MinStr=4 Weight=2 Category=1h',
  'Battle Axe':'Damage=Str+d8 MinStr=4 Weight=10 Category=1h',
  'Great Axe':'Damage=Str+d10 MinStr=4 Weight=15 Category=2h Parry=-1',
  'Mace':'Damage=Str+d6 MinStr=4 Weight=4 Category=1h',
  'Maul':'Damage=Str+d8 MinStr=4 Weight=20 Category=2h Parry=-1 AP=2',
  'Warhammer':'Damage=Str+d6 MinStr=4 Weight=8 Category=1h AP=1',
  'Halberd':'Damage=Str+d8 MinStr=4 Weight=15 Category=2h',
  'Lance':'Damage=Str+d8 MinStr=4 Weight=10 Category=2h AP=2',
  'Pike':'Damage=Str+d8 MinStr=4 Weight=25 Category=2h',
  'Long Spear':'Damage=Str+d6 MinStr=4 Weight=5 Category=2h Parry=1',
  'Short Spear':'Damage=Str+d6 MinStr=6 Weight=3 Category=1h Range=3',
  'Staff':'Damage=Str+d4 MinStr=4 Weight=8 Category=2h Parry=1',
  'Throwing Axe':'Damage=Str+d6 MinStr=4 Weight=2 Category=1h Range=3',
  'Bow':'Damage=2d6 MinStr=6 Weight=3 Category=R Range=12',
  'Long Bow':'Damage=2d6 MinStr=8 Weight=5 Category=R Range=15',
  'Crossbow':'Damage=2d6 MinStr=6 Weight=10 Category=R Range=15 AP=2',
  'Sling':'Damage=Str+d4 MinStr=4 Weight=1 Category=1h Range=4',
  'Throwing Knife':'Damage=Str+d4 MinStr=4 Weight=1 Category=1h Range=4'
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
      QuilvynUtils.getAttrValue(attrs, 'Skill'),
      QuilvynUtils.getAttrValueArray(attrs, 'Powers')
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
      QuilvynUtils.getAttrValue(attrs, 'Core')
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
 * which draws on skill #skill# when casting and allows access to the list of
 * powers #powers#.
 */
Hellfrost.arcanaRules = function(rules, name, skill, powers) {
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
  // Add backdoor to allow testing multiple disciple edges w/1 character
  if(requires.filter(x => x.includes('deity')).length > 0) {
    var note = 'validationNotes.' + name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '') + 'Edge';
    rules.defineRule(note,
      'notes', '+', 'source.includes("+IGNORE-DEITY-EDGE-PREREQ") ? 1 : null'
    );
  }
};

/*
 * Defines in #rules# the rules associated with edge #name# that cannot be
 * derived directly from the attributes passed to edgeRules.
 */
Hellfrost.edgeRulesExtra = function(rules, name) {
  var note;
  if(name == 'Arcane Background (Druidism)') {
    rules.defineRule
      ('powerCount', 'arcanaNotes.arcaneBackground(Druidism)', '+=', '3');
    rules.defineRule
      ('powerPoints', 'arcanaNotes.arcaneBackground(Druidism)', '+=', '10');
  } else if(name.match(/Arcane Background .Elementalism/)) {
    note = 'arcanaNotes.a' + name.substring(1).replaceAll(' ', '');
    rules.defineRule('powerCount', note, '+=', '3');
    rules.defineRule('powerPoints', note, '+=', '10');
  } else if(name == 'Arcane Background (Heahwisardry)') {
    rules.defineRule
      ('powerCount', 'arcanaNotes.arcaneBackground(Heahwisardry)', '+=', '3');
    rules.defineRule
      ('powerPoints', 'arcanaNotes.arcaneBackground(Heahwisardry)', '+=', '10');
  } else if(name == 'Arcane Background (Hrimwisardry)') {
    rules.defineRule
      ('powerCount', 'arcanaNotes.arcaneBackground(Hrimwisardry)', '+=', '2');
    rules.defineRule
      ('powerPoints', 'arcanaNotes.arcaneBackground(Hrimwisardry)', '+=', '10');
  } else if(name == 'Arcane Background (Miracles)') {
    rules.defineRule('features.Connections',
      'features.Arcane Background (Miracles)', '=', '1'
    );
    rules.defineRule
      ('features.Orders', 'features.Arcane Background (Miracles)', '=', '1');
  } else if(name == 'Arcane Background (Rune Magic)') {
    rules.defineRule
      ('powerCount', 'arcanaNotes.arcaneBackground(RuneMagic)', '+=', '1');
    rules.defineRule
      ('powerPoints', 'arcanaNotes.arcaneBackground(RuneMagic)', '+=', '10');
  } else if(name == 'Arcane Background (Song Magic)') {
    rules.defineRule
      ('powerCount', 'arcanaNotes.arcaneBackground(SongMagic)', '+=', '3');
    rules.defineRule
      ('powerPoints', 'arcanaNotes.arcaneBackground(SongMagic)', '+=', '10');
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
  } else if(name == 'Augment Staff (Spell Store)') {
    rules.defineRule('arcanaNotes.augmentStaff(SpellStore).1',
      'features.Augment Staff (Spell Store)', '=', null
    );
  } else if(name == 'Bludgeoner') {
    rules.defineRule
      ('combatNotes.bludgeoner', 'advances', '=', 'Math.floor(source/4) + 1');
    rules.defineRule('combatNotes.bludgeoner.1',
      'features.Bludgeoner', '?', null,
      'strengthModifier', '=', 'source<0 ? source : source>0 ? "+"+source : ""'
    );
  } else if(name == 'Concentration') {
    rules.defineRule('arcanaNotes.concentration',
      '', '=', '2',
      'arcanaNotes.improvedConcentration', '+', '2'
    );
  } else if(name == 'Disciple Of Eostre Animalmother') {
    rules.defineRule('features.Beast Master',
      'features.Disciple Of Eostre Animalmother', '=', '1'
    );
  } else if(name == 'Double Shot') {
    rules.defineRule('combatNotes.doubleShot.1',
      'features.Double Shot', '=', '" at -2 attack"',
      'combatNotes.improvedDoubleShot', '=', '""'
    );
  } else if(name == 'Elemental Mastery') {
    rules.defineRule('arcanaNotes.elementalMastery.1',
      'features.Elemental Mastery', '=', 'source + 1'
    );
    rules.defineRule('arcanaNotes.elementalMastery.2',
      'features.Elemental Mastery', '=', 'source == 3 ? "-0" : -source'
    );
  } else if(name == 'Focus') {
    rules.defineRule('arcanaNotes.focus.1',
      'features.Focus', '=', '"-2 "',
      'arcanaNotes.improvedFocus', '=', '""'
    );
  } else if(name == 'Knight Hrafn') {
    rules.defineRule('commandRange', 'combatNotes.knightHrafn', '+', '1');
  } else if(name == 'Library') {
    rules.defineRule
      ('skillNotes.library', 'smarts', '=', 'Math.floor(source / 2)');
    rules.defineRule('skillPoints', 'skillNotes.library', '+', null);
  } else if(name == 'Linguist') {
    rules.defineRule('skillNotes.linguist', 'smarts', '=', null);
  } else if(name == 'Master Storyteller') {
    rules.defineRule('featureNotes.masterStoryteller.1',
      'features.Master Storyteller', '=', '""',
      'featureNotes.legendaryStoryteller', '=', '" (Raise +1d8 each)"'
    );
  } else if(name == 'Mighty Shot') {
    rules.defineRule('combatNotes.mightyShot', 'strength', '=', '"d" + source');
    rules.defineRule('combatNotes.mightyShot.1',
      'features.Mighty Shot', '?', null,
      'strengthModifier', '=', 'source>0 ? "+"+source : source<0 ? source : ""'
    );
  } else if(name == 'Noble') {
    rules.defineRule('features.Rich', 'featureNotes.noble', '=', '1');
  } else if(name == 'Runic Insight') {
    rules.defineRule('arcanaNotes.runicInsight.1',
      'features.Runic Insight', '=', null
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
  } else if(name == 'Tactician') {
    ; // empty; overrides basePlugin computation
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
    rules.defineRule('skillPoints', 'skillNotes.sneaky', '+', '2');
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

/* Returns an array of plugins upon which this one depends. */
Hellfrost.getPlugins = function() {
  var result = [this.basePlugin].concat(this.basePlugin.getPlugins());
  return result;
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
// https://drive.google.com/file/d/1XalBepGyW5GRts_8hsYE_UPLVnwnkU1I/view
// https://drive.google.com/file/d/10BnsW6778l1XwLB93p52AwBcrrSJmpsL/view
