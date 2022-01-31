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
    'concept:Concept,select-one,concepts', 'deity:Deity,select-one,deitys'
  );

  Hellfrost.ARCANAS =
    Object.assign({}, rules.basePlugin.ARCANAS, Hellfrost.ARCANAS_ADDED);
  delete Hellfrost.ARCANAS['Magic'];
  delete Hellfrost.ARCANAS['Psionics'];
  delete Hellfrost.ARCANAS['Super Powers'];
  delete Hellfrost.ARCANAS['Weird Science'];
  Hellfrost.EDGES =
    Object.assign({}, rules.basePlugin.EDGES, Hellfrost.EDGES_ADDED);
  delete Hellfrost.EDGES['Ace'];
  delete Hellfrost.EDGES['Arcane Background (Magic)'];
  delete Hellfrost.EDGES['Arcane Background (Psionics)'];
  delete Hellfrost.EDGES['Arcane Background (Super Powers)'];
  delete Hellfrost.EDGES['Arcane Background (Weird Science)'];
  Hellfrost.FEATURES =
    Object.assign({}, rules.basePlugin.FEATURES, Hellfrost.FEATURES_ADDED);
  Hellfrost.GOODIES = Object.assign({}, rules.basePlugin.GOODIES);
  Hellfrost.HINDRANCES =
    Object.assign({}, rules.basePlugin.HINDRANCES, Hellfrost.HINDRANCES_ADDED);
  Hellfrost.POWERS =
    Object.assign({}, rules.basePlugin.POWERS, Hellfrost.POWERS_ADDED);
  Hellfrost.SKILLS =
    Object.assign({}, rules.basePlugin.SKILLS, Hellfrost.SKILLS_ADDED);

  if(useSwade) {
    Hellfrost.ARCANAS = Hellfrost.SWD2SWADE(Hellfrost.ARCANAS);
    Hellfrost.CONCEPTS = Hellfrost.SWD2SWADE(Hellfrost.CONCEPTS);
    Hellfrost.DEITIES = Hellfrost.SWD2SWADE(Hellfrost.DEITIES);
    Hellfrost.EDGES = Hellfrost.SWD2SWADE(Hellfrost.EDGES);
    Hellfrost.FEATURES = Hellfrost.SWD2SWADE(Hellfrost.FEATURES);
    Hellfrost.GOODIES = Hellfrost.SWD2SWADE(Hellfrost.GOODIES);
    Hellfrost.HINDRANCES = Hellfrost.SWD2SWADE(Hellfrost.HINDRANCES);
    Hellfrost.POWERS = Hellfrost.SWD2SWADE(Hellfrost.POWERS);
    Hellfrost.RACES = Hellfrost.SWD2SWADE(Hellfrost.RACES);
    Hellfrost.SKILLS = Hellfrost.SWD2SWADE(Hellfrost.SKILLS);
  }

  Hellfrost.attributeRules(rules);
  Hellfrost.combatRules
    (rules, Hellfrost.ARMORS, Hellfrost.SHIELDS, Hellfrost.WEAPONS);
  Hellfrost.arcaneRules(rules, Hellfrost.ARCANAS, Hellfrost.POWERS);
  Hellfrost.talentRules
    (rules, Hellfrost.EDGES, Hellfrost.FEATURES, Hellfrost.GOODIES,
     Hellfrost.HINDRANCES, Hellfrost.LANGUAGES, Hellfrost.SKILLS);
  Hellfrost.identityRules
    (rules, Hellfrost.RACES, Hellfrost.CONCEPTS, Hellfrost.DEITIES);

  Quilvyn.addRuleSet(rules);

}

Hellfrost.VERSION = '2.3.1.0';

/*
 * Spell list changes from errata:
 *   Remove Decipher from Nauthiz
 *   Wall Of Might => Sphere Of Might
 */
Hellfrost.ARCANAS_ADDED = {
  'Druidism':
    'Skill=Druidism ' +
    'Powers=' +
      '"Animate War Tree",Armor,Barrier,"Beast Friend",Bolt,' +
      '"Boost/Lower Trait",Bridge,Burrow,Deflection,Detect/Conceal,' +
      '"Elemental Form","Elemental Manipulation",Entangle,' +
      '"Environmental Protection",Farsight,Fatigue,Feast,"Fog Cloud",' +
      'Growth/Shrink,Healing,Knockdown,Leaping,Light,Obscure,Quake,Refuge,' +
      'Sanctuary,Sentry,"Shape Change",Silence,Smite,"Sphere Of Might",Storm,' +
      '"Summon Beast","Summon Elemental","Viper Weapon","Voice On The Wind",' +
      '"Wall Walker",Warding,Whirlwind,"Wilderness Step"',
  'Elementalism (Eir)':
    'Skill=Elementalism ' +
    'Powers=' +
      'Aim,Banish,Becalm,"Beast Friend",Bolt,Deflection,Detect/Conceal,' +
      '"Elemental Form","Elemental Manipulation","Energy Immunity",' +
      '"Environmental Protection",Etherealness/Corporealness,Farsight,' +
      'Fatigue,Fly,Glyph,Invisibility,Knockdown,Leaping,Obscure,Quickness,' +
      'Sanctuary,Sentry,Silence,Slumber,"Speak Language","Sphere Of Might",' +
      'Storm,"Summon Elemental",Telekinesis,Teleport,"Voice On The Wind",' +
      '"Wandering Senses",Warding,Whirlwind,Zephyr',
  'Elementalism (Ertha)':
    'Skill=Elementalism ' +
    'Powers=' +
      'Armor,Banish,Barrier,"Beast Friend",Bladebreaker,Blast,Bolt,Bridge,' +
      'Burrow,Detect/Conceal,"Elemental Form","Elemental Manipulation",' +
      '"Energy Immunity",Entangle,Glyph,Growth/Shrink,Knockdown,Lock/Unlock,' +
      'Mend,"Prolonged Blast",Quake,Refuge,Sanctuary,"Sphere Of Might",' +
      '"Summon Elemental","Viper Weapon","Wall Walker",Warding,' +
      '"Weapon Immunity","Wilderness Step"',
  'Elementalism (Fyr)':
    'Skill=Elementalism ' +
    'Powers=' +
      'Aura,Banish,Barrier,Bladebreaker,Blast,Bolt,Burst,Deflection,' +
      'Detect/Conceal,"Elemental Form","Elemental Manipulation",' +
      '"Energy Immunity","Environmental Protection",Fatigue,Glyph,' +
      '"Heat Mask",Light,"Prolonged Blast",Sanctuary,Smite,"Sphere Of Might",' +
      '"Summon Elemental",Warding',
  'Elementalism (Waeter)':
    'Skill=Elementalism ' +
    'Powers=' +
      'Banish,"Beast Friend",Bolt,Detect/Conceal,"Elemental Form",' +
      '"Elemental Manipulation","Energy Immunity","Environmental Protection",' +
      'Fatigue,"Fog Cloud",Glyph,Healing,Knockdown,Quickness,Sanctuary,Speed,' +
      '"Sphere Of Might",Storm,Stun,Succor,"Summon Elemental",Warding,' +
      '"Water Walk"',
  'Heahwisardry':
    'Skill=Heahwisardry ' +
    'Powers=' +
      '"Arcane Resistance",Armor,Aura,Banish,Barrier,Bladebreaker,Blast,' +
      'Bodyguard,Bolt,"Boost/Lower Trait",Burst,Deflection,Detect/Conceal,' +
      'Dispel,"Energy Immunity",Entangle,"Environmental Protection",Farsight,' +
      'Fatigue,Fear,"Fog Cloud",Glyph,Knockdown,Mimic,"Negate Arcana",' +
      '"Prolonged Blast",Puppet,Quickness,Refuge,Sanctuary,Slumber,Silence,' +
      'Smite,Speed,"Sphere Of Might",Storm,Stun,"Summon Elemental",' +
      'Telekinesis,Teleport,Warding,"Weapon Immunity"',
  'Hrimwisardry':
    'Skill=Hrimwisardry ' +
    'Powers=' +
      'Armor,Aura,Barrier,Bladebreaker,Blast,Bolt,Bridge,Burrow,Burst,' +
      'Deflection,Detect/Conceal,Dispel,"Elemental Form","Energy Immunity",' +
      'Entangle,"Environmental Protection",Fatigue,Invisibility,Knockdown,' +
      'Obscure,"Prolonged Blast",Refuge,Sanctuary,"Sluggish Reflexes",Smite,' +
      '"Sphere Of Might",Storm,Stun,"Summon Elemental","Voice On The Wind",' +
      'Warding,Whirlwind,"Wilderness Step"',
  'Miracles (Dargar)':
    'Powers=' +
      'Smite,Armor,"Battle Song",Blast,Bolt,"Boost/Lower Trait",Burst,' +
      '"Champion Of The Faith","Energy Immunity","Gift Of Battle",' +
      '"Prolonged Blast",Quickness,Sanctuary,"Sphere Of Might",' +
      '"Summon Demon","Summon Herald","Warrior\'s Gift","Weapon Immunity"',
  'Miracles (Eira)':
    'Powers=' +
      'Healing,"Arcane Resistance","Beast Friend",Bladebreaker,Bless,' +
      'Bodyguard,"Boost/Lower Trait","Champion Of The Faith",Confusion,' +
      'Dispel,"Energy Immunity","Environmental Protection",Feast,Glyph,' +
      '"Greater Healing",Knockdown,Refuge,Regenerate,Sanctuary,Slumber,Stun,' +
      'Succor,"Summon Herald",Warding,"Weapon Immunity"',
  'Miracles (Eostre Animalmother)':
    'Powers=' +
      '"Beast Friend",Entangle,"Altered Senses","Animate War Tree",Barrier,' +
      'Bolt,"Boost/Lower Trait",Bridge,Burrow,"Champion Of The Faith",' +
      '"Elemental Manipulation",Entangle,"Environmental Protection",Farsight,' +
      'Feast,Glyph,Growth/Shrink,Healing,Leaping,Mend,Refuge,Sanctuary,' +
      '"Shape Change",Sentry,"Summon Beast","Summon Elemental",' +
      '"Summon Herald","Sphere Of Might","Wall Walker","Wandering Senses",' +
      '"Wilderness Step"',
  'Miracles (Eostre Plantmother)':
    'Powers=' +
      'Entangle,"Beast Friend","Altered Senses","Animate War Tree",Barrier,' +
      'Bolt,"Boost/Lower Trait",Bridge,Burrow,"Champion Of The Faith",' +
      '"Elemental Manipulation",Entangle,"Environmental Protection",Farsight,' +
      'Feast,Glyph,Growth/Shrink,Healing,Leaping,Mend,Refuge,Sanctuary,' +
      '"Shape Change",Sentry,"Summon Beast","Summon Elemental",' +
      '"Summon Herald","Sphere Of Might","Wall Walker","Wandering Senses",' +
      '"Wilderness Step"',
  'Miracles (Ertha)':
    'Powers=' +
      'Burrow,Armor,Barrier,"Beast Friend",Bladebreaker,Bolt,' +
      '"Boost/Lower Trait",Bridge,"Champion Of The Faith",Detect/Conceal,' +
      '"Elemental Form","Elemental Manipulation","Energy Immunity",Entangle,' +
      '"Environmental Protection",Corporealness,Glyph,Growth/Shrink,Quake,' +
      'Refuge,Sanctuary,"Sphere Of Might","Summon Elemental","Summon Herald",' +
      '"Wall Walker","Weapon Immunity","Wilderness Step"',
  'Miracles (Freo)':
    'Powers=' +
      '"Wilderness Step","Beast Friend",Bodyguard,Bolt,"Boost/Lower Trait",' +
      'Bridge,"Champion Of The Faith",Entangle,"Environmental Protection",' +
      'Etherealness,Farsight,Feast,Fly,Leaping,Mend,Quickness,Sanctuary,' +
      'Sentry,"Speak Language",Speed,Storm,Succor,"Summon Herald",Teleport,' +
      '"Voice On The Wind","Wall Walker","Wandering Senses",Zephyr',
  'Miracles (Hela)':
    'Powers=' +
      'Zombie,"Arcane Resistance",Armor,Aura,Banish,"Beast Friend",Blast,' +
      'Bolt,"Boost/Lower Trait","Champion Of The Faith","Corpse Senses",' +
      'Deflection,Dispel,"Enhance Undead",Etherealness/Corporealness,Fatigue,' +
      'Fear,"Fog Cloud",Glyph,Gravespeak,"Greater Zombie",Invisibility,' +
      'Nightmare,Obscure,"Prolonged Blast",Sacrifice,Sanctuary,' +
      '"Sluggish Reflexes",Slumber,"Strength Of The Undead",Stun,' +
      '"Summon Herald","Weaken Undead"',
  'Miracles (Hoenir)':
    'Powers=' +
      'Detect/Conceal,"Altered Senses","Arcane Resistance","Beast Friend",' +
      'Bless,Bolt,"Boost/Lower Trait","Champion Of The Faith",Confusion,' +
      'Dispel,Farsight,Glyph,Gravespeak,Insight,Light,Lock/Unlock,Mimic,' +
      '"Mind Rider",Precognition,Sanctuary,Silence,"Speak Language",' +
      '"Summon Demon","Summon Herald","Voice On The Wind","Wandering Senses",' +
      'Warding',
  'Miracles (Hothar)':
    'Powers=' +
      '"Charismatic Aura","Altered Senses","Arcane Resistance",Armor,Barrier,' +
      '"Beast Friend",Bladebreaker,"Boost/Lower Trait",' +
      '"Champion Of The Faith",Deflection,Detect/Conceal,Dispel,Entangle,' +
      '"Environmental Protection",Fear,Invisibility,Light,Puppet,Quickness,' +
      'Sanctuary,Silence,Smite,"Speak Language",Speed,Stun,"Summon Herald",' +
      '"Voice On The Wind"',
  'Miracles (Kenaz)':
    'Powers=' +
      'Deflection,"Altered Senses",Aura,Bladebreaker,Blast,Bolt,Burst,' +
      '"Champion Of The Faith","Elemental Form","Elemental Manipulation",' +
      '"Energy Immunity",Etherealness,"Environmental Protection",Fatigue,' +
      'Glyph,Leaping,Light,"Heat Mask","Prolonged Blast",Sanctuary,Smite,' +
      'Speed,"Sphere Of Might",Stun,"Summon Elemental","Summon Herald",Warding',
  'Miracles (Maera)':
    'Powers=' +
      'Dispel,"Arcane Resistance",Banish,Barrier,Bolt,Deflection,' +
      'Detect/Conceal,"Elemental Manipulation","Energy Immunity",' +
      'Etherealness/Corporealness,Fly,Glyph,Light,"Negate Arcana",Obscure,' +
      'Precognition,Sanctuary,Stun,"Summon Elemental","Summon Herald",' +
      'Teleport,Warding',
  'Miracles (Nauthiz)':
    'Powers=' +
      '"Boost/Lower Trait","Altered Senses","Arcane Resistance",Bolt,Burrow,' +
      '"Champion Of The Faith",Confusion,Detect/Conceal,Dispel,Etherealness,' +
      '"Fortune\'s Favored",Gravespeak,Growth/Shrink,Invisibility,Light,' +
      'Lock/Unlock,Luck/Jinx,Obscure,"Negate Arcana",Sanctuary,Silence,' +
      '"Speak Language","Summon Herald","Wall Walker","Wandering Senses"',
  'Miracles (Neorthe)':
    'Powers=' +
      '"Environmental Protection",Barrier,"Beast Friend",Bolt,' +
      '"Boost/Lower Trait","Champion Of The Faith","Elemental Form",' +
      '"Elemental Manipulation","Energy Immunity",Etherealness/Corporealness,' +
      'Fatigue,"Fog Cloud",Glyph,Healing,Mend,Sanctuary,"Shape Change",Stun,' +
      'Succor,"Summon Beast","Summon Herald","Summon Elemental",' +
      '"Sphere Of Might","Water Walk"',
  'Miracles (Niht)':
    'Powers=' +
      'Obscure,"Altered Senses",Banish,Panic,Bolt,"Boost/Lower Trait",Burrow,' +
      '"Champion Of The Faith",Confusion,Deflection,Conceal,' +
      '"Energy Immunity",Entangle,Etherealness/Corporealness,Farsight,Fear,' +
      '"Fog Cloud","Heat Mask",Invisibility,Nightmare,Quickness,Sacrifice,' +
      'Sanctuary,Sentry,Shrink,Silence,Smite,"Summon Elemental",' +
      '"Summon Herald",Teleport,"Wall Walker","Wandering Senses"',
  'Miracles (The Norns)':
    'Powers=' +
      'Precognition,"Analyze Foe",Banish,Bless/Panic,Bolt,' +
      '"Boost/Lower Trait","Champion Of The Faith",Confusion,Deflection,' +
      'Dispel,Entangle,Fatigue,"Fortune\'s Favored",Healing,Insight,' +
      'Invisibility,Luck/Jinx,Mimic,Quickness,Speed,Succor,"Summon Herald",' +
      'Teleport,Warding',
  'Miracles (Rigr)':
    'Powers=' +
      'Detect,"Altered Senses","Analyze Foe","Boost/Lower Trait",' +
      '"Champion Of The Faith","Environmental Protection",Farsight,' +
      '"Fog Cloud","Heat Mask",Invisibility,Light,Sanctuary,Sentry,Silence,' +
      '"Speak Language",Speed,Storm,"Summon Herald",Teleport,' +
      '"Wandering Senses","Voice On The Wind"',
  'Miracles (Scaetha)':
    'Powers=' +
      '"Weaken Undead","Arcane Resistance",Armor,Banish,Bladebreaker,Bless,' +
      'Bodyguard,Bolt,"Boost/Lower Trait","Champion Of The Faith",Deflection,' +
      'Dispel,Corporealness,Glyph,Gravespeak,Healing,"Heat Mask",' +
      '"Energy Immunity",Invisibility,Light,"Prolonged Blast",Quickness,' +
      'Sanctuary,Smite,"Sphere Of Might","Summon Herald",Warding,' +
      '"Warrior\'s Gift","Weapon Immunity"',
  'Miracles (Sigel)':
    'Powers=' +
      'Light,"Altered Senses",Aura,Banish,Bless,Bolt,Burst,' +
      '"Champion Of The Faith",Deflection,"Elemental Manipulation",' +
      '"Energy Immunity","Environmental Protection",Farsight,Fatigue,' +
      'Invisibility,Precognition,"Prolonged Blast",Sanctuary,Speed,' +
      '"Sphere Of Might",Stun,"Summon Elemental","Summon Herald",Teleport,' +
      'Warding,"Weaken Undead"',
  'Miracles (Thrym)':
    'Powers=' +
      'Entangle,Armor,Aura,Barrier,"Beast Friend",Bladebreaker,Bolt,Bridge,' +
      'Burrow,Burst,"Champion Of The Faith",Deflection,Detect/Conceal,' +
      'Dispel,"Elemental Form","Elemental Manipulation","Energy Immunity",' +
      '"Environmental Protection",Fatigue,Fear,Fly,Glyph,"Heat Mask",Light,' +
      'Obscure,"Prolonged Blast",Sanctuary,"Sluggish Reflexes",Smite,' +
      '"Sphere Of Might",Storm,"Summon Herald","Voice On The Wind",' +
      '"Wilderness Step"',
  'Miracles (Thunor)':
    'Powers=' +
      'Fly,Aim,Barrier,Becalm,"Beast Friend",Bolt,"Champion Of The Faith",' +
      'Deflection,"Elemental Form","Elemental Manipulation",' +
      '"Energy Immunity","Environmental Protection",' +
      'Etherealness/Corporealness,Fatigue,"Fog Cloud",Glyph,Knockdown,' +
      'Leaping,Obscure,Sanctuary,"Shape Change",Silence,Storm,"Summon Beast",' +
      '"Summon Elemental","Summon Herald",Telekinesis,"Sphere Of Might",' +
      '"Voice On The Wind",Whirlwind,Zephyr',
  'Miracles (Tiw)':
    'Powers=' +
      'Armor,Smite,Aim,"Battle Song",Bladebreaker,Blast,Bolt,' +
      '"Boost/Lower Trait",Burst,"Champion Of The Faith",Deflection,' +
      '"Energy Immunity",Fatigue,"Gift Of Battle",Knockdown,' +
      '"Prolonged Blast",Quickness,"Sluggish Reflexes",Sanctuary,Smite,Speed,' +
      'Stun,"Summon Herald","Warrior\'s Gift","Weapon Immunity"',
  'Miracles (Ullr)':
    'Powers=' +
      'Aim,"Altered Senses","Beast Friend","Boost/Lower Trait",' +
      '"Champion Of The Faith",Deflection,Entangle,' +
      '"Environmental Protection",Feast,"Heat Mask",Leaping,Refuge,Sanctuary,' +
      'Sentry,"Shape Change",Silence,Speed,"Summon Beast","Summon Herald",' +
      '"Voice On The Wind","Wandering Senses","Wilderness Step"',
  'Miracles (The Unknowable One)':
    'Powers=' +
      '"Shape Change",Bladebreaker,Bless/Panic,"Boost/Lower Trait",Burrow,' +
      '"Champion Of The Faith","Charismatic Aura",Confusion,Deflection,' +
      'Detect/Conceal,Dispel,"Elemental Manipulation",Entangle,' +
      'Etherealness/Corporealness,Farsight,Fear,"Fortune\'s Favored",' +
      'Invisibility,Knockdown,Light,Luck/Jinx,Mimic,"Mind Rider",Obscure,' +
      'Puppet,Quickness,Sanctuary,Silence,"Sluggish Reflexes","Summon Demon",' +
      '"Summon Herald",Telekinesis,Teleport,"Wandering Senses",' +
      '"Weapon Immunity"',
  'Miracles (Vali)':
    'Powers=' +
      'Disease,"Charismatic Aura",Armor,Barrier,Aura,"Beast Friend",' +
      '"Boost/Lower Trait",Burrow,"Champion Of The Faith","Charismatic Aura",' +
      'Detect/Conceal,Disease,Entangle,Fatigue,Fear,Nightmare,Obscure,Puppet,' +
      'Sacrifice,Sanctuary,"Shape Change",Smite,Stun,"Summon Demon",' +
      '"Summon Herald"',
  'Miracles (Var)':
    'Powers=' +
      '"Charismatic Aura",Bladebreaker,Bodyguard,Bolt,"Boost/Lower Trait",' +
      'Confusion,Deflection,Detect/Conceal,Entangle,Fear,Lock,Puppet,' +
      'Sanctuary,Sentry,Silence,Slumber,"Speak Language",Speed,' +
      '"Summon Herald",Teleport',
  'Rune Magic (Armor-Rune)':
    'Skill=Armor-Rune ' +
    'Powers=Armor,Bladebreaker,"Weapon Immunity"',
  'Rune Magic (Arrow-Rune)':
    'Skill=Arrow-Rune ' +
    'Powers=Aim,Bolt,"Boost/Lower Trait"',
  'Rune Magic (Battle-Rune)':
    'Skill=Battle-Rune ' +
    'Powers="Boost/Lower Trait","Gift Of Battle","Warrior\'s Gift"',
  'Rune Magic (Beast-Rune)':
    'Skill=Beast-Rune ' +
    'Powers="Beast Friend","Summon Beast","Viper Weapon"',
  'Rune Magic (Blessing-Rune)':
    'Skill=Blessing-Rune ' +
    'Powers="Arcane Resistance","Fortune\'s Favored",Luck/Jinx',
  'Rune Magic (Calming-Rune)':
    'Skill=Calming-Rune ' +
    'Powers=Becalm,Bless/Panic,Slumber',
  'Rune Magic (Change-Rune)':
    'Skill=Change-Rune ' +
    'Powers=Etherealness/Corporealness,Growth/Shrink,"Shape Change"',
  'Rune Magic (Charm-Rune)':
    'Skill=Charm-Rune ' +
    'Powers="Boost/Lower Trait","Charismatic Aura",Puppet',
  'Rune Magic (Coldfire-Rune)':
    'Skill=Coldfire-Rune ' +
    'Powers=Burst,"Environmental Protection","Sluggish Reflexes"',
  'Rune Magic (Curse-Rune)':
    'Skill=Curse-Rune ' +
    'Powers=Confusion,Disease,Fatigue',
  'Rune Magic (Cut-Rune)':
    'Skill=Cut-Rune ' +
    'Powers="Boost/Lower Trait","Battle Song",Smite',
  'Rune Magic (Dispel-Rune)':
    'Skill=Dispel-Rune ' +
    'Powers=Dispel,"Negate Arcana",Silence',
  'Rune Magic (Earth-Rune)':
    'Skill=Earth-Rune ' +
    'Powers=Bridge,Burrow,Quake',
  'Rune Magic (Elemental-Rune)':
    'Skill=Elemental-Rune ' +
    'Powers="Elemental Form","Elemental Manipulation","Summon Elemental"',
  'Rune Magic (Glow-Rune)':
    'Skill=Glow-Rune ' +
    'Powers="Altered Senses","Heat Mask",Light',
  'Rune Magic (Healing-Rune)':
    'Skill=Healing-Rune ' +
    'Powers="Boost/Lower Trait",Healing,Succor',
  'Rune Magic (Secret-Rune)':
    'Skill=Secret-Rune ' +
    'Powers=Detect/Conceal,Insight,Invisibility',
  'Rune Magic (Shield-Rune)':
    'Skill=Shield-Rune ' +
    'Powers=Barrier,Deflection,Warding',
  'Rune Magic (Tongue-Rune)':
    'Skill=Tongue-Rune ' +
    'Powers=Gravespeak,"Speak Language","Voice On The Wind"',
  'Rune Magic (Travel-Rune)':
    'Skill=Travel-Rune ' +
    'Powers=Quickness,Speed,"Wilderness Step"',
  'Rune Magic (Weather-Rune)':
    'Skill=Weather-Rune ' +
    'Powers="Fog Cloud",Storm,Whirlwind',
  'Song Magic':
    'Skill="Song Magic" ' +
    'Powers=' +
      '"Arcane Resistance",Banish,"Battle Song","Beast Friend",Bless/Panic,' +
      '"Boost/Lower Trait","Charismatic Aura",Confusion,Detect/Conceal,' +
      'Dispel,"Elemental Manipulation",Fatigue,Fear,Healing,Lock/Unlock,' +
      'Mimic,"Negate Arcana",Nightmare,Puppet,Sanctuary,Silence,Slumber,' +
      '"Speak Language",Stun,Succor,"Summon Beast","Voice On The Wind",' +
      'Warding,"Warrior\'s Gift","Wilderness Step"'
};
Hellfrost.ARCANAS = Object.assign({}, SWD.ARCANAS, Hellfrost.ARCANAS_ADDED);
delete Hellfrost.ARCANAS['Magic'];
delete Hellfrost.ARCANAS['Psionics'];
delete Hellfrost.ARCANAS['Super Powers'];
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
Hellfrost.CONCEPTS = {
  'Avenger':'',
  'Bandit':'',
  'Bladedancer':
    'Edge=Two-Fisted ' +
    'Attribute=Agility ' +
    'Skill=Fighting',
  'Bludgeoner':
    'Edge=Bludgeoner ' +
    'Attribute=Spirit,Strength ' +
    'Skill=Intimidation,Shooting',
  'Citizen':'',
  'Druid':
    'Edge="Arcane Background (Druidism)" ' +
    'Attribute=Smarts ' +
    'Skill=Druidism',
  'Elementalist':
    'Edge="Arcane Background (Elementalism)" ' +
    'Attribute=Smarts ' +
    'Skill="Elementalism"',
  'Explorer': // Estimated related features
    'Attribute=Smarts ' +
    'Skill=Survival',
  'Fighter': // Estimated related features
    'Attribute=Agility ' +
    'Skill=Fighting,Shooting',
  'Gray Legionary':
    'Edge="Gray Legionary" ' +
    'Attribute=Spirit ' +
    'Skill=Fighting,Shooting,Throwing',
  'Heahwisard':
    'Edge="Arcane Background (Heahwisardry)" ' +
    'Attribute=Smarts ' +
    'Skill=Heahwisardry',
  'Healer':
    'Edge="Sister Of Mercy" ' +
    'Skill=Healing',
  'Hearth Knight':
    'Edge="Hearth Knight" ' +
    'Attribute=Spirit,Vigor ' +
    'Skill=Fighting,Riding,Survival',
  'Herald':'',
  'Hrimwisard':
    'Edge="Arcane Background (Hrimwisardry)" ' +
    'Attribute=Smarts ' +
    'Skill=Hrimwisardry',
  'Ice Rigger': // Estimated related features
    'Attribute=Agility ' +
    'Skill=Boating',
  'Iron Guild Mercenary':
    'Edge="Iron Guild Mercenary" ' +
    'Attribute=Strength,Spirit ' +
    'Skill=Fighting',
  'Itinerant Worker':'',
  'Knight Hrafn':
    'Edge="Knight Hrafn",Command ' +
    'Attribute=Smarts,Spirit',
  'Lorekeeper':
    'Edge=Lorekeeper ' +
    'Attribute=Smarts ' +
    'Skill=Investigation',
  'Messenger': // Estimated related features
    'Attribute=Agility ' +
    'Skill=Riding',
  'Noble':
    'Edge=Noble',
  'Outlaw':'',
  'Paladin': // Estimated related features
    'Attribute=Agility,Spirit ' +
    'Skill=Faith,Fighting',
  'Priest':
    'Edge="Arcane Background (Miracles)" ' +
    'Attribute=Spirit ' +
    'Skill=Faith',
  'Ranger': // Estimated related features
    'Attribute=Agility,Smarts ' +
    'Skill=Fighting,Survival',
  'Refugee':'',
  'Reliqus':
    'Edge="Reliquary (Reliqus)" ' +
    'Attribute=Agility ' +
    'Skill=Lockpicking,Notice',
  'Roadwarden':
    'Edge=Roadwarden ' +
    'Attribute=Vigor ' +
    'Skill=Fighting,Riding,Tracking',
  'Rune Mage':
    'Edge="Arcane Background (Rune Magic)" ' +
    'Attribute=Smarts',
  'Scout': // Estimated related features
    'Attribute=Smarts ' +
    'Skill=Survival',
  'Skald':
    'Edge="Arcane Background (Song Magic)" ' +
    'Attribute=Smarts ' +
    'Skill="Song Magic"',
  'Trapper': // Estimated related features
    'Attribute=Smarts ' +
    'Skill=Survival',
  'Wood Warden':
    'Edge=Woodsman ' +
    'Skill=Shooting',
  'Woodsman':
    'Edge=Woodsman ' +
    'Attribute=Spirit ' +
    'Skill=Survival'
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
  'Arcane Background (Druidism)':
    'Type=background Require="race =~ \'Engro|Elf|Dwarf\'"',
  'Arcane Background (Elementalism)':
    'Type=background ' +
    'Require="edges.Elementalism (Eir) || edges.Elementalism (Ertha) || ' +
             'edges.Elementalism (Fyr) || edges.Elementalism (Waeter)"',
  'Arcane Background (Heahwisardry)':'Type=background Require=features.Noble',
  'Arcane Background (Hrimwisardry)':'Type=background',
  'Arcane Background (Rune Magic)':
    'Type=background Require="race == \'Frost Dwarf\'"',
  'Arcane Background (Song Magic)':'Type=background',
  'Library':
    'Type=background ' +
    'Require="features.Rich || features.Lorekeeper","features.Illiterate == 0"',
  'Linguist':'Type=background Require="smarts >= 6","features.Illiterate == 0"',
  'Noble':'Type=background',
  'Old Family':
    'Type=background Require="features.Arcane Background (Heahwisardry)"',
  'Styrimathr':'Type=background Require="skills.Boating >= 8"',
  'Warm Blooded':
    'Type=background Require="race =~ \'Engro|Hearth Elf|Human\'","vigor >= 8"',
  // Combat
  'Blood And Guts':
    'Type=combat ' +
    'Require=' +
      '"advances >= 8",' +
      '"skills.Fighting>=10 || skills.Shooting>=10 || skills.Throwing>=10"',
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
      '"skills.Fighting >= 8 || skills.Shooting >= 8 || skills.Throwing >= 8"',
  'Improved Giant Killer':
    'Type=combat Require="advances >= 12","features.Giant Killer"',
  'Mighty Shot':
    'Type=combat ' +
    'Require="advances >= 8","strength >= 8","skills.Shooting >= 10"',
  'Mighty Throw':
    'Type=combat ' +
    'Require="advances >= 8","strength >= 8","skills.Throwing >= 10"',
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
  'Rune Magic (Armor-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Arrow-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Battle-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Beast-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Blessing-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Calming-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Change-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Charm-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Coldfire-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Curse-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Cut-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Dispel-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Earth-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Elemental-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Glow-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Healing-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Secret-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Shield-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Tongue-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Travel-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Weather-Rune)':
    'Type=power Require="features.Arcane Background (Rune Magic)"',
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
      '"skills.Climbing >= 6",' +
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
      '"features.Scholar || Sum \'features.Scholar\' > 0",' +
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
      '"features.Thief",' +
      '"deity == \'Nauthiz\'"',
  'Disciple Of Neorthe':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"vigor >= 8",' +
      '"skills.Boating >= 6",' +
      '"skills.Faith >= 6",' +
      '"skills.Swimming >= 6",' +
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
      '"skills.Tracking >= 6",' +
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
      '"skills.Streetwise >= 8",' +
      '"deity == \'Var\'"',
  // Leadership
  'A Few Good Men':
    'Type=leadership ' +
    'Require=' +
      '"advances >= 12",' +
      '"smarts >= 8",' +
      '"skills.Knowledge (Battle) >= 10",' +
      'features.Command,' +
      'features.Inspire',
  'Coordinated Firepower':
    'Type=leadership ' +
    'Require=' +
      '"advances >= 8",' +
      '"smarts >= 6",' +
      '"skills.Shooting >= 8",' +
      '"skills.Throwing >= 8",' +
      'features.Command',
  'Cry Havoc!':
    'Type=leadership ' +
    'Require=' +
      '"advances >= 8",' +
      '"spirit >= 8",' +
      '"skills.Knowledge (Battle) >= 10",' +
      'features.Command,' +
      'features.Fervor',
  'Death Before Dishonor':
    'Type=leadership ' +
    'Require=' +
      '"advances >= 8",' +
      '"spirit >= 8",' +
      '"skills.Knowledge (Battle) >= 8",' +
      'features.Command,' +
      '"features.Hold The Line!"',
  'Fanaticism':
    'Type=leadership Require="advances >= 4",features.Command,features.Fervor',
  'Siege Breaker':
    'Type=leadership ' +
    'Require="advances >= 4","smarts >= 8","skills.Knowledge (Battle) >= 8"',
  'Siege Mentality':
    'Type=leadership ' +
    'Require="advances >= 4","smarts >= 8","skills.Knowledge (Battle) >= 8"',
  'Tactician':
    'Type=leadership ' +
    'Require=' +
      '"advances >= 4",' +
      '"smarts >= 8",' +
      '"skills.Knowledge (Battle) >= 6",' +
      'features.Command',
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
      '"skills.Knowledge (Arcana) >= 8"',
  'Augment Staff (Damage)':
    'Type=power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Heahwisardry)",' +
      '"skills.Heahwisardry >= 8",' +
      '"skills.Knowledge (Arcana) >= 8"',
  'Augment Staff (Deflect)':
    'Type=power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Heahwisardry)",' +
      '"skills.Heahwisardry >= 8",' +
      '"skills.Knowledge (Arcana) >= 8"',
  'Augment Staff (Spell Store)':
    'Type=power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Heahwisardry)",' +
      '"skills.Heahwisardry >= 8",' +
      '"skills.Knowledge (Arcana) >= 8"',
  'Combine Spells':
    'Type=power ' +
    'Require=' +
       '"advances >= 12",' +
       'powerCount,' +
       '"arcaneSkill >= 10",' +
       '"skills.Knowledge (Arcana) >= 10"',
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
      '"features.Arcane Background (Elementalism)"',
  'Elementalism (Eir)':
    'Type=power Require="features.Arcane Background (Elementalism)"',
  'Elementalism (Ertha)':
    'Type=power Require="features.Arcane Background (Elementalism)"',
  'Elementalism (Fyr)':
    'Type=power Require="features.Arcane Background (Elementalism)"',
  'Elementalism (Waeter)':
    'Type=power Require="features.Arcane Background (Elementalism)"',
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
      '"skills.Knowledge (Arcana) >= 10"',
  'New Rune':'Type=power Require="features.Arcane Background (Rune Magic)"',
  'Power Surge':
    'Type=power Require="advances >= 4",powerCount,"arcaneSkill >= 10"',
  'Runic Insight':
    'Type=power ' +
    'Require="features.Arcane Background (Rune Magic)","arcaneSkill >= 8"',
  'Spell Finesse (Arcane)':
    'Type=power ' +
    'Require=powerCount,"arcaneSkill >= 8","skills.Knowledge (Arcana) >= 8"',
  'Spell Finesse (Armor Penetration)':
    'Type=power ' +
    'Require=powerCount,"arcaneSkill >= 8","skills.Knowledge (Arcana) >= 8"',
  'Spell Finesse (Heavy Weapon)':
    'Type=power ' +
    'Require=powerCount,"arcaneSkill >= 8","skills.Knowledge (Arcana) >= 8"',
  'Spell Finesse (Range)':
    'Type=power ' +
    'Require=powerCount,"arcaneSkill >= 8","skills.Knowledge (Arcana) >= 8"',
  'Spell Finesse (Selective)':
    'Type=power ' +
    'Require=powerCount,"arcaneSkill >= 8","skills.Knowledge (Arcana) >= 8"',
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
      '"skills.Shooting >= 6 || skills.Throwing >= 6"',
  'Guild Thief':
    'Type=professional ' +
    'Require=' +
      '"features.Thief"',
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
      '"skills.Knowledge (Alchemy) >= 6",' +
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
      '"skills.Knowledge (Battle) >= 8",' +
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
      '"skills.Knowledge (Arcana) >= 8",' +
      '"skills.Notice >= 6"',
  'Reliquary (Reliqus)':
    'Type=professional ' +
    'Require=' +
      '"agility >= 8",' +
      '"skills.Lockpicking >= 6",' +
      '"skills.Notice >= 6"',
  'Roadwarden':
    'Type=professional ' +
    'Require=' +
      '"vigor >= 6",' +
      '"skills.Fighting >= 8",' +
      '"skills.Riding >= 6",' +
      '"skills.Survival >= 6",' +
      '"skills.Tracking >= 6"',
  'Sister Of Mercy':
    'Type=professional ' +
    'Require=' +
      '"skills.Healing >= 8",' +
      '"gender == \'Female\'",' +
      '"hindrances.Pacifist || hindrances.Pacifist+"',
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
      '"skills.Knowledge (Folklore) >= 8",' +
      '"skills.Persuasion >= 8"',
  'Legendary Storyteller':
    'Type=background Require="advances >= 12","features.Master Storyteller"'
};
Hellfrost.EDGES = Object.assign({}, SWD.EDGES, Hellfrost.EDGES_ADDED);
delete Hellfrost.EDGES['Ace'];
delete Hellfrost.EDGES['Arcane Background (Magic)'];
delete Hellfrost.EDGES['Arcane Background (Psionics)'];
delete Hellfrost.EDGES['Arcane Background (Super Powers)'];
delete Hellfrost.EDGES['Arcane Background (Weird Science)'];
// Power Points, Rapid Recharge, Wizard, and Soul Drain allowed
Hellfrost.FEATURES_ADDED = {

  // Edges
  'A Few Good Men':
    'Section=combat Note="Adds one token to army in mass battles"',
  'Alchemy':'Section=arcana Note="May create arcane devices for known spells"',
  'Arcane Background (Druidism)':
    'Section=arcana,skill ' +
    'Note="3 Powers/10 Power Points",' +
         '"+1 Druidism in natural environments, -1 in urban environments"',
  'Arcane Background (Elementalism)':
    'Section=arcana Note="3 Powers/10 Power Points"',
  'Arcane Background (Heahwisardry)':
    'Section=arcana,skill ' +
    'Note="3 Powers/10 Power Points",' +
         '"-2 arcane skill, +1 per extra round taken (+%{smarts//2} max)"',
  'Arcane Background (Hrimwisardry)':
    'Section=arcana,combat,skill ' +
    'Note="2 Powers/10 Power Points",' +
         '"-4 damage from cold, +4 from heat",' +
         '"-2 Charisma (civilized races)/Arcane skill modified by temperature"',
  'Arcane Background (Rune Magic)':
    'Section=arcana Note="0 Powers/10 Power Points"',
  'Arcane Background (Song Magic)':
    'Section=arcana,skill ' +
    'Note="3 Powers/10 Power Points",' +
         '"+1 Common Knowledge/+1 Charisma/+1 Knowledge (folklore)"',
  'Augment Staff (Aura)':
    'Section=skill Note="Staff gives +2 Intimidation or +2 Persuasion"',
  'Augment Staff (Damage)':
    'Section=combat Note="Staff does d%{strength}%1+d%2 damage and AP %3"',
  'Augment Staff (Deflect)':'Section=combat Note="Foe ranged attacks %1"',
  'Augment Staff (Spell Store)':
    'Section=arcana Note="Staff can store %1 known spell(s), cast at +2"',
  'Bladedancer':
    'Section=combat ' +
    'Note="May make -2 attack on every creature adjacent to running path"',
  'Blood And Guts':
    'Section=combat ' +
    'Note="Halves negative difference between tokens when attacking in mass battle"',
  'Bludgeoner':'Section=combat,skill ' +
    'Note=' +
      '"+%V sling range/Sling does d%{strength}%1+d6 damage at short range",' +
      '"+1 Charisma (engros)"',
  'Courageous':'Section=attribute Note="+2 Spirit vs. fear, -2 fear table roll"',
  'Combine Spells':'Section=arcana Note="May cast two spells simultaneously"',
  'Concentration':'Section=arcana Note="+%V to resist spell disruption"',
  'Coordinated Firepower':
    'Section=combat ' +
    'Note="R%{commandRange}%{in} Commanded may make +2 ranged attacks at a single foe simultaneously, doing cumulative damage"',
  'Cry Havoc!':
    'Section=combat ' +
    'Note="May charge during Battle roll 1/mass battle, success removes extra foe token"',
  'Death Before Dishonor':
    'Section=attribute Note="+2 Spirit (mass battle morale)"',
  'Disciple Of Dargar':
    'Section=combat ' +
    'Note="Single blow that incapacitates foe makes adjacent foes Shaken (Spirit neg)"',
  'Disciple Of Eira':
    'Section=skill Note="+2 Healing/5 companions +2 natural Healing"',
  'Disciple Of Eostre Animalmother':
    'Section=feature ' +
    'Note="Has Beast Master feature with wild card companion animal"',
  'Disciple Of Eostre Plantmother':
    'Section=combat,feature,skill ' +
    'Note=' +
      '"Moves normally through vegetated difficult terrain",' +
      '"May use Champion and Holy Warrior edges with plant creatures",' +
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
    'Note="+1 Common Knowledge/+1 all Knowledge/May make untrained Knowledge skills"',
  'Disciple Of Hothar':'Section=attribute Note="+2 vs. mind effects"',
  'Disciple Of Kenaz':
    'Section=attribute,combat ' +
    'Note=' +
      '"+2 Vigor (resist heat)",' +
      '"+4 Armor vs. heat damage, may magically heat metal weapon for +2 damage vs. cold resistant and +4 vs cold immune"',
  'Disciple Of Maera':
    'Section=arcana Note="May cast off-list spell at -2, +2 <i>Dispel</i>"',
  'Disciple Of Nauthiz':
    'Section=skill ' +
    'Note="May reroll 1s on Gambling, Stealth, and Lockpicking; suffers fatigue for 1 dy if reroll is 1"',
  'Disciple Of Neorthe':
    'Section=feature ' +
    'Note="Survives on half water; survives drowning for %{vigor} rd"',
  'Disciple Of Niht':
    'Section=feature ' +
    'Note="No penalty in dim and dark illumination, -2 in pitch dark"',
  'Disciple Of The Norns':'Section=arcana Note="May spend benny for augury"',
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
    'Note="May cast and attack in single action",' +
         '"+1 Rank for acquiring combat edges"',
  'Disciple Of Ullr':
    'Section=combat,skill ' +
    'Note="May move half Pace before using Marksman with bow",' +
         '"+2 Stealth (wilderness)/+2 Tracking (wilderness)"',
  'Disciple Of Vali':'Section=feature Note="Immune to disease and poison"',
  'Disciple Of Var':
    'Section=feature Note="May sell goods at 50% price (Raise 75%)"',
  'Double Shot':'Section=combat Note="May fire two arrows at one target%1"',
  'Elemental Mastery':
    'Section=arcana ' +
    'Note="Knows spells from %V Elementalism disciplines, casts at %1"',
  'Fanaticism':
    'Section=combat ' +
    'Note="R%{commandRange}%{in} Commanded +2 vs fear, -2 fear table"',
  'Favored Foe':
    'Section=combat ' +
    'Note="+1 Parry and d8 extra damage on attack Raise against chosen creature type"',
  'Focus':
    'Section=arcana ' +
    'Note="Immediate %1Spirit roll to recover from Shaken due to spell failure or siphoning"',
  'Gray Legionary':
    'Section=feature Note="Member of Gray Legionary mercenary company"',
  'Guild Thief':
    'Section=skill ' +
    'Note="+2 Streetwise (home country)/d8 Wild Die choice of Climbing, Stealth (urban), or Lockpicking"',
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
         '"+1 Knowledge (Battle)"',
  'Legendary Storyteller':
    'Section=feature Note="Increased Master Storyteller effects"',
  'Library':'Section=skill Note="+%V Skill Points (choice of Knowledge)"',
  'Linguist':'Section=skill Note="Knows %V languages"',
  'Lorekeeper':'Section=skill Note="May make untrained Smarts skills at d4"',
  'Master Storyteller':
    'Section=feature ' +
    'Note="Story subjects use d8%1 for Glory awards, no penalty for critical failure"',
  'Mighty Shot':'Section=combat Note="Bow does %V%1+d6 damage"',
  'Mighty Throw':
    'Section=combat ' +
    'Note="+1 thrown weapon range/+1 Strength die for short throws"',
  'Necromantic Severing':
    'Section=combat Note="May make called shots vs. undead"',
  'New Rune':'Section=arcana Note="Knows spells from %V runes"',
  'Noble':'Section=feature,skill Note="Has Rich feature","+2 Charisma"',
  'Old Family':'Section=skill Note="+2 Knowledge (Arcana)"',
  'Oversized Weapon Master':
    'Section=combat Note="May use two-handed weapons with one hand"',
  'Power Surge':'Section=combat Note="Dbl damage from arcane skill attack"',
  'Reliquary (Arcanologist)':
    'Section=skill ' +
    'Note="+2 Common Knowledge (relics)/+2 Knowledge (relics)/May use Knowledge (Arcana) to learn unattuned relic powers"',
  'Reliquary (Reliqus)':
    'Section=attribute,skill ' +
    'Note="Test Agility-2 to avoid trap effects",' +
         '"+2 Notice (traps)/+2 disarm traps"',
  'Roadwarden':
    'Section=skill ' +
    'Note="+2 Survival/+2 Tracking/+2 Notice (ambushes, traps, concealed weapons)"',
  'Runic Insight':
    'Section=arcana Note="+1 arcane skill die for 1 spell of %1 chosen runes"',
  'Scamper':'Section=combat Note="Larger foes -1 attack"',
  'Shieldwall':'Section=combat Note="Shield benefit apples to adjacent ally"',
  'Siege Breaker':
    'Section=combat ' +
    'Note="-1 fortification siege bonus during mass battle, test Knowledge (Battle) for -2 (Raise -3)"',
  'Siege Mentality':
    'Section=combat ' +
    'Note="+1 fortification siege bonus during mass battle, test Knowledge (Battle) for +2 (Raise +3)"',
  'Sister Of Mercy':'Section=skill Note="+2 Healing/+1 Charisma"',
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
    'Note="May exclude %{arcaneSkill//2} creatures from effects of chosen area spell"',
  'Styrimathr':'Section=feature Note="Owns a Smabyrding"',
  'Sunder':'Section=combat Note="+%V AP with any weapon"',
  'Tactician':
    'Section=combat ' +
    'Note="R%{commandRange}%{in} Make Knowledge (Battle) test before combat, receive 1 Action Card per success and raise to distribute to commanded extras"',
  'Wall Of Steel':'Section=combat Note="Foes gain no Gang Up bonus"',
  'War Cry':
    'Section=combat Note="Make Intimidation test against all in 3%{in} radius"',
  'Warm Blooded':'Section=attribute Note="+2 Vigor (cold weather effects)"',
  'Wood Warden':
    'Section=arcana ' +
    'Note="Can speak with normal beasts, cast <i>Beast Friend</i>"',

  // Hindrances
  'Apprentice/Novitiate':
    'Section=skill Note="Maximum starting arcane skill d6"',
  'Apprentice/Novitiate+':
    'Section=arcana,skill ' +
    'Note="-1 Power Count","Maximum starting arcane skill d6"',
  'Black Sheep':
    'Section=feature,skill ' +
    'Note="Ostracized by magocratic nobility",' +
         '"-2 Charisma (heahwisards)"',
  'Cold Blooded':'Section=attribute Note="-2 Vigor (cold weather effects)"',
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
    'Note="Innate casting on self of cold <i>Armor</i>, <i>Environmental Protection</i>, <i>Smite</i>, and <i>Speed</i>"',
  'Heat Lethargy':
    'Section=attribute,skill ' +
    'Note="-1 attribute rolls at temperatures above 52",' +
         '"-1 skill rolls at temperatures above 52"',
  'Insular':'Section=skill Note="-2 Charisma (other races)"',
  'Mountain-Born':
    'Section=combat Note="No difficult terrain penalty in hills and mountains"',
  'Natural Realms':'Section=feature Note="Treats Elfhomes as wilds"',
  'Sneaky':
    'Section=skill Note="+2 Skill Points (choice of Stealth or Lockpicking)"',
  'Winter Soul':
    'Section=attribute,combat ' +
    'Note="+2 Vigor (resist cold)",' +
         '"+2 Armor vs. cold attacks"'
};
Hellfrost.FEATURES = Object.assign({}, SWD.FEATURES, Hellfrost.FEATURES_ADDED);
Hellfrost.GOODIES = Object.assign({}, SWD.GOODIES);
Hellfrost.HINDRANCES_ADDED = {
  'Apprentice/Novitiate':
    'Severity=Minor Require=powerCount,"features.Apprentice/Novitiate+ == 0"',
  'Apprentice/Novitiate+':
    'Severity=Major Require=powerCount,"features.Apprentice/Novitiate == 0"',
  'Black Sheep':
    'Severity=Minor ' +
    'Require="edges.Arcane Background (Heahwisardry) == 0",' +
            '"edges.Noble == 0",' +
            '"edges.Rich == 0"',
  'Cold Blooded':'Severity=Minor',
  'God Cursed+':'Severity=Major',
  'Magic Forbiddance+':
    'Severity=Major ' +
    'Require="edges.Arcane Background (Druidism) == 0",' +
            '"edges.Elementalism == 0",' +
            '"edges.Heahwisardry == 0",' +
            '"edges.Hrimwisardry == 0",' +
            '"edges.Rune Magic == 0",' +
            '"edges.Song Magic == 0"',
  'Necromantic Weakness':
    'Severity=Minor Require="features.Necromantic Weakness+ == 0"',
  'Necromantic Weakness+':
    'Severity=Major Require="features.Necromantic Weakness == 0"',
  'Orders':'Severity=Minor'
};
Hellfrost.HINDRANCES =
  Object.assign({}, SWD.HINDRANCES, Hellfrost.HINDRANCES_ADDED);
Hellfrost.POWERS_ADDED = {
  'Aim':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description=' +
      '"Target gains +2 attack (Raise +4) w/thrown or missile weapon while maintained"',
  'Altered Senses':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description=' +
      '"Target gains Infravision or Low Light Vision (Raise both) while maintained"',
  'Analyze Foe':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Range=sight ' +
    'Description=' +
      '"Self knows number of edges and highest attack skill of target (Raise names of edges and attack skill dice)"',
  'Animate War Tree':
    'Advances=12 ' +
    'PowerPoints=8 ' +
    'Range=touch ' +
    'Description=' +
      '"Target 30\' tree animates (Raise as wild card) while maintained"',
  'Arcane Resistance': // ref Arcane Protection
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description=' +
      '"Foes suffer -2 (Raise -4) on arcane attacks and damage against target while maintained"',
  'Aura': // ref Damage Field
    'Advances=4 ' +
    'PowerPoints=4 ' +
    'Range=touch ' +
    'Description=' +
      '"Creatures adjacent to target suffer 2d6 damage while maintained"',
  'Banish': // ref Banish
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Range=spirit ' +
    'Description="Target returns to native plane (Spirit neg)"',
  'Battle Song':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=2 ' +
    'Description=' +
      '"Creatures in range gain Berserk features (Spirit neg) while maintained"',
  'Becalm':
    'Advances=0 ' +
    'PowerPoints=3 ' +
    'Range=sight ' +
    'Description="Target ship suffers half speed while maintained"',
  'Bladebreaker':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=smarts ' +
    'Description="Target weapon destroyed (Weapon die type neg)"',
  'Bless/Panic':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Range=spirit ' +
    'Description=' +
      '"Allies in range gain +2 Spirit (or foes suffer -2) vs. fear (Raise +4/-4) while maintained"',
  'Bless':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Range=spirit ' +
    'Description=' +
      '"Allies in range gain +2 Spirit vs. fear (Raise +4) while maintained"',
  'Panic':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Range=spirit ' +
    'Description=' +
      '"Foes in range suffer -2 Spirit vs. fear (Raise -4) while maintained"',
  'Bodygard': // ref Summon Ally
    'Advances=0 ' +
    'PowerPoints=3 ' +
    'Range=smarts ' +
    'Description="Creates obedient servant until wounded"',
  'Bridge': // ref Barrier
    'Advances=4 ' +
    'PowerPoints=1/Section ' +
    'Range=smarts ' +
    'Description=' +
      '"Creates sections of 1%{in} horizontal surface while maintained"',
  'Champion Of The Faith':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=self ' +
    'Description=' +
      '"Gives target Champion or Holy Warrior features while maintained"',
  'Charismatic Aura':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=self ' +
    'Description="Target gains +1 Charisma (Raise +2) while maintained"',
  'Confusion': // ref Confusion
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Range=smarts*2 ' +
    'Description=' +
      '"Target suffers -2 Trait rolls (Raise -4) (Smarts neg) while maintained"',
  'Corpse Senses':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=smarts*50 ' +
    'Description="Self may use corpse senses while maintained"',
  'Detect/Conceal': // ref Detect/Conceal Arcana
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=smarts*2 ' +
    'Description=' +
      '"Target can detect supernatural effects or conceals target aura while maintained"',
  'Detect':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=smarts*2 ' +
    'Description=' +
      '"Target can detect supernatural effects while maintained"',
  'Conceal':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=smarts*2 ' +
    'Description=' +
      '"Conceals target aura while maintained"',
  'Disease':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Range=spirit ' +
    'Description="Target suffers disease and fatigue, may die (Vigor neg)"',
  'Elemental Form':
    'Advances=8 ' +
    'PowerPoints=5 ' +
    'Range=self ' +
    'Description="Gains elemental form special abilities while maintained"',
  'Energy Immunity':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=touch ' +
    'Description=' +
      '"Target takes half damage (Raise no damage) from chosen energy attack while maintained"',
  'Enhance Undead':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Range=touch ' +
    'Description=' +
      '"Undead targets gain advance benefit for 1 hr (Raise 6 hr; 2 Raises 1 dy)"',
  'Etherealness/Corporealness': // ref Intangibility
    'Advances=4 ' +
    'PowerPoints=5 ' +
    'Range=smarts ' +
    'Description=' +
      '"Target becomes unaffected by physical world or ethereal creature becomes effected (Spirit neg) while maintained"',
  'Etherealness':
    'Advances=4 ' +
    'PowerPoints=5 ' +
    'Range=smarts ' +
    'Description=' +
      '"Target becomes unaffected by physical world while maintained"',
  'Corporealness':
    'Advances=4 ' +
    'PowerPoints=5 ' +
    'Range=smarts ' +
    'Description=' +
      '"Target ethereal creature becomes effected by physical world (Spirit neg) while maintained"',
  'Farsight': // ref Farsight
    'Advances=0 ' +
    'PowerPoints=3 ' +
    'Range=touch ' +
    'Description=' +
      '"Target gains +2 Notice within %{smarts*2}%{in} and see 5 miles while maintained"',
  'Fatigue':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Range=12 ' +
    'Description="2%{in} radius (Raise 3%{in}) inflicts fatigue (Vigor neg)"',
  'Feast':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=smarts ' +
    'Description="Creates %{((advances//4)+1)*5} lb of basic food"',
  'Fog Cloud':
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Range=self ' +
    'Description=' +
      '"%{(advances//4)+1} mile fog reduces lighting 1 step (Raise 2 steps) while maintained"',
  "Fortune's Favored":
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description=' +
      '"Target may reroll failed benny-purchased reroll while maintained"',
  'Gift Of Battle':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=touch ' +
    'Description=' +
      '"Target gains leadership edge features (Raise 2 edges) while maintained"',
  'Glyph':
    'Advances=8 ' +
    'PowerPoints=4 ' +
    'Range=touch ' +
    'Description="Glyph stores spell effects until triggered"',
  'Gravespeak':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Range=touch ' +
    'Description="Target gains ability to ask spirit %{spirit} questions"',
  'Greater Zombie': // ref Zombie
    'Advances=12 ' +
    'PowerPoints=4 ' +
    'Range=spirit*2 ' +
    'Description="Target corpse animates and obeys self commands for 1 hr"',
  // TODO Hamper Movement
  'Heat Mask':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description="Target gains invisibility to infravision while maintained"',
  'Insight': // ref Object reading
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description=' +
      '"Target sees 1 event that occurred recently to touched object"',
  'Knockdown':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=9 ' +
    'Description=' +
      '"Cone pushes creatures 1d4%{in} and knocks prone (Strength neg)"',
  'Leaping':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description=' +
      '"Target gains dbl jumping distance (Raise x4) while maintained"',
  'Lock/Unlock':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description=' +
      '"Target lock gains -2 pick penalty and +2 Toughness (Raise -4 and +4) until unlocked or unlocks normal lock"',
  'Lock':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description=' +
      '"Target lock gains -2 pick penalty and +2 Toughness (Raise -4 and +4) until unlocked"',
  'Luck/Jinx':
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Range=touch ' +
    'Description=' +
      '"Target takes the best/worst of two trait rolls while maintained"',
  'Mend':
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Range=touch ' +
    'Description=' +
      '"Repairs 1 wound (Raise 2) inflicted to target wooden vehicle w/in past hr"',
  'Mimic':
    'Advances=0 ' +
    'PowerPoints=3 ' +
    'Range=spirit ' +
    'Description="Self can cast spell used by another while maintained"',
  'Mind Rider':
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Range=smarts ' +
    'Description="Self can use target\'s senses (Spirit neg) while maintained"',
  'Negate Arcana':
    'Advances=8 ' +
    'PowerPoints=5 ' +
    'Range=smarts ' +
    'Description="2%{in} radius dispels all magic while maintained"',
  'Nightmare':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Range=self ' +
    'Description=' +
      '"Target w/in %{smarts} miles loses benefit of sleep, becomes frightened (Spirit neg)"',
  'Precognition':
    'Advances=8 ' +
    'PowerPoints=2 ' +
    'Range=self ' +
    'Description="Allows rearranging 2 Action Cards (Raise 4) next rd"',
  'Prolonged Blast':
    'Advances=8 ' +
    'PowerPoints=5 ' +
    'Range=24 ' +
    'Description=' +
      '"Choice of 1%{in} or 2%{in} radius inflicts 2d6 damage (Raise 3d6) while maintained"',
  'Quake':
    'Advances=8 ' +
    'PowerPoints=6 ' +
    'Range=smarts*3 ' +
    'Description="3%{in} radius inflicts 2d10 damage (Agility neg)"',
  'Refuge':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Range=smarts ' +
    'Description=' +
      '"Creates 10\'x6\' shelter that gives +2 Vigor vs. cold (Raise +4) for 12 hr"',
  'Regenerate':
    'Advances=12 ' +
    'PowerPoints=3 ' +
    'Range=touch ' +
    'Description="Target gains free -2 Soak roll (Raise -0) while maintained"',
  'Sacrifice':
    'Advances=8 ' +
    'PowerPoints=5 ' +
    'Range=self ' +
    'Description=' +
      '"Gives +1 arcane skill per victim Spirit die step while maintained"',
  'Sanctuary':
    'Advances=0 ' +
    'PowerPoints=3 ' +
    'Range=self ' +
    'Description="Teleports to safe location"',
  'Sentry':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Range=smarts*2 ' +
    'Description="Creates overnight ghostly sentry or object alarm"',
  'Silence': // ref Sound/Silence
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description="Mutes 2%{in} radius while maintained"',
  'Sluggish Reflexes':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=smarts*2 ' +
    'Description=' +
      '"Target draws 1 fewer Action Card or takes the worst of 2 cards (Spirit neg) while maintained"',
  'Slumber': // ref Slumber
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=smarts*2 ' +
    'Description="Target sleeps for 1 hr (Spirit neg)"',
  'Sphere Of Might':
    'Advances=8 ' +
    'PowerPoints=4 ' +
    'Range=smarts ' +
    'Description=' +
      '"1%{in} sphere around target inflicts -1 attacks (Raise -2), attacks as d%{arcaneSkill} Fighting doing d%{arcaneSkill}+d4 damge (Raise d%{arcaneSkill}+d8) while maintained"',
  'Storm':
    'Advances=4 ' +
    'PowerPoints=5 ' +
    'Range=self ' +
    'Description=' +
      '"Creates or dissipates 10 mile lightning storm or blizzard while maintained"',
  'Strength Of The Undead':
    'Advances=8 ' +
    'PowerPoints=4 ' +
    'Range=touch ' +
    'Description=' +
      '"Self mimics undead target\'s trait or special ability (Raise 2) while maintained"',
  'Succor': // ref Succor
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description="Target rgains 1 level of fatigue (Raise 2 levels)"',
  'Summon Beast':
    'Advances=8 ' +
    'PowerPoints=2+ ' +
    'Range=spirit*5 ' +
    'Description="Self controls summoned beast\'s actions while maintained"',
  'Summon Demon':
    'Advances=0 ' +
    'PowerPoints=5+ ' +
    'Range=smarts*2 ' +
    'Description="Brings demon from the Abyss while maintained"',
  'Summon Elemental':
    'Advances=8 ' +
    'PowerPoints=4 ' +
    'Range=smarts*2 ' +
    'Description=' +
      '"Self controls summoned elemental\'s actions while maintained"',
  'Summon Herald':
    'Advances=12 ' +
    'PowerPoints=8 ' +
    'Range=smarts*2 ' +
    'Description="Brings herald of deity for support"',
  // TODO Summon Spirit
  'Viper Weapon':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=smarts*2 ' +
    'Description="Transforms target weapon into viper while maintained"',
  'Voice On The Wind':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=self ' +
    'Description=' +
      '"Transmits %{advances//4*10}-word message up to %{smarts*50} miles to known target"',
  'Wall Walker': // ref Wall Walker
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=smarts ' +
    'Description=' +
      '"Target moves at full Pace on vertical and inverted surfaces while maintained"',
  'Wandering Senses':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=smarts*10 ' +
    'Description="Self senses remotely while maintained"',
  'Warding':
    'Advances=4 ' +
    'PowerPoints=5 ' +
    'Range=self ' +
    'Description=' +
      '"2%{in} radius (Raise 3%{in} radius) bars specified creature type while maintained"',
  'Water Walk':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=touch ' +
    'Description=' +
      '"Target gains ability to traverse calm water while maintained"',
  'Weaken Undead':
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Range=spirit ' +
    'Description=' +
      '"Target undead loses undead ability (Spirit neg) while maintained"',
  'Weapon Immunity':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Range=touch ' +
    'Description=' +
      '"Target takes half damage (Raise no damage) from specified weapon type while maintained"',
  'Whirlwind': // ref Havoc
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=smarts ' +
    'Description="Knocks prone creatures in 2%{in} radius (Strength neg)"',
  'Wilderness Step':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description="Target treats all terrain as normal while maintained"',
  'Zephyr':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=self ' +
    'Description="Creates moderate wind while maintained"',

  // SWD spells copied to make available w/SWADE
  'Armor':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=touch ' +
    'Description="Gives +2 Armor (Raise +4) while maintained"',
  'Greater Healing':
    'Advances=8 ' +
    'PowerPoints=10 ' +
    'Range=touch ' +
    'Description=' +
      '"Restores 1 wound (Raise 2 wounds) w/out time limit or removes poison, disease, or sickness"',
  'Light':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=smarts ' +
    'Description="Creates 3%{in} radius bright light for 30 min"',
  'Obscure':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=smarts ' +
    'Description="Creates 3%{in} radius darkness for 3 rd"',
  'Quickness':
    'Advances=4 ' +
    'PowerPoints=4 ' +
    'Range=touch ' +
    'Description' +
      '="Target gains second action (Raise also redraw Action Cards below 8) while maintained"',
  'Slow':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=smarts*2 ' +
    'Description=' +
      '"Target move counts as action (Raise also redraw Action Cards above 10) (Spirit neg) while maintained"',
  'Speed':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description=' +
      '"Target dbl Pace (Raise also Run as free action) while maintained"',

  // SWADE powers that are split in a Hellfrost spell list
  'Shrink': // ref Growth/Shrink
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=smarts ' +
    'Description=' +
      '"Target loses Toughness and Strength step (Spirit neg) for 5 rd"'

};
Hellfrost.POWERS = Object.assign({}, SWD.POWERS, Hellfrost.POWERS_ADDED);
Hellfrost.RACES = {
  'Engro':
    'Features=' +
      '"Engro Luck",Outsider,"Short",Sneaky,Spirited',
  'Frost Dwarf':
    'Features=' +
      '"Heat Lethargy",Insular,"Low Light Vision",Mountain-Born,Slow,' +
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
      'Agile,"All Thumbs","Forest-Born","Heat Lethargy",Insular,' +
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
  'Druidism':'Attribute=smarts',
  'Elementalism':'Attribute=smarts',
  'Heahwisardry':'Attribute=smarts',
  'Hrimwisardry':'Attribute=smarts',
  'Armor-Rune':'Attribute=smarts',
  'Arrow-Rune':'Attribute=smarts',
  'Battle-Rune':'Attribute=smarts',
  'Beast-Rune':'Attribute=smarts',
  'Blessing-Rune':'Attribute=smarts',
  'Calming-Rune':'Attribute=smarts',
  'Change-Rune':'Attribute=smarts',
  'Charm-Rune':'Attribute=smarts',
  'Coldfire-Rune':'Attribute=smarts',
  'Curse-Rune':'Attribute=smarts',
  'Cut-Rune':'Attribute=smarts',
  'Dispel-Rune':'Attribute=smarts',
  'Earth-Rune':'Attribute=smarts',
  'Elemental-Rune':'Attribute=smarts',
  'Glow-Rune':'Attribute=smarts',
  'Healing-Rune':'Attribute=smarts',
  'Secret-Rune':'Attribute=smarts',
  'Shield-Rune':'Attribute=smarts',
  'Tongue-Rune':'Attribute=smarts',
  'Travel-Rune':'Attribute=smarts',
  'Weather-Rune':'Attribute=smarts',
  'Song Magic':'Attribute=smarts',
  'Knowledge (Alchemy)':'Attribute=smarts',
  'Knowledge (Arcana)':'Attribute=smarts',
  'Knowledge (Craft)':'Attribute=smarts',
  'Knowledge (Folklore)':'Attribute=smarts',
  'Knowledge (Heraldry)':'Attribute=smarts',
  'Knowledge (Religion)':'Attribute=smarts',
  'Knowledge (Riddles)':'Attribute=smarts',
  'Knowledge (Siege Artillery)':'Attribute=smarts'
};
Hellfrost.SKILLS = Object.assign({}, SWD.SKILLS, Hellfrost.SKILLS_ADDED);
Hellfrost.WEAPONS = {
  'Unarmed':'Damage=Str+d0 MinStr=4 Weight=0 Category=Un',
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

Hellfrost.SWD2SWADE = function(table) {
  var replacements = {
    // Special for Roadwarden
    'Survival\\D+\\d+","skills.Tracking':'Survival',
    // Powers
    'Bodyguard':'"Summon Ally"',
    // Races
    'Short':'Size -1',
    // Skills
    'Charisma\\b':'Persuasion',
    'Climbing':'Athletics',
    'Investigation':'Research',
    'Knowledge \\(Academics\\)':'Academics',
    'Knowledge \\(Alchemy\\)':'Weird Science',
    'Knowledge \\(Arcana\\)':'Occult',
    'Knowledge \\(Battle\\)':'Battle',
    'Knowledge \\(Electronics\\)':'Electronics',
    'Knowledge \\(Hacking\\)':'Hacking',
    'Knowledge \\(Language \\((.*)\\)\\)':'Language ($1)',
    'Knowledge \\(Science\\)':'Science',
    'Lockpicking':'Thievery',
    'Streetwise':'Common Knowledge',
    'Swimming':'Athletics',
    'Throwing':'Athletics',
    'Tracking':'Survival'
  };
  var result = Object.assign({}, table);
  for(var r in replacements) {
    if(r in result) {
      result[replacements[r]] = result[r];
      delete result[r];
    }
    for(var key in result) {
      result[key] = result[key].replace(new RegExp(r, 'g'), replacements[r]);
    }
  }
  return result;
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
Hellfrost.identityRules = function(rules, races, concepts, deities) {
  rules.basePlugin.identityRules(rules, races, {}, concepts, deities);
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
  else if(type == 'Concept')
    Hellfrost.conceptRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Attribute'),
      QuilvynUtils.getAttrValueArray(attrs, 'Edge'),
      QuilvynUtils.getAttrValueArray(attrs, 'Skill')
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
      QuilvynUtils.getAttrValue(attrs, 'Range'),
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

/*
 * Defines in #rules# the rules associated with concept #name#. #attributes#,
 * #edges#, and #skills# list the names of attributes, edges, and skills
 * associated with the concept.
 */
Hellfrost.conceptRules = function(rules, name, attributes, edges, skills) {
  rules.basePlugin.conceptRules(rules, name, attributes, edges, skills);
  // No changes needed to the rules defined by base method
};

/* Defines in #rules# the rules associated with deity #name#. */
Hellfrost.deityRules = function(rules, name) {
  rules.basePlugin.deityRules(rules, name);
  // No changes needed to the rules defined by base method
  if(name != 'None') {
    rules.defineRule('features.Arcane Background (Miracles (' + name + '))',
      'features.Arcane Background (Miracles)', '?', null,
      'deity', '=', 'source == "' + name + '" ? 1 : null'
    );
  }
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
  var matchInfo;
  if(name == 'Arcane Background (Elementalism)') {
    rules.defineRule('elementalismCount',
      'arcanaNotes.arcaneBackground(Elementalism)', '=', '1'
    );
    rules.defineRule('edgePoints', 'elementalismCount', '+', null);
  } else if(name == 'Arcane Background (Miracles)') {
    rules.defineRule('features.Connections',
      'features.Arcane Background (Miracles)', '=', '1'
    );
    rules.defineRule
      ('features.Orders', 'features.Arcane Background (Miracles)', '=', '1');
  } else if(name == 'Arcane Background (Rune Magic)') {
    rules.defineRule
      ('runeCount', 'arcanaNotes.arcaneBackground(RuneMagic)', '=', '1');
    rules.defineRule('edgePoints', 'runeCount', '+', null);
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
    rules.defineRule('range.Sling', 'combatNotes.bludgeoner', '+', null);
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
    rules.defineRule('arcanaNotes.elementalMastery',
      'edges.Elemental Mastery', '=', 'source + 1'
    );
    rules.defineRule('arcanaNotes.elementalMastery.1',
      'edges.Elemental Mastery', '=', 'source == 3 ? "-0" : -source'
    );
    rules.defineRule
      ('elementalismCount', 'arcanaNotes.elementalMastery', '+', 'source - 1');
  } else if((matchInfo = name.match(/Elementalism \((.*)\)/)) != null) {
    rules.defineRule('features.Arcane Background (' + name + ')',
      'features.' + name, '=', '1'
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
    rules.defineRule('weapons.Bow.2', 'combatNotes.mightyShot', '=', null);
    rules.defineRule
      ('weapons.Bow.3', 'combatNotes.mightyShot.1', '=', 'source + "+"');
    rules.defineRule('weapons.Bow.4', 'combatNotes.mightyShot', '=', '"d6"');
    rules.defineRule('weapons.Long Bow.2', 'combatNotes.mightyShot', '=', null);
    rules.defineRule
      ('weapons.Long Bow.3', 'combatNotes.mightyShot.1', '=', 'source + "+"');
    rules.defineRule
      ('weapons.Long Bow.4', 'combatNotes.mightyShot', '=', '"d6"');
  } else if(name == 'Mighty Throw') {
    var allWeapons = rules.getChoices('weapons');
    for(var w in allWeapons) {
      if(allWeapons[w].includes('Range') &&
         !allWeapons[w].includes('Category=R'))
        rules.defineRule
          ('weapons.' + w + '.6', 'combatNotes.mightyThrow', '+', '1');
    }
  } else if(name == 'New Rune') {
    rules.defineRule
      ('arcanaNotes.newRune', 'edges.New Rune', '=', 'source + 1');
    rules.defineRule('runeCount', 'arcanaNotes.newRune', '+', 'source - 1');
  } else if(name == 'Noble') {
    rules.defineRule('features.Rich', 'featureNotes.noble', '=', '1');
  } else if((matchInfo = name.match(/Rune Magic \((.*)\)/)) != null) {
    rules.defineRule('features.Arcane Background (' + name + ')',
      'features.' + name, '=', '1'
    );
    rules.defineRule
      ('skillStep.' + matchInfo[1], 'features.' + name, '+=', '1');
    var runePowers = QuilvynUtils.getAttrValueArray(rules.getChoices('arcanas')[name], 'Powers');
    runePowers.forEach
      (x => rules.defineRule('powers.' + x, 'features.' + name, '=', '1'));
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
    // empty; overrides basePlugin computation
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
  // No changes needed to the rules defined by base method
};

/* Defines in #rules# the rules associated with language #name#. */
Hellfrost.languageRules = function(rules, name) {
  rules.basePlugin.languageRules(rules, name);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with power #name#, which may be
 * acquired only after #advances# advances, requires #powerPoints# Power Points
 * to use, and can be cast at range #range#. #description# is a concise
 * description of the power's effects.
 */
Hellfrost.powerRules = function(
  rules, name, advances, powerPoints, range, description
) {
  rules.basePlugin.powerRules
    (rules, name, advances, powerPoints, range, description);
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

  var attr;
  var attrs = this.applyRules(attributes);
  var choices;
  var howMany;
  var i;

  // Give priests their deity's signature spell
  if(attribute == 'powers' && attrs['features.Arcane Background (Miracles)']) {
    var arcana =
      this.getChoices('arcanas')['Miracles (' + attributes['deity'] + ')'];
    var powers = [];
    if(arcana)
      powers = QuilvynUtils.getAttrValueArray(arcana, 'Powers');
    if(powers.length > 0)
      attributes['powers.' + powers[0]] = 1;
  }

  // Handle targeted allocations from Sneaky, Library, and Diverse features
  if(attribute == 'skills' &&
     attrs['features.Sneaky'] != null &&
     !attributes['skillAllocation.Stealth'] &&
     !attributes['skillAllocation.Lockpicking'] &&
     !attributes['skillAllocation.Thievery']) {
    attributes['skillAllocation.Stealth'] = 2;
  }
  if(attribute == 'skills' && attrs['features.Library'] != null) {
    howMany =
      attrs.smarts - QuilvynUtils.sumMatching(attributes, /skills.Knowledge/);
    var allSkills = this.getChoices('skills');
    for(attr in allSkills) {
      if(!attr.startsWith('Knowledge'))
        continue;
      if(howMany < 1)
        break;
      if(!attrs['skills.' + attr])
        attrs['skills.' + attr] = 0;
      attrs['skills.' + attr]++;
      howMany--;
    }
  }
  if(attribute == 'improvements' &&
     attrs['features.Diverse'] &&
     !attributes['improvementPointsAllocation.Edge'] &&
     !attributes['improvementPointsAllocation.Skills']) {
    attributes['improvementPointsAllocation.' + (QuilvynUtils.random(0, 1) == 0 ? 'Edge' : 'Skill')] = 2;
  }

  // Bit of a hack here. SWADE's randomizeOneAttribute doesn't know about
  // runeCount and elementalismCount, which determine the number of Rune and
  // Element edges, nor that the magic casting skills (e.g., Hrimwisardry) are
  // useless to non-casters. To avoid having those randomly assigned
  // inappropriately, temporarily remove the the unwanted choices from the
  // choices. For edges, we may have to replace some of the newly-assigned
  // choices with Rune Magic and Element edges to get the correct count.
  // TODO There's a risk that the randomizer will have assigned two edges, one
  // dependent on the other (e.g., Attractive and Very Attractive) and that the
  // code will reassign the base edge while leaving the dependent edge assigned.
  var preAttributes = Object.assign({}, attributes);
  var allChoices = null;
  if(attribute == 'edges') {
    allChoices = Object.assign({}, this.getChoices('edges'));
    choices = this.getChoices('edges');
    for(attr in choices) {
      if(attr.match(/^(Elementalism|Rune Magic)/))
        delete this.getChoices('edges')[attr];
    }
  } else if(attribute == 'skills') {
    allChoices = Object.assign({}, this.getChoices('skills'));
    choices = this.getChoices('arcanas');
    for(attr in choices) {
      var skill = QuilvynUtils.getAttrValue(choices[attr], 'Skill');
      if(skill && !(skill in this.basePlugin.SKILLS) &&
         !attributes['features.Arcane Background (' + attr + ')'])
        delete this.getChoices('skills')[skill];
    }
  }
  this.basePlugin.randomizeOneAttribute.apply(this, [attributes, attribute]);
  if(allChoices)
    this.choices[attribute] = allChoices;
  if(attribute == 'edges') {
    attrs = this.applyRules(attributes);
    var countEdges =
      {'elementalismCount':'Elementalism', 'runeCount':'Rune Magic'};
    var newEdges = [];
    for(attr in attributes) {
      if(attr.startsWith('edges.') && !(attr in preAttributes))
        newEdges.push(attr);
    }
    for(var count in countEdges) {
      howMany = attrs[count];
      if(!howMany)
        continue;
      choices = [];
      for(attr in this.getChoices('edges')) {
        if(!attr.startsWith(countEdges[count]))
          continue;
        if(attrs['features.' + attr])
          howMany--;
        else
          choices.push(attr);
      }
      while(howMany > 0 && choices.length > 0) {
        i = QuilvynUtils.random(0, choices.length - 1);
        attributes['edges.' + choices[i]] = 1;
        howMany--;
        choices.splice(i, 1);
        if(newEdges.length > 0) {
          i = QuilvynUtils.random(0, newEdges.length - 1);
          delete attributes[newEdges[i]];
          newEdges.splice(i, 1);
        } else if(attributes['edges.Power Points'] &&
                  attributes['edges.Power Points'] > 1) {
          attributes['edges.Power Points']--;
        } else if(attributes['edges.New Powers'] &&
                  attributes['edges.New Powers'] > 1) {
          attributes['edges.New Powers']--;
        }
      }
    }
  }

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
    '  <li>\n' +
    '    Quilvyn calculates and reports Power Points for those who want to\n' +
    '    use the power mechanics from he base rules. Edges that affect\n' +
    '    power points (Rapid Recharge, Soul Drain etc.) are also available.\n' +
    '  </li>\n' +
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
    '</p>\n' +
    '<img alt="Savage Worlds Fan Logo" width="300" height="200" src="https://peginc.com/wp-content/uploads/2019/01/SW_LOGO_FP_2018.png"/>\n';
};
