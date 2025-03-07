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

  let useSwade =
    baseRules && !baseRules.match(/deluxe|swd/i) && window.SWADE != null;

  if(window.SWADE == null) {
    alert('The Hellfrost module requires use of the SWADE module');
    return;
  } else if(!useSwade && window.SWD == null) {
    alert('The Hellfrost module requires use of the SWD module');
    return;
  }

  let rules = new QuilvynRules(
    'Hellfrost - SW' + (useSwade ? 'ADE' : 'D'), Hellfrost.VERSION
  );
  rules.plugin = Hellfrost;
  Hellfrost.rules = rules;
  rules.basePlugin = useSwade ? window.SWADE : window.SWD;

  rules.defineChoice('choices', Hellfrost.CHOICES);
  rules.choiceEditorElements = Hellfrost.choiceEditorElements;
  rules.choiceRules = Hellfrost.choiceRules;
  rules.removeChoice = SWADE.removeChoice;
  rules.editorElements = rules.basePlugin.initialEditorElements();
  rules.getFormats = rules.basePlugin.getFormats;
  rules.getPlugins = Hellfrost.getPlugins;
  rules.makeValid = rules.basePlugin.makeValid;
  rules.randomizeOneAttribute = Hellfrost.randomizeOneAttribute;
  rules.defineChoice('random', Hellfrost.RANDOMIZABLE_ATTRIBUTES);
  rules.ruleNotes = Hellfrost.ruleNotes;

  SWADE.createViewers(rules, rules.basePlugin.VIEWERS);
  rules.defineChoice('extras',
    'edges', 'edgePoints', 'hindrances', 'sanityNotes', 'validationNotes'
  );
  rules.defineChoice('preset',
    'race:Race,select-one,races', 'advances:Advances,text,4',
    'concepts:Concepts,set,concepts', 'deity:Deity,select-one,deitys'
  );

  Hellfrost.ARCANAS =
    Object.assign({}, rules.basePlugin.ARCANAS, Hellfrost.ARCANAS_ADDED);
  delete Hellfrost.ARCANAS.Magic;
  delete Hellfrost.ARCANAS['Super Powers'];
  delete Hellfrost.ARCANAS['Weird Science'];
  Hellfrost.EDGES =
    Object.assign({}, rules.basePlugin.EDGES, Hellfrost.EDGES_ADDED);
  delete Hellfrost.EDGES.Ace;
  delete Hellfrost.EDGES.Gadgeteer;
  delete Hellfrost.EDGES['Arcane Background (Gifted)'];
  delete Hellfrost.EDGES['Arcane Background (Magic)'];
  delete Hellfrost.EDGES['Arcane Background (Super Powers)'];
  delete Hellfrost.EDGES['Arcane Background (Weird Science)'];
  delete Hellfrost.EDGES['Double Tap'];
  delete Hellfrost.EDGES['Improved Rapid Fire'];
  delete Hellfrost.EDGES['Rapid Fire'];
  delete Hellfrost.EDGES['Rock And Roll'];
  delete Hellfrost.EDGES['Two-Gun Kid'];
  Hellfrost.FEATURES =
    Object.assign({}, rules.basePlugin.FEATURES, Hellfrost.FEATURES_ADDED);
  Hellfrost.FEATURES['Arcane Background (Miracles)'] =
    Hellfrost.FEATURES['Arcane Background (Miracles)'].
      replace('Section=', 'Section=feature,').
      replace('Note=', 'Note="Has Connections and Orders features",');
  Hellfrost.GOODIES = Object.assign({}, rules.basePlugin.GOODIES);
  Hellfrost.HINDRANCES =
    Object.assign({}, rules.basePlugin.HINDRANCES, Hellfrost.HINDRANCES_ADDED);
  Hellfrost.POWERS =
    Object.assign({}, rules.basePlugin.POWERS, Hellfrost.POWERS_ADDED);
  Hellfrost.SKILLS = Object.assign(Object.fromEntries(Object.entries(rules.basePlugin.SKILLS).filter(([k, v]) => !v.includes('Era') || v.match(/Era=[\w,]*Medieval/))), Hellfrost.SKILLS_ADDED);
  delete Hellfrost.SKILLS['Knowledge (Language (%language))'];
  delete Hellfrost.SKILLS['Language (%language)'];
  delete Hellfrost.SKILLS['Weird Science'];

  if(useSwade) {
    Hellfrost.ARCANAS = Hellfrost.SWD2SWADE(Hellfrost.ARCANAS);
    Hellfrost.CONCEPTS = Hellfrost.SWD2SWADE(Hellfrost.CONCEPTS);
    Hellfrost.DEITYS = Hellfrost.SWD2SWADE(Hellfrost.DEITYS);
    Hellfrost.EDGES = Hellfrost.SWD2SWADE(Hellfrost.EDGES);
    Hellfrost.FEATURES = Hellfrost.SWD2SWADE(Hellfrost.FEATURES);
    Hellfrost.GOODIES = Hellfrost.SWD2SWADE(Hellfrost.GOODIES);
    Hellfrost.HINDRANCES = Hellfrost.SWD2SWADE(Hellfrost.HINDRANCES);
    Hellfrost.POWERS = Hellfrost.SWD2SWADE(Hellfrost.POWERS);
    Hellfrost.RACES = Hellfrost.SWD2SWADE(Hellfrost.RACES);
    Hellfrost.SKILLS = Hellfrost.SWD2SWADE(Hellfrost.SKILLS);
    for(let a in Hellfrost.ARMORS) {
      if(a in SWADE.ARMORS)
        Hellfrost.ARMORS[a] += ' ' + SWADE.ARMORS[a];
      else if(!a.match(/Robes|None/)) {
        // SWADE generally boosts armor by 1
        let m = Hellfrost.ARMORS[a].match(/Armor=(\d+)/);
        if(m)
          Hellfrost.ARMORS[a] += ' Armor=' + (m[1] - 0 + 1);
      }
    }
    for(let s in Hellfrost.SHIELDS)
      if(s in SWADE.SHIELDS)
        Hellfrost.SHIELDS[s] += ' ' + SWADE.SHIELDS[s];
    for(let w in Hellfrost.WEAPONS)
      if(w in SWADE.WEAPONS)
        Hellfrost.WEAPONS[w] += ' ' + SWADE.WEAPONS[w];
  }

  Hellfrost.attributeRules(rules);
  Hellfrost.combatRules
    (rules, Hellfrost.ARMORS, Hellfrost.SHIELDS, Hellfrost.WEAPONS);
  Hellfrost.arcaneRules(rules, Hellfrost.ARCANAS, Hellfrost.POWERS);
  Hellfrost.talentRules
    (rules, Hellfrost.EDGES, Hellfrost.FEATURES, Hellfrost.GOODIES,
     Hellfrost.HINDRANCES, Hellfrost.SKILLS, Hellfrost.LANGUAGES,
     Hellfrost.GLORY_REWARDS);
  Hellfrost.identityRules
    (rules, Hellfrost.RACES, Hellfrost.CONCEPTS, Hellfrost.DEITYS);

  Quilvyn.addRuleSet(rules);

}

Hellfrost.VERSION = '2.4.1.1';

Hellfrost.CHOICES = ['Deity', 'Glory Reward', 'Language'].concat(SWADE.CHOICES.filter(x => x != 'Era'));
Hellfrost.RANDOMIZABLE_ATTRIBUTES =
  SWADE.RANDOMIZABLE_ATTRIBUTES.concat(['deity', 'glory rewards', 'languages']);

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
      '"Wall Walker",Warding,Whirlwind,"Wilderness Step","Hamper Movement"',
  'Elementalism (Eir)':
    'Skill=Elementalism ' +
    'Powers=' +
      'Aim,Banish,Becalm,"Beast Friend",Bolt,Deflection,Detect/Conceal,' +
      '"Elemental Form","Elemental Manipulation","Energy Immunity",' +
      '"Environmental Protection",Etherealness/Corporealness,Farsight,' +
      'Fatigue,Fly,Glyph,Invisibility,Knockdown,Leaping,Obscure,Quickness,' +
      'Sanctuary,Sentry,Silence,Slumber,"Speak Language","Sphere Of Might",' +
      'Storm,"Summon Elemental",Telekinesis,Teleport,"Voice On The Wind",' +
      '"Wandering Senses",Warding,Whirlwind,Zephyr,"Hamper Movement"',
  'Elementalism (Ertha)':
    'Skill=Elementalism ' +
    'Powers=' +
      'Armor,Banish,Barrier,"Beast Friend",Bladebreaker,Blast,Bolt,Bridge,' +
      'Burrow,Detect/Conceal,"Elemental Form","Elemental Manipulation",' +
      '"Energy Immunity",Entangle,Glyph,Growth/Shrink,Knockdown,Lock/Unlock,' +
      'Mend,"Prolonged Blast",Quake,Refuge,Sanctuary,"Sphere Of Might",' +
      '"Summon Elemental","Viper Weapon","Wall Walker",Warding,' +
      '"Weapon Immunity","Wilderness Step","Hamper Movement"',
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
      '"Water Walk","Hamper Movement"',
  'Finnar Wind Priest':
    'Skill=Faith ' +
    'Powers=' +
      'Aim,Aura,Banish,Becalm,Blast,Bolt,Burst,Deflection,"Elemental Form",' +
      'Entangle,Fly,"Fog Cloud","Hamper Movement",Knockdown,Leaping,' +
      '"Prolonged Blast","Sluggish Reflexes",Speed,"Sphere Of Might",Storm,' +
      'Stun,Telekinesis,"Voice On The Wind",Whirlwind,Zephyr',
  'Glamour':
    'Skill=Glamour ' +
    'Powers=' +
      '"Beast Friend",Bless/Panic,"Charismatic Aura",Confusion,Deflection,' +
      '"Elemental Manipulation",Fear,Invisibility,Nightmare,Obscure,Puppet,' +
      '"Shape Change","Speak Language",Stun,"Voice On The Wind"',
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
      'Warding,Whirlwind,"Wilderness Step","Hamper Movement"',
  'Miracles (Dargar)':
    'Powers=' +
      'Smite,Armor,"Battle Song",Blast,Bolt,"Boost/Lower Trait",Burst,' +
      '"Champion Of The Faith","Energy Immunity","Gift Of Battle",' +
      '"Prolonged Blast",Quickness,Sanctuary,"Sphere Of Might",' +
      '"Summon Demon","Summon Herald","Warrior\'s Gift","Weapon Immunity",' +
      '"Summon Spirit"',
  'Miracles (Eira)':
    'Powers=' +
      'Healing,"Arcane Resistance","Beast Friend",Bladebreaker,Bless,' +
      'Bodyguard,"Boost/Lower Trait","Champion Of The Faith",Confusion,' +
      'Dispel,"Energy Immunity","Environmental Protection",Feast,Glyph,' +
      '"Greater Healing",Knockdown,Refuge,Regenerate,Sanctuary,Slumber,Stun,' +
      'Succor,"Summon Herald",Warding,"Weapon Immunity","Summon Spirit"',
  'Miracles (Eostre Animalmother)':
    'Powers=' +
      '"Beast Friend",Entangle,"Altered Senses","Animate War Tree",Barrier,' +
      'Bolt,"Boost/Lower Trait",Bridge,Burrow,"Champion Of The Faith",' +
      '"Elemental Manipulation",Entangle,"Environmental Protection",Farsight,' +
      'Feast,Glyph,Growth/Shrink,Healing,Leaping,Mend,Refuge,Sanctuary,' +
      '"Shape Change",Sentry,"Summon Beast","Summon Elemental",' +
      '"Summon Herald","Sphere Of Might","Wall Walker","Wandering Senses",' +
      '"Wilderness Step","Hamper Movement"',
  'Miracles (Eostre Plantmother)':
    'Powers=' +
      'Entangle,"Beast Friend","Altered Senses","Animate War Tree",Barrier,' +
      'Bolt,"Boost/Lower Trait",Bridge,Burrow,"Champion Of The Faith",' +
      '"Elemental Manipulation",Entangle,"Environmental Protection",Farsight,' +
      'Feast,Glyph,Growth/Shrink,Healing,Leaping,Mend,Refuge,Sanctuary,' +
      '"Shape Change",Sentry,"Summon Beast","Summon Elemental",' +
      '"Summon Herald","Sphere Of Might","Wall Walker","Wandering Senses",' +
      '"Wilderness Step","Hamper Movement"',
  'Miracles (Ertha)':
    'Powers=' +
      'Burrow,Armor,Barrier,"Beast Friend",Bladebreaker,Bolt,' +
      '"Boost/Lower Trait",Bridge,"Champion Of The Faith",Detect/Conceal,' +
      '"Elemental Form","Elemental Manipulation","Energy Immunity",Entangle,' +
      '"Environmental Protection",Corporealness,Glyph,Growth/Shrink,Quake,' +
      'Refuge,Sanctuary,"Sphere Of Might","Summon Elemental","Summon Herald",' +
      '"Wall Walker","Weapon Immunity","Wilderness Step","Hamper Movement"',
  'Miracles (Freo)':
    'Powers=' +
      '"Wilderness Step","Beast Friend",Bodyguard,Bolt,"Boost/Lower Trait",' +
      'Bridge,"Champion Of The Faith",Entangle,"Environmental Protection",' +
      'Etherealness,Farsight,Feast,Fly,Leaping,Mend,Quickness,Sanctuary,' +
      'Sentry,"Speak Language",Speed,Storm,Succor,"Summon Herald",Teleport,' +
      '"Voice On The Wind","Wall Walker","Wandering Senses",Zephyr,' +
      '"Hamper Movement"',
  'Miracles (Hela)':
    'Powers=' +
      'Zombie,"Arcane Resistance",Armor,Aura,Banish,"Beast Friend",Blast,' +
      'Bolt,"Boost/Lower Trait","Champion Of The Faith","Corpse Senses",' +
      'Deflection,Dispel,"Enhance Undead",Etherealness/Corporealness,Fatigue,' +
      'Fear,"Fog Cloud",Glyph,Gravespeak,"Greater Zombie",Invisibility,' +
      'Nightmare,Obscure,"Prolonged Blast",Sacrifice,Sanctuary,' +
      '"Sluggish Reflexes",Slumber,"Strength Of The Undead",Stun,' +
      '"Summon Herald","Weaken Undead","Hamper Movement","Summon Spirit"',
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
      '"Sphere Of Might","Water Walk","Hamper Movement"',
  'Miracles (Niht)':
    'Powers=' +
      'Obscure,"Altered Senses",Banish,Panic,Bolt,"Boost/Lower Trait",Burrow,' +
      '"Champion Of The Faith",Confusion,Deflection,Conceal,' +
      '"Energy Immunity",Entangle,Etherealness/Corporealness,Farsight,Fear,' +
      '"Fog Cloud","Heat Mask",Invisibility,Nightmare,Quickness,Sacrifice,' +
      'Sanctuary,Sentry,Shrink,Silence,Smite,"Summon Elemental",' +
      '"Summon Herald",Teleport,"Wall Walker","Wandering Senses",' +
      '"Summon Spirit"',
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
      '"Warrior\'s Gift","Weapon Immunity","Summon Spirit"',
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
      '"Wilderness Step","Hamper Movement"',
  'Miracles (Thunor)':
    'Powers=' +
      'Fly,Aim,Barrier,Becalm,"Beast Friend",Bolt,"Champion Of The Faith",' +
      'Deflection,"Elemental Form","Elemental Manipulation",' +
      '"Energy Immunity","Environmental Protection",' +
      'Etherealness/Corporealness,Fatigue,"Fog Cloud",Glyph,Knockdown,' +
      'Leaping,Obscure,Sanctuary,"Shape Change",Silence,Storm,"Summon Beast",' +
      '"Summon Elemental","Summon Herald",Telekinesis,"Sphere Of Might",' +
      '"Voice On The Wind",Whirlwind,Zephyr,"Hamper Movement","Summon Spirit"',
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
      '"Weapon Immunity","Hamper Movement","Summon Spirit"',
  'Miracles (Vali)':
    'Powers=' +
      'Disease,"Charismatic Aura",Armor,Barrier,Aura,"Beast Friend",' +
      '"Boost/Lower Trait",Burrow,"Champion Of The Faith","Charismatic Aura",' +
      'Detect/Conceal,Disease,Entangle,Fatigue,Fear,Nightmare,Obscure,Puppet,' +
      'Sacrifice,Sanctuary,"Shape Change",Smite,Stun,"Summon Demon",' +
      '"Summon Herald","Summon Spirit"',
  'Miracles (Var)':
    'Powers=' +
      '"Charismatic Aura",Bladebreaker,Bodyguard,Bolt,"Boost/Lower Trait",' +
      'Confusion,Deflection,Detect/Conceal,Entangle,Fear,Lock,Puppet,' +
      'Sanctuary,Sentry,Silence,Slumber,"Speak Language",Speed,' +
      '"Summon Herald",Teleport,"Summon Spirit"',
  'Psionics':
    'Skill=Psionics ' +
    'Powers=' +
      '"Analyze Foe","Beast Friend",Bolt,"Boost/Lower Trait",Burst,' +
      '"Charismatic Aura",Deflection,Detect/Conceal,"Energy Immunity",' +
      '"Environmental Protection",Farsight,Fatigue,Fear,Healing,Leaping,' +
      'Mimic,"Mind Reading",Precognition,Puppet,Quickness,Smite,' +
      '"Speak Language",Speed,Stun,Succor,Telekinesis,"Voice On The Wind",' +
      '"Wandering Senses","Weapon Immunity"',
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
  'Solar Magic':
    'Skill="Solar Magic" ' +
    'Powers=' +
      '"Altered Senses",Aura,Banish,Barrier,Blast,Bless/Panic,Bolt,Burst,' +
      '"Charismatic Aura",Deflection,Detect/Conceal,"Elemental Manipulation",' +
      'Dispel,"Elemental Manipulation","Energy Immunity",Farsight,Fly,Glyph,' +
      '"Heat Mask","Prolonged Blast",Quickness,"Sphere Of Might",Smite,Speed,' +
      'Stun,"Weaken Undead"',
  'Song Magic':
    'Skill="Song Magic" ' +
    'Powers=' +
      '"Arcane Resistance",Banish,"Battle Song","Beast Friend",Bless/Panic,' +
      '"Boost/Lower Trait","Charismatic Aura",Confusion,Detect/Conceal,' +
      'Dispel,"Elemental Manipulation",Fatigue,Fear,Healing,Lock/Unlock,' +
      'Mimic,"Negate Arcana",Nightmare,Puppet,Sanctuary,Silence,Slumber,' +
      '"Speak Language",Stun,Succor,"Summon Beast","Voice On The Wind",' +
      'Warding,"Warrior\'s Gift","Wilderness Step"',
  'Soul Binding':
    'Skill="Soul Binding" ' +
    'Powers="Boost Trait","Warrior\'s Gift"'
};
Hellfrost.ARCANAS = Object.assign({}, SWD.ARCANAS, Hellfrost.ARCANAS_ADDED);
delete Hellfrost.ARCANAS.Magic;
delete Hellfrost.ARCANAS['Super Powers'];
delete Hellfrost.ARCANAS['Weird Science'];
// MinStr values taken/extrapolated from SWADE rules
Hellfrost.ARMORS = {
  'None':'Area=Body Armor=0 Weight=0 MinStr=0',
  'Hide':'Area=Body Armor=1 Weight=15 MinStr=6',
  'Leather Suit':'Area=Body Armor=1 Weight=10 MinStr=6',
  'Leather Shirt':'Area=Torso Armor=1 Weight=3 MinStr=6',
  'Chain Hauberk':'Area=Body Armor=2 Weight=20 MinStr=8',
  'Chain Shirt':'Area=Torso Armor=2 Weight=10 MinStr=8',
  'Chain Leggings':'Area=Legs Armor=2 Weight=8 MinStr=8',
  'Chain Sleeves':'Area=Arms Armor=2 Weight=6 MinStr=8',
  'Scale Hauberk':'Area=Body Armor=2 Weight=25 MinStr=10',
  'Plate Corselet':'Area=Torso Armor=3 Weight=20 MinStr=10',
  'Plate Bracers':'Area=Arms Armor=3 Weight=8 MinStr=10',
  'Plate Greaves':'Area=Legs Armor=3 Weight=12 MinStr=10',
  'Chain Coif':'Area=Head Armor=2 Weight=3 MinStr=8',
  'Pot Helm':'Area=Head Armor=3 Weight=4 MinStr=8',
  'Full Helmet':'Area=Head Armor=3 Weight=8 MinStr=10',
  'Blessed Robes':'Area=Body Armor=1 Weight=8 MinStr=4',
  'Blessed Armor':'Area=Body Armor=3 Weight=30 MinStr=10'
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
  'Finnar Wind Priest':
    'Edge="Arcane Background (Finnar Wind Priest)" ' +
    'Attribute=Smarts ' +
    'Skill=Faith',
  'Glamourist':
    'Edge="Arcane Background (Glamour)" ' +
    'Attribute=Smarts ' +
    'Skill=Glamour',
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
  'Puppeteer':
    'Edge="Arcane Background (Psionics)" ' +
    'Attribute=Smarts ' +
    'Skill=Psionics',
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
  'Solar Magician':
    'Edge="Arcane Background (Solar Magic)" ' +
    'Attribute=Smarts ' +
    'Skill="Solar Magic"',
  'Soul Binder':
    'Edge="Arcane Background (Soul Binding)" ' +
    'Attribute=Smarts ' +
    'Skill="Soul Binding"',
  'Thief':
    'Edge=Thief ' +
    'Attribute=Agility ' +
    'Skill=Climbing,Lockpicking,Stealth',
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
Hellfrost.DEITYS = {
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

  // Player's Guide
  // Background
  'Arcane Background (Druidism)':
    'Type=Background Require="race =~ \'Engro|Elf|Dwarf\'"',
  'Arcane Background (Elementalism)':
    'Type=Background ' +
    'Require=' +
      '"edges.Elementalism (Eir) || edges.Elementalism (Ertha) || ' +
       'edges.Elementalism (Fyr) || edges.Elementalism (Waeter)"',
  'Arcane Background (Heahwisardry)':'Type=Background Require=features.Noble',
  'Arcane Background (Hrimwisardry)':'Type=Background',
  'Arcane Background (Rune Magic)':
    'Type=Background Require="race == \'Frost Dwarf\'"',
  'Arcane Background (Soul Binding)':'Type=Background',
  'Arcane Background (Song Magic)':'Type=Background',
  'Library':
    'Type=Background ' +
    'Require="features.Rich || features.Lorekeeper","features.Illiterate == 0"',
  'Linguist':'Type=Background Require="smarts >= 6","features.Illiterate == 0"',
  'Noble':'Type=Background',
  'Old Family':
    'Type=Background Require="features.Arcane Background (Heahwisardry)"',
  'Styrimathr':'Type=Background Require="skills.Boating >= 8"',
  'Warm Blooded':
    'Type=Background Require="race =~ \'Engro|Hearth Elf|Human\'","vigor >= 8"',
  // Combat
  'Blood And Guts':
    'Type=Combat ' +
    'Require=' +
      '"advances >= 8",' +
      '"skills.Fighting>=10 || skills.Shooting>=10 || skills.Throwing>=10"',
  'Courageous':'Type=Combat Require="spirit >= 8"',
  'Double Shot':
    'Type=Combat ' +
    'Require="advances >= 4","race =~ \'Elf\'","skills.Shooting >= 8"',
  'Improved Double Shot':
    'Type=Combat Require="advances >= 12","features.Double Shot"',
  'Favored Foe':
    'Type=Combat ' +
    'Require=' +
      '"advances >= 4",' +
      '"smarts >= 8",' +
      '"skills.Fighting >= 8 || skills.Shooting >= 8 || skills.Throwing >= 8"',
  'Improved Giant Killer':
    'Type=Combat Require="advances >= 12","features.Giant Killer"',
  'Mighty Shot':
    'Type=Combat ' +
    'Require="advances >= 8","strength >= 8","skills.Shooting >= 10"',
  'Mighty Throw':
    'Type=Combat ' +
    'Require="advances >= 8","strength >= 8","skills.Throwing >= 10"',
  'Necromantic Severing':
    'Type=Combat ' +
    'Require="advances >= 8","spirit >= 8","skills.Fighting >= 10"',
  'Oversized Weapon Master':
    'Type=Combat ' +
    'Require=' +
      '"advances >= 8",' +
      '"strength >= 10",' +
      '"skills.Fighting >= 10",' +
      '"size >= 0"',
  'Rune Magic (Armor-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Arrow-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Battle-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Beast-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Blessing-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Calming-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Change-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Charm-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Coldfire-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Curse-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Cut-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Dispel-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Earth-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Elemental-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Glow-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Healing-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Secret-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Shield-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Tongue-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Travel-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Rune Magic (Weather-Rune)':
    'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Scamper':
    'Type=Combat ' +
    'Require="advances >= 4","race == \'Engro\'","agility >= 8"',
  'Shieldwall':
    'Type=Combat ' +
    'Require="advances >= 4",features.Block,"shield =~ \'Medium|Large\'"',
  'Snow Walker':'Type=Combat Require="agility >= 6"',
  'Improved Snow Walker':
    'Type=Combat Require="advances >= 4","features.Snow Walker"',
  'Sunder':
    'Type=Combat ' +
    'Require="advances >= 4","race == \'Frost Dwarf\'","strength >= 8"',
  'Improved Sunder':'Type=Combat Require="advances >= 8",features.Sunder',
  'Wall Of Steel':
    'Type=Combat ' +
    'Require=' +
      '"advances >= 8",' +
      '"agility >= 8",' +
      '"skills.Fighting >= 8",' +
      '"skills.Notice >= 8"',
  'War Cry':
    'Type=Combat ' +
    'Require=' +
      '"advances >= 4",' +
      '"race =~ \'Frost Dwarf|Saxa\' || features.Disciple Of Dargar",' +
      '"skills.Intimidation >= 8"',
  // Disciple
  'Disciple Of Dargar':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"strength >= 8",' +
      '"skills.Faith >= 8",' +
      '"skills.Fighting >= 8",' +
      '"skills.Intimidation >= 8",' +
      '"deity == \'Dargar\'"',
  'Disciple Of Eira':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"spirit >= 8",' +
      '"skills.Faith >= 8",' +
      '"skills.Healing >= 6",' +
      '"deity == \'Eira\'"',
  'Disciple Of Eostre Animalmother':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"spirit >= 8",' +
      '"skills.Faith >= 8",' +
      '"features.Beast Bond",' +
      '"deity == \'Eostre\'"',
  'Disciple Of Eostre Plantmother':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"agility >= 8",' +
      '"spirit >= 8",' +
      '"vigor >= 8",' +
      '"skills.Faith >= 8",' +
      '"deity == \'Eostre\'"',
  'Disciple Of Ertha':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"vigor >= 8",' +
      '"skills.Climbing >= 6",' +
      '"skills.Faith >= 8",' +
      '"skills.Survival >= 6",' +
      '"deity == \'Ertha\'"',
  'Disciple Of Freo':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"agility >= 8",' +
      '"vigor >= 8",' +
      '"skills.Faith >= 8",' +
      '"deity == \'Freo\'"',
  'Disciple Of Hela':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"spirit >= 8",' +
      '"skills.Faith >= 8",' +
      '"deity == \'Hela\'"',
  'Disciple Of Hoenir':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"smarts >= 10",' +
      '"skills.Faith >= 8",' +
      '"features.Scholar || Sum \'features.Scholar\' > 0",' +
      '"deity == \'Hoenir\'"',
  'Disciple Of Hothar':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"smarts >= 8",' +
      '"skills.Faith >= 8",' +
      '"skills.Notice >= 6",' +
      'features.Investigator,' +
      '"deity == \'Hothar\'"',
  'Disciple Of Kenaz':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"vigor >= 8",' +
      '"skills.Faith >= 8",' +
      '"deity == \'Kenaz\'"',
  'Disciple Of Maera':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"smarts >= 8",' +
      '"spirit >= 6",' +
      '"skills.Faith >= 8",' +
      '"deity == \'Maera\'"',
  'Disciple Of Nauthiz':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"agility >= 10",' +
      '"skills.Faith >= 8",' +
      '"skills.Gambling >= 8",' +
      '"features.Thief",' +
      '"deity == \'Nauthiz\'"',
  'Disciple Of Neorthe':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"vigor >= 8",' +
      '"skills.Boating >= 6",' +
      '"skills.Faith >= 6",' +
      '"skills.Swimming >= 6",' +
      '"deity == \'Neorthe\'"',
  'Disciple Of Niht':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"skills.Faith >= 8",' +
      '"skills.Notice >= 8",' +
      '"skills.Stealth >= 8",' +
      '"deity == \'Niht\'"',
  'Disciple Of The Norns':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"smarts >= 8",' +
      '"skills.Faith >= 8",' +
      '"deity == \'The Norns\'"',
  'Disciple Of Rigr':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"vigor >= 8",' +
      '"skills.Faith >= 8",' +
      '"skills.Notice >= 8",' +
      'features.Alertness,' +
      '"deity == \'Rigr\'"',
  'Disciple Of Scaetha':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"spirit >= 6",' +
      '"skills.Faith >= 8",' +
      '"skills.Fighting >= 8",' +
      '"deity == \'Scaetha\'"',
  'Disciple Of Sigel':
    'Type=Disciple ' +
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
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"spirit >= 8",' +
      '"skills.Faith >= 8",' +
      '"deity == \'Thunor\'"',
  'Disciple Of Tiw':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"strength >= 8",' +
      '"vigor >= 8",' +
      '"skills.Faith >= 8",' +
      '"skills.Fighting >= 10",' +
      '"deity == \'Tiw\'"',
  'Disciple Of Ullr':
    'Type=Disciple ' +
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
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"agility >= 8",' +
      '"smarts >= 8",' +
      '"skills.Faith >= 6",' +
      '"skills.Taunt >= 8",' +
      '"deity == \'The Unknowable One\'"',
  'Disciple Of Vali':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"vigor >= 6",' +
      '"skills.Faith >= 8",' +
      '"deity == \'Vali\'"',
  'Disciple Of Var':
    'Type=Disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"skills.Faith >= 8",' +
      '"skills.Persuasion >= 8",' +
      '"skills.Streetwise >= 8",' +
      '"deity == \'Var\'"',
  // Leadership
  'A Few Good Men':
    'Type=Leadership ' +
    'Require=' +
      '"advances >= 12",' +
      '"smarts >= 8",' +
      '"skills.Knowledge (Battle) >= 10",' +
      'features.Command,' +
      'features.Inspire',
  'Coordinated Firepower':
    'Type=Leadership ' +
    'Require=' +
      '"advances >= 8",' +
      '"smarts >= 6",' +
      '"skills.Shooting >= 8",' +
      '"skills.Throwing >= 8",' +
      'features.Command',
  'Cry Havoc!':
    'Type=Leadership ' +
    'Require=' +
      '"advances >= 8",' +
      '"spirit >= 8",' +
      '"skills.Knowledge (Battle) >= 10",' +
      'features.Command,' +
      'features.Fervor',
  'Death Before Dishonor':
    'Type=Leadership ' +
    'Require=' +
      '"advances >= 8",' +
      '"spirit >= 8",' +
      '"skills.Knowledge (Battle) >= 8",' +
      'features.Command,' +
      '"features.Hold The Line!"',
  'Fanaticism':
    'Type=Leadership Require="advances >= 4",features.Command,features.Fervor',
  'Siege Breaker':
    'Type=Leadership ' +
    'Require="advances >= 4","smarts >= 8","skills.Knowledge (Battle) >= 8"',
  'Siege Mentality':
    'Type=Leadership ' +
    'Require="advances >= 4","smarts >= 8","skills.Knowledge (Battle) >= 8"',
  'Tactician':
    'Type=Leadership ' +
    'Require=' +
      '"advances >= 4",' +
      '"smarts >= 8",' +
      '"skills.Knowledge (Battle) >= 6",' +
      'features.Command',
  // Power
  'Alchemy':
    'Type=Power ' +
    'Require=' +
      '"advances >= 4",' +
      'powerCount,' +
      '"arcaneSkill >= 6",' +
      '"skills.Knowledge (Alchemy) >= 6"',
  'Augment Staff (Aura)':
    'Type=Power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Heahwisardry)",' +
      '"skills.Heahwisardry >= 8",' +
      '"skills.Knowledge (Arcana) >= 8"',
  'Augment Staff (Damage)':
    'Type=Power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Heahwisardry)",' +
      '"skills.Heahwisardry >= 8",' +
      '"skills.Knowledge (Arcana) >= 8"',
  'Augment Staff (Deflect)':
    'Type=Power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Heahwisardry)",' +
      '"skills.Heahwisardry >= 8",' +
      '"skills.Knowledge (Arcana) >= 8"',
  'Augment Staff (Spell Store)':
    'Type=Power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Heahwisardry)",' +
      '"skills.Heahwisardry >= 8",' +
      '"skills.Knowledge (Arcana) >= 8"',
  'Combine Spells':
    'Type=Power ' +
    'Require=' +
       '"advances >= 12",' +
       'powerCount,' +
       '"arcaneSkill >= 10",' +
       '"skills.Knowledge (Arcana) >= 10"',
  'Concentration':
    'Type=Power ' +
    'Require=' +
      '"advances >= 4",' +
      'powerCount,' +
      '"smarts >= 6",' +
      '"spirit >= 6",' +
      '"vigor >= 6"',
  'Improved Concentration':
    'Type=Power Require="advances >= 8",features.Concentration',
  'Elemental Mastery':
    'Type=Power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Elementalism)"',
  'Elementalism (Eir)':
    'Type=Power Require="features.Arcane Background (Elementalism)"',
  'Elementalism (Ertha)':
    'Type=Power Require="features.Arcane Background (Elementalism)"',
  'Elementalism (Fyr)':
    'Type=Power Require="features.Arcane Background (Elementalism)"',
  'Elementalism (Waeter)':
    'Type=Power Require="features.Arcane Background (Elementalism)"',
  'Focus':
    'Type=Power ' +
    'Require="advances >= 4",powerCount,"spirit >= 6","arcaneSkill >= 8"',
  'Improved Focus':'Type=Power Require="advances >= 12",features.Focus',
  'Hellfreeze':
    'Type=Power ' +
    'Require=' +
      '"advances >= 8",' +
      'powerCount,' +
      '"arcaneSkill >= 10",' +
      '"skills.Knowledge (Arcana) >= 10"',
  'New Rune':'Type=Power Require="features.Arcane Background (Rune Magic)"',
  'Power Surge':
    'Type=Power Require="advances >= 4",powerCount,"arcaneSkill >= 10"',
  'Runic Insight':
    'Type=Power ' +
    'Require="features.Arcane Background (Rune Magic)","arcaneSkill >= 8"',
  'Spell Finesse (Arcane)':
    'Type=Power ' +
    'Require=powerCount,"arcaneSkill >= 8","skills.Knowledge (Arcana) >= 8"',
  'Spell Finesse (Armor Penetration)':
    'Type=Power ' +
    'Require=powerCount,"arcaneSkill >= 8","skills.Knowledge (Arcana) >= 8"',
  'Spell Finesse (Heavy Weapon)':
    'Type=Power ' +
    'Require=powerCount,"arcaneSkill >= 8","skills.Knowledge (Arcana) >= 8"',
  'Spell Finesse (Range)':
    'Type=Power ' +
    'Require=powerCount,"arcaneSkill >= 8","skills.Knowledge (Arcana) >= 8"',
  'Spell Finesse (Selective)':
    'Type=Power ' +
    'Require=powerCount,"arcaneSkill >= 8","skills.Knowledge (Arcana) >= 8"',
  // Professional
  'Bladedancer':
    'Type=Professional ' +
    'Require=' +
      '"race =~ \'Elf\'",' +
      '"agility >= 8",' +
      '"skills.Fighting >= 8",' +
      '"features.Two-Fisted"',
  'Bludgeoner':
    'Type=Professional ' +
    'Require=' +
      '"race == \'Engro\'",' +
      '"spirit >= 8",' +
      '"strength >= 6",' +
      '"skills.Intimidation >= 6",' +
      '"skills.Shooting >= 8"',
  'Gray Legionary':
    'Type=Professional ' +
    'Require=' +
      '"spirit >= 8",' +
      '"skills.Fighting >= 8",' +
      '"skills.Shooting >= 6 || skills.Throwing >= 6"',
  'Guild Thief':
    'Type=Professional ' +
    'Require=' +
      '"features.Thief"',
  'Hearth Knight':
    'Type=Professional ' +
    'Require=' +
      '"spirit >= 8",' +
      '"vigor >= 8",' +
      '"skills.Fighting >= 6",' +
      '"skills.Riding >= 6",' +
      '"skills.Survival >= 8"',
  'Hedge Magic':
    'Type=Professional ' +
    'Require=' +
      '"smarts >= 8",' +
      '"skills.Knowledge (Alchemy) >= 6",' +
      '"skills.Survival >= 6"',
  'Holy/Unholy Warrior':
    'Type=Professional ' +
    'Require=' +
      '"features.Arcane Background (Miracles)",' +
      '"spirit >= 8",' +
      '"skills.Faith >= 6"',
  'Iron Guild Mercenary':
    'Type=Professional ' +
    'Require=' +
      '"strength >= 8",' +
      '"spirit >= 6",' +
      '"skills.Fighting >= 6"',
  'Knight Hrafn':
    'Type=Professional ' +
    'Require=' +
      '"smarts >= 6",' +
      '"spirit >= 6",' +
      '"skills.Knowledge (Battle) >= 8",' +
      'features.Command,' +
      '"leadershipEdgeCount >= 2"',
  'Lorekeeper':
    'Type=Professional ' +
    'Require=' +
      '"smarts >= 8",' +
      '"skills.Investigation >= 6",' +
      '"features.Illiterate == 0"',
  'Reliquary (Arcanologist)':
    'Type=Professional ' +
    'Require=' +
      '"smarts >= 8",' +
      '"skills.Knowledge (Arcana) >= 8",' +
      // Updated from skills.Notice by RE II
      '"skills.Investigation >= 6"',
  'Reliquary (Reliqus)':
    'Type=Professional ' +
    'Require=' +
      '"agility >= 8",' +
      '"skills.Lockpicking >= 6",' +
      '"skills.Notice >= 6"',
  'Roadwarden':
    'Type=Professional ' +
    'Require=' +
      '"vigor >= 6",' +
      '"skills.Fighting >= 8",' +
      '"skills.Riding >= 6",' +
      '"skills.Survival >= 6",' +
      '"skills.Tracking >= 6"',
  'Sister Of Mercy':
    'Type=Professional ' +
    'Require=' +
      '"skills.Healing >= 8",' +
      '"gender == \'Female\'",' +
      '"hindrances.Pacifist || hindrances.Pacifist+"',
  'Wood Warden':
    'Type=Professional ' +
    'Require=' +
      '"skills.Shooting >= 8",' +
      '"features.Arcane Background (Druidism) || features.Woodsman"',
  // Social
  'Master Storyteller':
    'Type=Background ' +
    'Require=' +
      '"advances >= 4",' +
      '"smarts >= 8",' +
      '"skills.Knowledge (Folklore) >= 8",' +
      '"skills.Persuasion >= 8"',
  'Legendary Storyteller':
    'Type=Background Require="advances >= 12","features.Master Storyteller"',

  // Rassilon Expansion I
  // Background
  'Ancestral Guardian':
    'Type=Background ' +
    'Require="spirit >= 8"',
  'Giant Blood':
    'Type=Background ' +
    'Require="strength >= 8","vigor >= 6","race =~ \'Human\'"',
  'Large Family':'Type=Background',
  'Powerful Family':'Type=Background',
  'World-Wise':'Type=Background Require="smarts >= 8"',
  // Combat
  'Fast And Silent':'Type=Combat Require="agility >= 8","skills.Stealth >= 8"',
  'One Step One Kill':'Type=Combat Require="advances >= 8","agility >= 8"',
  'Retributive Strike':
    'Type=Combat ' +
    'Require="advances >= 8","agility >= 8","skills.Fighting >= 8"',
  'Vengeful Strike':
    'Type=Combat Require="advances >= 12","features.Retributive Strike"',
  'Salmon Leap':
    'Type=Combat Require="advances >= 4","agility >= 8","strength >= 8"',
  'Spear Catch':
    'Type=Combat Require="advances >= 8","agility >= 8","skills.Throwing >= 6"',
  'Spear Twist':
    'Type=Combat Require="advances >= 4","agility >= 8","skills.Throwing >= 8"',
  'Steady Feet':
    'Type=Combat ' +
    'Require=' +
      '"advances >= 12",' +
      '"agility >= 8",' +
      '"strength >= 8",' +
      '"features.Giant Killer"',
  // Leadership
  'Born In Battle':
    'Type=Leadership ' +
    'Require=' +
      '"advances >= 4",' +
      '"smarts >= 8",' +
      '"skills.Knowledge (Battle) >= 8",' +
      '"features.Command"',
  // Power
  'Enhanced Maintenance':
    'Type=Power ' +
    'Require="advances >= 8","spirit >= 8","vigor >= 8","arcaneSkill >= 8"',
  'Instinctive Dispel':
    'Type=Power ' +
    'Require=' +
      '"advances >= 8",' +
      '"arcaneSkill >= 8",' +
      '"skills.Knowledge (Arcana) >= 10",' +
      'powers.Dispel',
  'Spell Finesse (Altered Range)':
    'Type=Power ' +
    'Require=powerCount,"arcaneSkill >= 8","skills.Knowledge (Arcana) >= 8"',
  // Professional
  'Arcane Hand':
    'Type=Professional ' +
    'Require=' +
      '"skills.Healing >= 6",' +
      '"skills.Knowledge (Arcana) >= 6",' +
      '"skills.Notice >= 6"',
  'Dungeon Crawler':
    'Type=Professional ' +
    'Require=' +
      '"agility >= 8",' +
      '"skills.Climbing >= 6",' +
      '"skills.Stealth >= 6",' +
      '"skills.Survival >= 6"',
  'Huscarl Of Hammerhand':
    'Type=Professional ' +
    'Require=' +
      '"race == \'Frost Dwarf\'",' +
      '"strength >= 8",' +
      '"spirit >= 6",' +
      '"vigor >= 6",' +
      '"skills.Fighting >= 6",' +
      '"skills.Throwing >= 8",' +
      '"features.Vow"',
  'Elite Huscarl Of Hammerhand':
    'Type=Professional ' +
    'Require=' +
      '"advances >= 12",' +
      '"skills.Throwing >= 10",' +
      '"features.Huscarl Of Hammerhand"',
  'One Of Thirteen':
    'Type=Professional ' +
    'Require=' +
      '"agility >= 6",' +
      '"smarts >= 6",' +
      '"skills.Fighting >= 8",' +
      '"combatEdgeCount >= 2"',
  'Ranger':'Type=Professional Require="advances >= 4","features.Woodsman"',
  'Siege Engineer':
    'Type=Professional ' +
    'Require=' +
      '"advances >= 4",' +
      '"smarts >= 8",' +
      '"skills.Knowledge (Siege Artillery) >= 8"',
  'Watcher Of The Black Gate':
    'Type=Professional ' +
    'Require=' +
      '"spirit >= 8",' +
      '"vigor >= 6",' +
      '"skills.Fighting >= 8"',
  // Social
  'Sanctuary':'Type=Social',

  // Rassilon Expansion II
  // Background
  'Arcane Background (Finnar Wind Priest)':
    'Type=Background Require="race == \'Finnar Human\'"',
  'Arcane Background (Glamour)':'Type=Background Require="race =~ \'Elf\'"',
  'Arcane Background (Solar Magic)':'Type=Background',
  'Gravetouched':'Type=Background Require="spirit >= 8","vigor >= 6"',
  'Merman Blood':'Type=Background',
  // Combat
  'Armor Piercing Shot':
    'Type=Combat ' +
    'Require="agility >= 8","skills.Shooting >= 8","race =~ \'Elf\'"',
  'Charge':
    'Type=Combat Require="advances >= 4","vigor >= 8","skills.Fighting >= 8"',
  'Fast Mount':'Type=Combat Require="agility >= 8","skills.Riding >= 6"',
  'Fighting Withdrawal':
    'Type=Combat Require="advances >= 8","agility >= 8","skills.Fighting >= 8"',
  'Lurker':'Type=Combat Require="agility >= 8","skills.Stealth >= 6"',
  'Mounted Combatant':'Type=Combat Require="skills.Riding >= 8"',
  'Pathfinder':
    'Type=Combat ' +
    'Require=' +
      '"agility >= 6",' +
      '"smarts >= 6",' +
      '"skills.Notice >= 6",' +
      '"skills.Survival >= 6"',
  'Quick Reactions':'Type=Combat Require="agility >= 6 || smarts >= 6"',
  'Running Throw':
    'Type=Combat Require="agility >= 6","strength >= 8","skills.Throwing >= 8"',
  'Steal Away':'Type=Combat Require="agility >= 8","skills.Stealth >= 6"',
  // Leadership
  'Drop!':
    'Type=Leadership ' +
    'Require="advances >= 4","skills.Notice >= 6",features.Command',
  'Forced March':
    'Type=Leadership ' +
    'Require="advances >= 4","agility >= 6","vigor >= 6",features.Command',
  'Help Me!':'Type=Leadership Require="advances >= 4",features.Command',
  'Take Aim':
    'Type=Leadership Require="advances >= 8","spirit >= 8",features.Command',
  // Power
  'Delay Spell':
    'Type=Power ' +
    'Require=' +
      '"advances >= 8",' +
      'powerCount,' +
      '"arcaneSkill >= 8",' +
      '"skills.Knowledge (Arcana) >= 8"',
  'Potent Magic':
    'Type=Power ' +
    'Require=' +
      '"advances >= 8",' +
      'powerCount,' +
      '"arcaneSkill >= 8",' +
      '"skills.Knowledge (Arcana) >= 8"',
  'Reflect Spell':
    'Type=Power ' +
    'Require=' +
      '"advances >= 4",' +
      '"spirit >= 8",' +
      'powerCount,' +
      '"arcaneSkill >= 8",' +
      '"skills.Knowledge (Arcana) >= 8",' +
      'powers.Dispel',
  'Righteous Miracles':
    'Type=Power ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"deity =~ \'Sigel|The Norns\'",' +
      '"skills.Faith >= 8",' +
      '"features.Watcher Of The Black Gate"',
  // Professional
  'Bastion Of Strength':
    'Type=Professional ' +
    'Require=' +
      '"spirit >= 10",' +
      '"features.Censure Demons",' +
      '"features.Watcher Of The Black Gate"',
  'Bodyguard':
    'Type=Professional ' +
    'Require=' +
      '"advances >= 12",' +
      '"agility >= 8",' +
      'features.Shieldwall,' +
      '"skills.Notice >= 8"',
  'Brothers-In-Arms':
    'Type=Professional ' +
    'Require=' +
      '"advances >= 4",' +
      '"skills.Fighting >= 8",' +
      '"features.Iron Guild Mercenary"',
  'Censure Demons':
    'Type=Professional ' +
    'Require=' +
      '"advances >= 8",' +
      '"strength >= 6",' +
      '"vigor >= 8",' +
      '"features.Watcher Of The Black Gate"',
  'Deathdealer':
    'Type=Professional ' +
    'Require=' +
      'features.Gravetouched,' +
      '"skills.Fighting >= 6",' +
      '"deity == \'Scaetha\'"',
  'Doomsman':
    'Type=Professional Require="smarts >= 8","skills.Knowledge (Law) >= 8"',
  'Double The Load':'Type=Professional Require=features.Bludgeoner',
  'Improved Double The Load':
     'Type=Professional Require="advances >= 12","features.Double The Load"',
  'Dragon Guard':
    'Type=Professional Require="spirit >= 8","skills.Fighting >= 8"',
  'Veteran Dragon Guard':
    'Type=Professional Require="advances >= 8","features.Dragon Guard"',
  'Hellfrost Hardened':
    'Type=Professional Require="advances >= 8","features.Hearth Knight"',
  'Hellfrost Hardy':
    'Type=Professional ' +
    'Require="advances >= 8","features.Hellfrost Hardened","vigor >= 10"',
  'Horse Lord':
    'Type=Professional Require="advances >= 8","features.Hrosmark Huscarl"',
  'Hrosmark Huscarl':
    'Type=Professional ' +
    'Require=' +
      '"race == \'Saxa Human\'",' +
      '"agility >= 8",' +
      '"skills.Fighting >= 8",' +
      '"skills.Riding >= 6",' +
      '"skills.Shooting >= 8"',
  'Master Bludgeoner':
    'Type=Professional Require="advances >= 8",features.Bludgeoner',
  'Master Mariner':
    'Type=Professional ' +
    'Require=' +
      '"advances >= 8",' +
      '"smarts >= 8",' +
      '"skills.Boating >= 8",' +
      '"skills.Knowledge (The Seas) >= 8"',
  'Not Just A Sling':
    'Type=Professional Require="advances >= 4",features.Bludgeoner',
  'Protect The Cargo':
    'Type=Professional Require="advances >= 8","features.Iron Guild Mercenary"',
  'Sea Legs':'Type=Professional Require="agility >= 8"',
  'Share Spell':
    'Type=Professional ' +
    'Require=' +
      '"advances >= 8",' +
      '"features.Arcane Hand",' +
      '"skills.Knowledge (Arcana) >= 8"',
  'Sister Superior':
    'Type=Professional Require="advances >= 4","features.Sister Of Mercy"',
  'Speed Rider':
    'Type=Professional Require="advances >= 4","features.Hrosmark Huscarl"',

};
Hellfrost.EDGES = Object.assign({}, SWD.EDGES, Hellfrost.EDGES_ADDED);
delete Hellfrost.EDGES.Ace;
delete Hellfrost.EDGES.Gadgeteer;
delete Hellfrost.EDGES['Arcane Background (Magic)'];
delete Hellfrost.EDGES['Arcane Background (Super Powers)'];
delete Hellfrost.EDGES['Arcane Background (Weird Science)'];
delete Hellfrost.EDGES['Double Tap'];
delete Hellfrost.EDGES['Improved Rapid Fire'];
delete Hellfrost.EDGES['Rapid Fire'];
delete Hellfrost.EDGES['Rock And Roll'];
delete Hellfrost.EDGES['Two-Gun Kid'];
// Power Points, Rapid Recharge, Wizard, and Soul Drain allowed
Hellfrost.FEATURES_ADDED = {

  // Edges
  'A Few Good Men':
    'Section=combat Note="Adds one token to army in mass battles"',
  'Alchemy':'Section=arcana Note="May create arcane devices for known spells"',
  'Ancestral Guardian':
    'Section=arcana ' +
    'Note="May spend a Benny to cast <i>Aim</i>, <i>Boost Trait</i>, <i>Deflection</i>, <i>Environmental Protection</i>, <i>Farsight</i>, or <i>Warrior\'s Gift</i> on self"',
  'Arcane Background (Druidism)':
    'Section=arcana,skill ' +
    'Note=' +
      '"3 Powers/10 Power Points",' +
      '"+1 Druidism in natural environments, -1 in urban environments"',
  'Arcane Background (Elementalism)':
    'Section=arcana Note="3 Powers/10 Power Points"',
  'Arcane Background (Finnar Wind Priest)':
    'Section=arcana Note="3 Powers/10 Power Points"',
  'Arcane Background (Glamour)':
    'Section=arcana Note="3 Powers/10 Power Points"',
  'Arcane Background (Heahwisardry)':
    'Section=arcana,skill ' +
    'Note=' +
      '"3 Powers/10 Power Points",' +
      '"-2 arcane skill, +1 per extra round taken (+%{smarts//2} max)"',
  'Arcane Background (Hrimwisardry)':
    'Section=arcana,combat,skill ' +
    'Note=' +
      '"2 Powers/10 Power Points",' +
      '"-4 damage from cold, +4 from heat",' +
      '"-2 Charisma (civilized races)/Hrimwisardry is affected by temperature"',
  'Arcane Background (Rune Magic)':
    'Section=arcana Note="0 Powers/10 Power Points"',
  'Arcane Background (Solar Magic)':
    'Section=arcana Note="3 Powers/10 Power Points"',
  'Arcane Background (Soul Binding)':
    'Section=arcana Note="3 Powers/10 Power Points"',
  'Arcane Background (Song Magic)':
    'Section=arcana,skill ' +
    'Note=' +
      '"3 Powers/10 Power Points",' +
      '"+1 Common Knowledge/+1 Charisma/+1 Knowledge (Folklore)/+1 Knowledge (History)/+1 Knowledge (Riddles)"',
  'Arcane Hand':
    'Section=combat Note="May interrupt foe spellcasting (+2 if on Hold)"',
  'Armor Piercing Shot':'Section=combat Note="+2 AP with bows"',
  'Augment Staff (Aura)':
    'Section=skill Note="Staff gives +2 Intimidation or +2 Persuasion"',
  'Augment Staff (Damage)':
    'Section=combat ' +
    'Note="Staff inflicts d%{strength}%{strengthModifier>0?\'+\'+strengthModifier:strengthModifier<0?strengthModifier:\'\'}+d%{$\'features.Augment Staff (Damage)\'*2+4} damage w/AP %{$\'features.Augment Staff (Damage)\'}"',
  'Augment Staff (Deflect)':
    'Section=combat ' +
    'Note="Foes suffer -%{$\'features.Augment Staff (Deflect)\'} ranged attacks"',
  'Augment Staff (Spell Store)':
    'Section=arcana ' +
    'Note="Staff can store %{$\'features.Augment Staff (Spell Store)\'} known spell that may be cast at +2"',
  'Bastion Of Strength':
    'Section=combat ' +
    'Note="Adjacent allies share Censure Demons and Watcher Of The Black Gate features and Spirit resistance vs. demon fear and Intimidation"',
  'Bladedancer':
    'Section=combat ' +
    'Note="May make a -2 attack on every creature adjacent to running path"',
  'Blood And Guts':
    'Section=combat ' +
    'Note="Suffers half normal negative difference between tokens when attacking in a mass battle"',
  'Bludgeoner':'Section=combat,combat,skill ' +
    'Note=' +
      '"+%V sling range",' +
      '"Sling inflicts d%{strength}%{strengthModifier>0?\'+\'+strengthModifier:strengthModifier<0?strengthModifier:\'\'}+d6 damage at short range",' +
      '"+1 Charisma (engros)"',
  'Bodyguard':'Section=combat Note="May share Parry with adjacent ally"',
  'Born In Battle':
    'Section=skill,skill ' +
    'Note=' +
      '"+2 Knowledge (Battle)",' +
      '"+2 Common Knowledge (military)"',
  'Brothers-In-Arms':
    'Section=combat ' +
    'Note="Suffers -1 damage per each Iron Guildsman w/in 6\\" (-4 max)"',
  'Censure Demons':
    'Section=combat ' +
    'Note="Has Champion and Holy Warrior features vs. demons"',
  'Charge':'Section=combat Note="May make a free melee attack after a run"',
  'Courageous':
    'Section=attribute Note="+2 vs. fear and -2 on fear table rolls"',
  'Combine Spells':'Section=arcana Note="May cast two spells simultaneously"',
  'Concentration':
    'Section=arcana ' +
    'Note="+%{arcanaNotes.improvedConcentration?4:2} to resist spell disruption"',
  'Coordinated Firepower':
    'Section=combat ' +
    'Note="R%{commandRange}\\" Simultaneous ranged attacks by commanded at a single target gain +2 attack per person"',
  'Cry Havoc!':
    'Section=combat ' +
    'Note="May charge during Battle roll 1/mass battle; success removes extra foe token"',
  'Death Before Dishonor':
    'Section=attribute Note="+2 Spirit (mass battle morale)"',
  'Deathdealer':
    'Section=combat ' +
    'Note="May make a free attack on adjacent undead after slaying undead 1/rd"',
  'Delay Spell':'Section=arcana Note="May postpone spell effect 1 - 6 rd"',
  'Disciple Of Dargar':
    'Section=combat ' +
    'Note="Incapacitating a foe w/a single blow inflicts Shaken on adjacent foes (Spirit neg)"',
  'Disciple Of Eira':
    'Section=skill,skill ' +
    'Note=' +
      '"+2 Healing",' +
      '"5 companions gain +2 natural Healing"',
  'Disciple Of Eostre Animalmother':
    'Section=feature ' +
    'Note="Has Beast Master feature with a Wild Card companion animal"',
  'Disciple Of Eostre Plantmother':
    'Section=combat,feature,skill ' +
    'Note=' +
      '"Moves normally through vegetated difficult terrain",' +
      '"May use Champion and Holy Warrior edges with plant creatures",' +
      '"+1 Faith (vegetated areas)"',
  'Disciple Of Ertha':
    'Section=combat,skill ' +
    'Note=' +
      '"+1 Toughness",' +
      '"+2 Survival (underground)"',
  'Disciple Of Freo':
    'Section=combat Note="Treats all terrain as normal ground"',
  'Disciple Of Hela':
    'Section=arcana,skill ' +
    'Note=' +
      '"Dbl Raise on <i>Zombie</i> creates permanent undead",' +
      '"+1 Faith (graveyards)"',
  'Disciple Of Hoenir':
    'Section=skill,skill ' +
    'Note=' +
      '"+1 Common Knowledge/+1 all Knowledge",' +
      '"May attempt untrained Knowledge rolls"',
  'Disciple Of Hothar':'Section=attribute Note="+2 vs. mind effects"',
  'Disciple Of Kenaz':
    'Section=attribute,combat ' +
    'Note=' +
      '"+2 Vigor (resist heat)",' +
      '"+4 Armor vs. heat damage/May magically heat a metal weapon for +2 damage vs. cold resistant and +4 vs. cold immune"',
  'Disciple Of Maera':
    'Section=arcana ' +
    'Note="May cast any off-list spell at -2/+2 casting on <i>Dispel</i>"',
  'Disciple Of Nauthiz':
    'Section=skill ' +
    'Note="May reroll 1s on Gambling, Stealth, and Lockpicking; suffers fatigue for 1 dy if reroll is 1"',
  'Disciple Of Neorthe':
    'Section=feature ' +
    'Note="May survive on half water and survives drowning for %{vigor} rd"',
  'Disciple Of Niht':
    'Section=feature ' +
    'Note="No penalty in dim and dark illumination, -2 in pitch dark"',
  'Disciple Of The Norns':
    'Section=arcana Note="May spend a Benny for an augury"',
  'Disciple Of Rigr':
    'Section=feature ' +
    'Note="Needs only 3 hrs sleep, suffers half penalty for missed sleep, and counts as an active guard when asleep"',
  'Disciple Of Scaetha':
    'Section=arcana,combat ' +
    'Note=' +
      '"+1 casting vs. undead",' +
      '"+2 damage vs. undead"',
  'Disciple Of Sigel':
    'Section=combat,feature,skill ' +
    'Note=' +
      '"+2 vs. invisible foes",' +
      '"Suffers half normal illumination penalty vs. heat-producing foes",' +
      '"+2 Notice (detect hidden objects and creatures)"',
  'Disciple Of The Unknowable One':
    'Section=combat,skill,skill ' +
    'Note=' +
      '"+1 on Tricks/+1 vs. Tricks",' +
      '"+1 Taunt",' +
      '"+1 vs. Taunt"',
  'Disciple Of Thrym':
    'Section=arcana Note="Casts more effectively in cold environments"',
  'Disciple Of Thunor':
    'Section=attribute ' +
    'Note="+1 Vigor (resist hot and cold)/Suffers half normal falling damage"',
  'Disciple Of Tiw':
    'Section=arcana,feature ' +
    'Note=' +
      '"May cast and attack as a single action",' +
      '"+1 Rank for acquiring combat edges"',
  'Disciple Of Ullr':
    'Section=combat,skill ' +
    'Note=' +
      '"May move half Pace before using Marksman with a bow",' +
      '"+2 Stealth (wilderness)/+2 Tracking (wilderness)"',
  'Disciple Of Vali':'Section=feature Note="Immune to disease and poison"',
  'Disciple Of Var':
    'Section=feature Note="May sell goods at 50% cost (Raise 75%)"',
  'Doomsman':
    'Section=skill ' +
    'Note="+2 Charisma (community)/+2 Knowledge (Law) (evidence)/+2 Smarts (evidence)"',
  'Double Shot':'Section=combat Note="May fire two arrows at one target%{combatNotes.improvedDoubleShot?\'\':\' at -2 attack\'}"',
  'Double The Load':
    'Section=combat Note="May sling two stones simultaneously%{combatNotes.improvedDoubleTheLoad?\'\':\' at -2 attack\'}"',
  'Dragon Guard':
    'Section=feature ' +
    'Note="Has Arcane Resistance, Favored Foe, and Giant Killer features with marsh dragons and marsh orms"',
  'Drop!':
    'Section=combat Note="May give one commanded medium ranged cover 1/rd"',
  'Dungeon Crawler':
    'Section=skill ' +
    'Note="+1 Climbing (underground)/+1 Stealthy (underground)/+1 Survival (underground)/-1 Size for squeezing into tight spaces"',
  'Elemental Mastery':
    'Section=arcana ' +
    'Note="Knows spells from %V Elementalism disciplines, casts at -%{$\'edges.Elemental Mastery\'!=3?$\'edges.Elemental Mastery\':0}"',
  'Elite Huscarl Of Hammerhand':
    'Section=combat Note="May throw a warhammer to strike all in a 1\\" line"',
  'Enhanced Maintenance':
    'Section=arcana Note="May maintain a spell while asleep"',
  'Fanaticism':
    'Section=combat ' +
    'Note="R%{commandRange}\\" Commanded gain +2 vs. fear and -2 on fear table rolls"',
  'Fast And Silent':
    'Section=skill Note="Suffers no penalty for running Stealth"',
  'Fast Mount':
    'Section=combat Note="May mount and dismount as free actions 1/rd"',
  'Favored Foe':
    'Section=combat ' +
    'Note="Attack Raise against chosen creature type gives +1 Parry and d8 extra damage"',
  'Fighting Withdrawal':
    'Section=combat ' +
    'Note="May run during Defend and move full Pace during Full Defense"',
  'Focus':
    'Section=arcana ' +
    'Note="May attempt an immediate Spirit%{arcanaNotes.improvedFocus?\'\':-2} roll to recover from Shaken due to spell failure or siphoning"',
  'Forced March':'Section=combat Note="May share running die w/commanded"',
  'Giant Blood':
    'Section=attribute,combat,description,feature ' +
    'Note=' +
      '"May spend a Benny to gain +2 Strength step for %{vigor//2} rd",' +
      '"+1 Toughness",' +
      '"+1 Size",' +
      '"Has Mean feature"',
  'Gravetouched':
    'Section=combat ' +
    'Note="+2 resistance vs. undead abilities and necromantic spells"',
  'Gray Legionary':
    'Section=combat,feature ' +
    'Note=' +
      '"Member of the Gray Legionary mercenary company",' +
      '"Immune to Intimidation and fear"',
  'Guild Thief':
    'Section=skill ' +
    'Note="+2 Streetwise (home country)/Uses d8 Wild Die on choice of Climbing, Stealth (urban), or Lockpicking"',
  'Hearth Knight':
    'Section=combat,skill ' +
    'Note=' +
      '"+2 Survival (freezing environments)",' +
      '"+1 Parry and +2 called shots vs. cold-resistant and -immune creatures"',
  'Hedge Magic':'Section=skill Note="May identify plants for herbal remedies"',
  'Hellfreeze':
    'Section=arcana ' +
    'Note="Cold spells do normal damage to resistant, half to immune, dbl to vulnerable, and dbl+4 to targets with weakness"',
  'Hellfrost Hardened':
    'Section=combat Note="+2 Armor and Trait rolls vs. cold damage and powers"',
  'Hellfrost Hardy':
    'Section=combat ' +
    'Note="Does not suffer a Wound from a second cold Shaken result"',
  'Help Me!':'Section=combat Note="Commanded may suffer attack on self 1/rd"',
  'Holy/Unholy Warrior':
    'Section=arcana ' +
    'Note="R%{spirit}\\" Evil/good target Shaken (Spirit vs. Faith neg (multiple targets Faith -2); critical failure destroys or wounds)"',
  'Horse Lord':
    'Section=skill ' +
    'Note="Uses d8 Wild Die with Riding/Mount shares Parry and resistance"',
  'Hrosmark Huscarl':
    'Section=combat Note="Gains Steady Hands feature and may Aim when mounted"',
  'Huscarl Of Hammerhand':
    'Section=combat ' +
    'Note="Warhammer has range 2/Thrown axes and hammers may strike multiple targets"',
  'Improved Concentration':
    'Section=arcana Note="Increased Concentration effects"',
  'Improved Double Shot':'Section=combat Note="Increased Double Shot effects"',
  'Improved Double The Load':
    'Section=combat Note="Increased Double The Load effects"',
  'Improved Focus':'Section=arcana Note="Increased Focus effects"',
  'Improved Giant Killer':
    'Section=combat ' +
    'Note="May ignore Armor or Size benefits of creatures of Size %{size+3} or greater"',
  'Improved Snow Walker':'Section=combat Note="Increased Snow Walker effects"',
  'Improved Sunder':'Section=combat Note="Increased Sunder effects"',
  'Instinctive Dispel':
    'Section=arcana ' +
    'Note="May attempt a free <i>Dispel</i> of a spell that effects self 1/rd"',
  'Iron Guild Mercenary':
    'Section=combat,feature ' +
    'Note="Member of the Iron Guild mercenary company","+1 using Gang Up"',
  'Knight Hrafn':
    'Section=combat,feature,skill ' +
    'Note=' +
      '"+%V Command range",' +
      '"Ignores rank requirement for leadership edges",' +
      '"+1 Knowledge (Battle)"',
  'Large Family':'Section=feature Note="+2 Kinship results"',
  'Legendary Storyteller':
    'Section=feature Note="Increased Master Storyteller effects"',
  'Library':'Section=skill Note="+%V Skill Points (choice of Knowledge)"',
  'Linguist':'Section=skill Note="Knows %{smarts} languages"',
  'Lorekeeper':
    'Section=skill ' +
    'Note="May attempt untrained Knowledge skills at d4-2 and other untrained Smarts skills at d4"',
  'Lurker':
    'Section=combat ' +
    'Note="%V Parry (uses Stealth instead of Fighting) during Full Defense"',
  'Master Bludgeoner':
    'Section=combat ' +
    'Note="Sling inflicts Str+d8 (short range) or Str+d6 (medium range)"',
  'Master Mariner':
    'Section=combat,skill ' +
    'Note=' +
      '"May spend a Benny to Soak boat damage/+1 boat maximum speed",' +
      '"Ignores 2 penalty points on Boating"',
  'Master Storyteller':
    'Section=feature ' +
    'Note="Story subjects use d8%{featureNotes.legendaryStoryteller?\' (Raise +1d8 each)\':\'\'} for glory rewards and suffer no penalty for critical failure"',
  'Merman Blood':
    'Section=combat,skill ' +
    'Note=' +
      '"Swim Pace %{pace}\\"",' +
      '"+2 Swimming"',
  'Mighty Shot':'Section=combat Note="Bow inflicts %V%1+d6 damage"',
  'Mighty Throw':
    'Section=combat ' +
    'Note="+1 thrown weapon range/+1 Strength step for short throws"',
  'Mounted Combatant':
    'Section=combat,skill ' +
    'Note=' +
      '"May spend a Benny to Soak mount damage",' +
      '"Ignores 2 penalty points on Riding/Successful Ride gives mount +2 Pace"',
  'Necromantic Severing':
    'Section=combat Note="May attempt called shots vs. undead"',
  'New Rune':'Section=arcana Note="Knows spells from %V runes"',
  'Noble':
    'Section=feature,skill ' +
    'Note=' +
      '"Has Rich feature",' +
      '"+2 Charisma"',
  'Not Just A Sling':
    'Section=combat Note="Never unarmed with a sling/+2 Disarm and Grapple"',
  'Old Family':'Section=skill Note="+2 Knowledge (Arcana)"',
  'One Of Thirteen':
    'Section=combat Note="May use an adjacent ally\'s combat edge 1/rd"',
  'One Step One Kill':
    'Section=combat ' +
    'Note="May move 1\\" w/out triggering First Strike/May spend a Benny to gain The Drop"',
  'Oversized Weapon Master':
    'Section=combat Note="May use two-handed weapons with one hand"',
  'Pathfinder':
    'Section=skill ' +
    'Note="Allies may move through scouted difficult terrain at 2/3 Pace"',
  'Potent Magic':
    'Section=arcana ' +
    'Note="Targets suffer -1 arcane resistance/Foe <i>Dispel</i> attempts suffer -2"',
  'Power Surge':'Section=combat Note="Arcane skill attack inflicts dbl damage"',
  'Powerful Family':'Section=feature Note="+2 Kinship results"',
  'Protect The Cargo':
    'Section=combat ' +
    'Note="+1 Fighting and Toughness when protecting adjacent cargo"',
  'Quick Reactions':
    'Section=combat Note="May take limited actions when surprised"',
  'Ranger':
    'Section=skill ' +
    'Note="Trackers suffer -2 Tracking/Uses d8 Wild Die with choice of Stealth, Survival, or Tracking"',
  'Reflect Spell':
    'Section=arcana ' +
    'Note="Raise on <i>Dispel</i> allows turning a spell back on the caster"',
  'Reliquary (Arcanologist)':
    'Section=skill ' +
    'Note="+2 Common Knowledge (relics)/+2 Knowledge (relics)/May use Knowledge (Arcana) to learn unattuned relic powers"',
  'Reliquary (Reliqus)':
    'Section=attribute,skill ' +
    'Note=' +
      '"Successful Agility-2 avoids trap effects",' +
      '"+2 Notice (traps)/+2 to disarm traps"',
  'Retributive Strike':
    'Section=combat Note="May make a free melee attack upon incapacitation"',
  'Righteous Miracles':
    'Section=arcana ' +
    'Note="Demon targets suffer +2 power damage and -2 Trait rolls"',
  'Roadwarden':
    'Section=skill,skill ' +
    'Note=' +
      '"+2 Survival/+2 Tracking",' +
      '"+2 Notice (wilderness ambushes, traps, and concealed weapons)"',
  'Runic Insight':
    'Section=arcana ' +
    'Note="+1 casting on spells of %{$\'features.Runic Insight\'} chosen runes"',
  'Running Throw':
    'Section=combat Note="+2 thrown weapon range after moving half Pace"',
  'Salmon Leap':
    'Section=combat,skill ' +
    'Note=' +
      '"Ignores 1 point of shield Parry",' +
      '"+1\\" jump"',
  'Sanctuary':
    'Section=feature ' +
    'Note="Prepared location grants +2 Will, +2 vs. Fear, and +1 Healing after four days"',
  'Scamper':'Section=combat Note="Larger foes suffer -1 attack"',
  'Sea Legs':
    'Section=combat ' +
    'Note="While aboard a ship, suffers no penalty on shots, reduces running shot penalty by 1, and gains +1 Parry"',
  'Share Spell':
    'Section=arcana Note="Gains benefits of adjacent master\'s spells"',
  'Shieldwall':'Section=combat Note="Shield benefit applies to adjacent ally"',
  'Siege Breaker':
    'Section=combat ' +
    'Note="-1 fortification siege bonus during a mass battle; may attempt Knowledge (Battle) for -2 (Raise -3)"',
  'Siege Engineer':
    'Section=combat Note="Siege weapons gain +50% range and +2 AP"',
  'Siege Mentality':
    'Section=combat ' +
    'Note="+1 fortification siege bonus during a mass battle; may attempt Knowledge (Battle) for +2 (Raise +3)"',
  'Sister Of Mercy':'Section=skill Note="+2 Healing/+1 Charisma"',
  'Sister Superior':
    'Section=skill ' +
    'Note="Successful Healing-2 immediately after an allied Extra takes a Wound reduces it to Shaken"',
  'Snow Walker':
    'Section=combat ' +
    'Note="May move %{combatNotes.improvedSnowWalker?\'full\':\'2/3\'} Pace over snow and ice"',
  'Spear Catch':
    'Section=combat ' +
    'Note="Successful Agility catches thrown spear (Raise allows return throw) 1/rd"',
  'Spear Twist':
    'Section=combat Note="Thrown spear does +1 Strength step damage"',
  'Speed Rider':
    'Section=skill ' +
    'Note="Mount gains +2 Pace/May suffer mount fatigue to gain dbl running dice"',
  'Spell Finesse (Altered Range)':
    'Section=arcana ' +
    'Note="Increases range of chosen touch spell to %{smarts>?spirit}\\" or ranged spell to 12\\""',
  'Spell Finesse (Arcane)':
    'Section=arcana Note="+1 Wild Die step on chosen spell skill"',
  'Spell Finesse (Armor Penetration)':
    'Section=arcana Note="Chosen spell has AP 2"',
  'Spell Finesse (Heavy Weapon)':
    'Section=arcana Note="Chosen spell counts as a heavy weapon"',
  'Spell Finesse (Range)':
    'Section=arcana Note="Chosen spell has an extended range"',
  'Spell Finesse (Selective)':
    'Section=arcana ' +
    'Note="May exclude %{arcaneSkill//2} creatures from effects of chosen area spell"',
  'Steady Feet':'Section=combat Note="+1 Size vs. knockback"',
  'Steal Away':
    'Section=combat Note="Successful Stealth allows withdrawal without attack"',
  'Styrimathr':'Section=feature Note="Owns a Smabyrding"',
  'Sunder':'Section=combat Note="+%{combatNotes.improvedSunder?2:1} AP with any weapon"',
  'Tactician':
    'Section=combat ' +
    'Note="R%{commandRange}\\" Successful Knowledge (Battle) before combat gives 1 Action Card per success and Raise to distribute to commanded extras"',
  'Take Aim':
    'Section=combat ' +
    'Note="Commanded gain +1 shooting and throwing damage (1d6+1 with Coordinated Firepower)"',
  'Vengeful Strike':
    'Section=combat ' +
    'Note="May make a free melee attack when an adjacent ally becomes incapacitated"',
  'Veteran Dragon Guard':
    'Section=feature ' +
    'Note="Has Champion features and +2 vs. paralysis with marsh dragons and marsh orms"',
  'Wall Of Steel':'Section=combat Note="Foes gain no Gang Up bonus"',
  'War Cry':
    'Section=combat Note="May use Intimidation against all in a 3\\" radius"',
  'Warm Blooded':'Section=attribute Note="+2 Vigor (cold weather effects)"',
  'Watcher Of The Black Gate':'Section=combat Note="+2 vs. demon powers"',
  'Wood Warden':
    'Section=arcana ' +
    'Note="Can speak with normal animals/Casts <i>Beast Friend</i> at +2"',
  'World-Wise':
    'Section=skill,skill ' +
    'Note=' +
      '"+5 Skill Points (Knowledge (3+ areas))",' +
      '"May attempt unskilled Knowledge (area) rolls"',

  // Glory Rewards
  'Combat Prowess':'Section=feature Note="+%V Edge Points (combat)"',
  'Favored':'Section=feature Note="+1 Benny each session"',
  'Heroic Aura':'Section=combat Note="+%V Toughness in no armor"',
  'Heroic Status':
    'Section=skill,skill ' +
    'Note=' +
      '"+%V Intimidation/+%V Persuasion/+%V Streetwise",' +
      '"+%V Reaction table"',
  'Immortalized In Song':
    'Section=feature Note="Has dbl normal number of followers"',
  'Leader Of Men':'Section=feature Note="+%V Edge Points (leadership)"',

  // Hindrances
  'Apprentice/Novitiate':
    'Section=skill Note="Maximum starting arcane skill is d6"',
  'Apprentice/Novitiate+':
    'Section=arcana,skill ' +
    'Note="-1 Power Count","Maximum starting arcane skill is d6"',
  'Black Sheep':
    'Section=feature,skill ' +
    'Note=' +
      '"Ostracized by magocratic nobility",' +
      '"-2 Charisma (heahwisards)"',
  'Blood Feud':'Section=skill Note="-2 Charisma (rival family)"',
  'Blood Feud+':'Section=skill Note="-4 Charisma (rival family)"',
  'City Dweller':
    'Section=skill ' +
    'Note="-2 Common Knowledge (country life)/-2 Stealth (wilderness)/-2 Survival (wilderness)"',
  'Cold Blooded':'Section=attribute Note="-2 Vigor (cold weather effects)"',
  'Disowned':'Section=feature Note="Cast out from family"',
  'God Cursed+':
    'Section=feature ' +
    'Note="Beneficial spells from chosen god\'s cleric fail, harmful spells do +2 damage and negate arcane resistance"',
  'Leysingi':'Section=feature Note="Formerly a thrall"',
  'Magic Forbiddance+':
    'Section=feature Note="Cannot use or detect magic items"',
  'Necromantic Weakness':'Section=attribute Note="-2 vs. undead effects"',
  'Necromantic Weakness+':'Section=attribute Note="-4 vs. undead effects"',
  'Orders':'Section=feature Note="Takes orders from an outside power"',
  'Outlaw+':
    'Section=feature,feature ' +
    'Note=' +
      '"-20 Glory",' +
      '"Cannot use Kinship/May be killed legally"',
  'Sea Fear':
    'Section=feature Note="Fears the presence of large bodies of water"',
  'Sea Fear+':
    'Section=feature Note="Fears the presence of large bodies of water"',
  'Short-Lived Magic':
    'Section=arcana ' +
    'Note="Maintained spells end after 1 hr, devices after 30 min"',
  'Short-Lived Magic+':
    'Section=arcana Note="Maintained spells and devices end after 1 min"',
  'Weak Family':'Section=feature Note="-2 Kinship results"',
  'Weak Family+':'Section=feature Note="-4 Kinship results"',

  // Races
  'Diverse':'Section=description Note="+2 Improvement Points (edge or skills)"',
  'Forest-Born':
    'Section=combat Note="Suffers no difficult terrain penalty in forests"',
  'Frigid Form':
    'Section=arcana ' +
    'Note="May cast cold <i>Armor</i>, <i>Environmental Protection</i>, <i>Smite</i>, and <i>Speed</i> on self at will"',
  'Heat Lethargy':
    'Section=feature ' +
    'Note="Suffers -1 Trait rolls at temperatures above 52F"',
  'Insular':'Section=skill Note="-2 Charisma (other races)"',
  'Luck (Engro)':'Section=feature Note="+1 Benny each session"',
  'Mountain-Born':
    'Section=combat ' +
    'Note="Suffers no difficult terrain penalty in hills and mountains"',
  'Natural Realms':'Section=feature Note="Treats elfhomes as wilds"',
  'Small (Engro)':
    'Section=combat,description ' +
    'Note=' +
      '"-1 Toughness",' +
      '"-1 Size"',
  'Sneaky':
    'Section=skill Note="+2 Skill Points (choice of Stealth or Lockpicking)"',
  'Winter Soul':
    'Section=attribute,combat ' +
    'Note=' +
      '"+2 Vigor (resist cold)",' +
      '"+2 Armor vs. cold attacks"'

};
Hellfrost.FEATURES = Object.assign({}, SWD.FEATURES, Hellfrost.FEATURES_ADDED);
Hellfrost.FEATURES['Arcane Background (Miracles)'] =
  Hellfrost.FEATURES['Arcane Background (Miracles)'].
    replace('Section=', 'Section=feature,').
    replace('Note=', 'Note="Has Connections and Orders features",');
Hellfrost.GLORY_REWARDS = {
  'Combat Prowess':'Require="glory >= 40"',
  'Connections':'Require="glory >= 20"',
  'Favored':'Require="glory >= 60"',
  'Followers':'Require="glory >= 40"',
  'Heroic Aura':'Require="glory >= 40"',
  'Heroic Status':'Require="glory >= 20"',
  'Immortalized In Song':'Require="features.Heroic Status >= 4"',
  'Leader Of Men':'Require="glory >= 40"',
  'Sidekick':'Require="glory >= 80"'
};
Hellfrost.GOODIES = Object.assign({}, SWD.GOODIES);
Hellfrost.HINDRANCES_ADDED = {

  // Player's Guide
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
  'Orders':'Severity=Minor',

  // Rassilon Expansion I
  'Blood Feud':'Severity=Minor Require="features.Blood Feud+ == 0"',
  'Blood Feud+':'Severity=Major Require="features.Blood Feud == 0"',
  'City Dweller':'Severity=Minor',
  'Outlaw+':'Severity=Major',
  'Sea Fear':'Severity=Minor Require="features.Sea Fear+ == 0"',
  'Sea Fear+':'Severity=Major Require="features.Sea Fear == 0"',
  'Short-Lived Magic':
    'Severity=Minor Require="features.Short-Lived Magic+ == 0"',
  'Short-Lived Magic+':
    'Severity=Major Require="features.Short-Lived Magic == 0"',
  'Weak Family':'Severity=Minor Require="features.Weak Family+ == 0"',
  'Weak Family+':'Severity=Major Require="features.Weak Family == 0"',

  // Rassilon Expansion II
  'Disowned':'Severity=Minor',
  'Leysingi':'Severity=Minor'

};
Hellfrost.HINDRANCES =
  Object.assign({}, SWD.HINDRANCES, Hellfrost.HINDRANCES_ADDED);
Hellfrost.LANGUAGES = {
  'Anari':'',
  'Arboreal':'',
  'Aspirian':'',
  'Auld Saxa':'',
  'Battletongue':'',
  'Beastspeech':'',
  'Black Tongue':'',
  'Chalcian':'',
  'Classical Anari':'',
  'Draketongue':'',
  'Dwarven':'',
  'Earthtongue':'',
  'Engrosi':'',
  'Fey':'',
  'Fingerspeak':'',
  'Finnari':'',
  'Frosttongue':'',
  'Giant':'',
  'Hearth Elven':'',
  'Orcish':'',
  'Saxa':'',
  'Selari':'',
  'Taiga Elven':'',
  'Tuomi':'',
  'Trader':'',
  'Vendahl':'',
  'Vindari':''
};
Hellfrost.POWERS_ADDED = {
  // Note that "half powers" are included here where some arcana power list
  // includes a restricted version of the spell (e.g. Corporealness and
  // Incorporealness represent restrictions on Corporealness/Incorporealness).
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
      '"Target gains Infravision or Low Light Vision feature (Raise both) while maintained"',
  'Analyze Foe':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Range=sight ' +
    'Description=' +
      '"Self knows the number of edges and highest attack skill of target (Raise names of edges and attack skill dice)"',
  'Animate War Tree':
    'Advances=12 ' +
    'PowerPoints=8 ' +
    'Range=touch ' +
    'Description=' +
      '"Target 30\'-high tree animates (Raise as Wild Card) while maintained"',
  'Arcane Resistance': // ref Arcane Protection
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Modifier=' +
      '"+1 PP/additional target" ' +
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
      '"Creatures in range gain Berserk feature (Spirit neg) while maintained"',
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
      '"Allies in range gain +2 vs. fear (Raise +4) while maintained"',
  'Panic':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Range=spirit ' +
    'Description=' +
      '"Foes in range suffer -2 vs. fear (Raise -4) while maintained"',
  'Bodyguard': // ref Summon Ally
    'Advances=0 ' +
    'PowerPoints=3 ' +
    'Range=smarts ' +
    'Modifier=' +
      '"+1 PP Servant can bite/claw for Str+d6 damage",' +
      '"+2 PP Servant has fly Pace 12",' +
      '"+1 PP Self can use servant\'s senses" ' +
    'Description="Creates an obedient servant until wounded"',
  'Boost Trait':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=smarts ' +
    'Description="Target gains +1 Trait step (Raise +2) for 5 rd"',
  'Bridge': // ref Barrier
    'Advances=4 ' +
    'PowerPoints=1/Section ' +
    'Range=smarts ' +
    'Description=' +
      '"Creates sections of 1\\" horizontal surface while maintained"',
  'Champion Of The Faith':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=self ' +
    'Description=' +
      '"Target gains Champion or Holy Warrior feature while maintained"',
  'Charismatic Aura':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=self ' +
    'Description="Target gains +1 Charisma (Raise +2) while maintained"',
  'Confusion': // ref Confusion
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Range=smarts*2 ' +
    'Modifier=' +
      '"+2/+3 PP 2\\"/3\\" radius" ' +
    'Description=' +
      '"Target suffers -2 Trait rolls (Raise -4) (Smarts neg) while maintained"',
  'Corpse Senses':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=smarts*50 ' +
    'Description="Self may use corpse senses while maintained"',
  'Detect/Conceal': // ref Detect/Conceal Arcana
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=smarts*2 ' +
    'Modifier=' +
      '"+1 PP/additional target",' +
      '"+1/+2 PP 2\\"/3\\" radius",' +
      '"+1 PP <i>Detect</i>-2" ' +
    'Description=' +
      '"Target can detect the presence of supernatural effects or conceals target aura while maintained"',
  'Detect':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=smarts*2 ' +
    'Modifier=' +
      '"+1 PP/additional target" ' +
    'Description=' +
      '"Target can detect the presence of supernatural effects while maintained"',
  'Conceal':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=smarts*2 ' +
    'Modifier=' +
      '"+1 PP/additional target",' +
      '"+1/+2 PP 2\\"/3\\" radius",' +
      '"+1 PP <i>Detect</i>-2" ' +
    'Description=' +
      '"Conceals target aura (<i>Detect</i> neg) while maintained"',
  'Disease':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Range=spirit ' +
    'Description="Target suffers disease and fatigue; may die (Vigor neg)"',
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
      '"Undead targets gain advancement benefit for 1 hr (Raise 6 hr; 2 Raises 1 dy)"',
  'Etherealness/Corporealness': // ref Intangibility
    'Advances=4 ' +
    'PowerPoints=5 ' +
    'Range=smarts ' +
    'Description=' +
      '"Target becomes unaffected by physical world or ethereal creature becomes affected (Spirit neg) while maintained"',
  'Etherealness':
    'Advances=4 ' +
    'PowerPoints=5 ' +
    'Range=smarts ' +
    'Description=' +
      '"Target becomes unaffected by physical world (Spirit neg) while maintained"',
  'Corporealness':
    'Advances=4 ' +
    'PowerPoints=5 ' +
    'Range=smarts ' +
    'Description=' +
      '"Target ethereal creature becomes affected by physical world (Spirit neg) while maintained"',
  'Farsight': // ref Farsight
    'Advances=0 ' +
    'PowerPoints=3 ' +
    'Range=touch ' +
    'Modifier=' +
      '"+1 PP/additional target" ' +
    'Description=' +
      '"Target gains +2 Notice within %{smarts*2}\\" and sees up to 5 miles while maintained"',
  'Fatigue':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Range=12 ' +
    'Description="2\\" radius (Raise 3\\") inflicts fatigue (Vigor neg)"',
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
      '"Target may reroll failed Benny-purchased reroll while maintained"',
  'Gift Of Battle':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=touch ' +
    'Description=' +
      '"Target gains choice of leadership edge (Raise 2 edges) while maintained"',
  'Glyph':
    'Advances=8 ' +
    'PowerPoints=4 ' +
    'Range=touch ' +
    'Description="Glyph stores spell effects until triggered"',
  'Gravespeak':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Range=touch ' +
    'Description="Target may ask a spirit %{spirit} questions"',
  'Greater Zombie': // ref Zombie
    'Advances=12 ' +
    'PowerPoints=4 ' +
    'Range=spirit*2 ' +
    'Description="Target corpse animates and obeys self commands for 1 hr"',
  'Heat Mask':
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description="Target remains invisible to infravision while maintained"',
  'Insight': // ref Object reading
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description=' +
      '"Self sees 1 event that occurred recently to touched object"',
  'Knockdown':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=9 ' +
    'Description=' +
      '"Cone pushes creatures 1d4\\" and knocks prone (Strength neg)"',
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
      '"Target takes the better/worse of two Trait rolls while maintained"',
  'Mend':
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Range=touch ' +
    'Description=' +
      '"Target wooden vehicle recovers 1 Wound (Raise 2) suffered in the past hr"',
  'Mimic':
    'Advances=0 ' +
    'PowerPoints=3 ' +
    'Range=spirit ' +
    'Description="Self can cast spell used by another while maintained"',
  'Mind Reading': // ref Mind Reading
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Range=smarts*2 ' +
    'Description="Self reads target surface thoughts; may probe for deeper thoughts (Spirit neg; Raise learns secrets)"',
  'Mind Rider':
    'Advances=8 ' +
    'PowerPoints=3 ' +
    'Range=smarts ' +
    'Description="Self can use target\'s senses (Spirit neg) while maintained"',
  'Negate Arcana':
    'Advances=8 ' +
    'PowerPoints=5 ' +
    'Range=smarts ' +
    'Description="2\\" radius dispels all magic while maintained"',
  'Nightmare':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Range=self ' +
    'Description=' +
      '"Target w/in %{smarts} miles loses benefits of sleep and becomes frightened (Spirit neg)"',
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
      '"Choice of 1\\" or 2\\" radius inflicts 2d6 damage (Raise 3d6) while maintained"',
  'Quake':
    'Advances=8 ' +
    'PowerPoints=6 ' +
    'Range=smarts*3 ' +
    'Description="3\\" radius inflicts 2d10 damage (Agility neg)"',
  'Refuge':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Range=smarts ' +
    'Description=' +
      '"Creates a 10\'x6\' shelter that gives +2 Vigor vs. cold (Raise +4) for 12 hr"',
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
      '"Gives +1 arcane skill per victim Spirit step while maintained"',
  'Sanctuary':
    'Advances=0 ' +
    'PowerPoints=3 ' +
    'Range=self ' +
    'Description="Teleports to a safe location"',
  'Sentry':
    'Advances=4 ' +
    'PowerPoints=3 ' +
    'Range=smarts*2 ' +
    'Description="Creates an overnight ghostly sentry or object alarm"',
  'Silence': // ref Sound/Silence
    'Advances=4 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Modifier=' +
      '"+1 PP Moves effect %{arcaneSkill}\\"/rd",' +
      '"1 PP/target (Spirit neg)" ' +
    'Description="Mutes 2\\" radius while maintained"',
  'Sluggish Reflexes':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=smarts*2 ' +
    'Description=' +
      '"Target draws 1 fewer Action Card or takes the lower of 2 cards (Spirit neg) while maintained"',
  'Slumber': // ref Slumber
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=smarts*2 ' +
    'Modifier=' +
      '"+2/+3 PP 2\\"/3\\" radius" ' +
    'Description="Target sleeps for 1 hr (Spirit neg)"',
  'Sphere Of Might':
    'Advances=8 ' +
    'PowerPoints=4 ' +
    'Range=smarts ' +
    'Description=' +
      '"1\\" sphere around target inflicts -1 attacks (Raise -2) and attacks as d%{arcaneSkill} in Fighting, inflicting d%{arcaneSkill}+d4 damage (Raise d%{arcaneSkill}+d8) while maintained"',
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
      '"Self mimics undead target\'s Trait or special ability (Raise 2) while maintained"',
  'Succor': // ref Succor
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description="Target recovers from 1 level of fatigue (Raise 2 levels)"',
  'Summon Beast':
    'Advances=8 ' +
    'PowerPoints=2+ ' +
    'Range=spirit*5 ' +
    'Description="Self controls summoned animal\'s actions while maintained"',
  'Summon Demon':
    'Advances=8 ' +
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
  'Viper Weapon':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=smarts*2 ' +
    'Description="Transforms target weapon into a viper while maintained"',
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
    'Modifier=' +
      '"+1 PP/additional target" ' +
    'Description=' +
      '"Target may move at full Pace on vertical and inverted surfaces while maintained"',
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
      '"2\\" radius (Raise 3\\" radius) bars specified creature type while maintained"',
  'Water Walk':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=touch ' +
    'Modifier=' +
      '"+1 PP/additional target" ' +
    'Description=' +
      '"Target may traverse calm water while maintained"',
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
    'Modifier=' +
      '"+1 PP 3\\" radius",' +
      '"+1 PP Strength-2" ' +
    'Description="2\\" radius knocks prone (Strength neg)"',
  'Wilderness Step':
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Description="Target treats all terrain as normal while maintained"',
  'Zephyr':
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=self ' +
    'Description="Creates a moderate wind while maintained"',

  // SWD spells copied to make available w/SWADE
  'Armor': // ref Arcane Protection
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=touch ' +
    'Modifier=' +
      '"+1 PP/additional target" ' +
    'Description="Target gains +2 Armor (Raise +4) while maintained"',
  'Greater Healing':
    'Advances=8 ' +
    'PowerPoints=10 ' +
    'Range=touch ' +
    'Description=' +
      '"Restores 1 Wound (Raise 2 Wounds) w/out a time limit or removes poison, disease, or sickness"',
  'Light': // ref Light/Darkness
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=smarts ' +
    'Modifier=' +
      '"+1 PP Attaches to object or moves effect %{arcaneSkill}\\"/rd" ' +
    'Description="Creates a 3\\" radius of bright light for 30 min"',
  'Obscure': // ref Light/Darkness
    'Advances=0 ' +
    'PowerPoints=2 ' +
    'Range=smarts ' +
    'Modifier=' +
      '"+1 PP Attaches to object or moves effect %{arcaneSkill}\\"/rd" ' +
    'Description="Creates a 3\\" radius of darkness for 3 rd"',
  'Quickness':
    'Advances=4 ' +
    'PowerPoints=4 ' +
    'Range=touch ' +
    'Description=' +
      '"Target gains an additional action (Raise also redraw Action Cards below 8) while maintained"',
  'Slow':
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=smarts*2 ' +
    'Description=' +
      '"Target move counts as an action (Raise also must redraw Action Cards above 10) (Spirit neg) while maintained"',
  'Speed': // ref Sloth/Speed
    'Advances=0 ' +
    'PowerPoints=1 ' +
    'Range=touch ' +
    'Modifier=' +
      '"+1 PP/additional target",' +
      '"+2 PP Reduces target multi-action penalty by 2" ' +
    'Description=' +
      '"Target gains dbl Pace (Raise also Run as a free action) while maintained"',

  // SWADE powers that are split in a Hellfrost spell list
  'Shrink': // ref Growth/Shrink
    'Advances=4 ' +
    'PowerPoints=2 ' +
    'Range=smarts ' +
    'Description=' +
      '"Target loses Toughness and 1 Strength step (Spirit neg) for 5 rd"',

  // Rassilon Expansion II
  'Hamper Movement':
    'Advances=4 ' +
    'PowerPoints=2 ' + // ref Slow
    'Range=smarts ' +
    'Description="3\\" radius becomes difficult terrain"',
  'Summon Spirit':
    'Advances=8 ' +
    'PowerPoints=4 ' + // ref Summon Elemental
    'Range=smarts ' +
    'Description="Summons a spirit to possess target"'

};
Hellfrost.POWERS = Object.assign({}, SWD.POWERS, Hellfrost.POWERS_ADDED);
Hellfrost.RACES = {
  'Engro':
    'Abilities="Luck (Engro)",Outsider,"Small (Engro)",Sneaky,Spirited ' +
    'Languages=Engrosi',
  'Frost Dwarf':
    'Abilities=' +
      '"Heat Lethargy",Insular,"Low Light Vision",Mountain-Born,Slow,' +
      'Tough,"Winter Soul" ' +
    'Languages=Dwarven',
  'Frostborn':
    'Abilities="Frigid Form","Heat Lethargy",Outsider,"Winter Soul"',
  'Hearth Elf':
    'Abilities=' +
      'Agile,"All Thumbs","Forest-Born","Low Light Vision","Natural Realms" ' +
    'Languages="Hearth Elven"',
  'Anari Human':'Abilities=Diverse Languages=Anari',
  'Finnar Human':'Abilities=Diverse Languages=Finnari',
  'Saxa Human':'Abilities=Diverse Languages=Saxa',
  'Tuomi Human':'Abilities=Diverse Languages=Tuomi',
  'Taiga Elf':
    'Abilities=' +
      'Agile,"All Thumbs","Forest-Born","Heat Lethargy",Insular,' +
      '"Low Light Vision","Natural Realms","Winter Soul" ' +
    'Languages="Taiga Elven"'
};
// MinStr values taken from SWADE rules
Hellfrost.SHIELDS = {
  'None':'Parry=0 Cover=0 Weight=0 MinStr=0',
  'Small Shield':'Parry=1 Cover=0 Weight=8 MinStr=4',
  'Medium Shield':'Parry=1 Cover=2 Weight=12 MinStr=6',
  'Large Shield':'Parry=2 Cover=2 Weight=20 MinStr=8'
};
Hellfrost.SKILLS_ADDED = {
  'Druidism':'Attribute=Smarts',
  'Elementalism':'Attribute=Smarts',
  'Glamour':'Attribute=Smarts',
  'Heahwisardry':'Attribute=Smarts',
  'Hrimwisardry':'Attribute=Smarts',
  'Armor-Rune':'Attribute=Smarts',
  'Arrow-Rune':'Attribute=Smarts',
  'Battle-Rune':'Attribute=Smarts',
  'Beast-Rune':'Attribute=Smarts',
  'Blessing-Rune':'Attribute=Smarts',
  'Calming-Rune':'Attribute=Smarts',
  'Change-Rune':'Attribute=Smarts',
  'Charm-Rune':'Attribute=Smarts',
  'Coldfire-Rune':'Attribute=Smarts',
  'Curse-Rune':'Attribute=Smarts',
  'Cut-Rune':'Attribute=Smarts',
  'Dispel-Rune':'Attribute=Smarts',
  'Earth-Rune':'Attribute=Smarts',
  'Elemental-Rune':'Attribute=Smarts',
  'Glow-Rune':'Attribute=Smarts',
  'Healing-Rune':'Attribute=Smarts',
  'Secret-Rune':'Attribute=Smarts',
  'Shield-Rune':'Attribute=Smarts',
  'Tongue-Rune':'Attribute=Smarts',
  'Travel-Rune':'Attribute=Smarts',
  'Weather-Rune':'Attribute=Smarts',
  'Song Magic':'Attribute=Smarts',
  'Solar Magic':'Attribute=Smarts',
  'Soul Binding':'Attribute=Smarts',
  'Knowledge (Alchemy)':'Attribute=Smarts',
  'Knowledge (Craft (Carpentry))':'Attribute=Smarts',
  'Knowledge (Craft (Pottery))':'Attribute=Smarts',
  'Knowledge (Craft (Smithing))':'Attribute=Smarts',
  'Knowledge (Craft (Weaving))':'Attribute=Smarts',
  'Knowledge (Folklore)':'Attribute=Smarts',
  'Knowledge (Heraldry)':'Attribute=Smarts',
  'Knowledge (History)':'Attribute=Smarts',
  'Knowledge (Law)':'Attribute=Smarts',
  'Knowledge (Monsters (Demons))':'Attribute=Smarts',
  'Knowledge (Monsters (Fey))':'Attribute=Smarts',
  'Knowledge (Monsters (Giants))':'Attribute=Smarts',
  'Knowledge (Monsters (Golems))':'Attribute=Smarts',
  'Knowledge (Monsters (Orcs))':'Attribute=Smarts',
  'Knowledge (Monsters (Undead))':'Attribute=Smarts',
  'Knowledge (Religion)':'Attribute=Smarts',
  'Knowledge (Riddles)':'Attribute=Smarts',
  'Knowledge (Siege Artillery)':'Attribute=Smarts',
  'Knowledge (The Seas)':'Attribute=Smarts',
  // Regions
  'Knowledge (Hearthlands)':'Attribute=Smarts',
  'Knowledge (Hellfrost)':'Attribute=Smarts',
  'Knowledge (High Winterlands)':'Attribute=Smarts',
  'Knowledge (Low Winterlands)':'Attribute=Smarts',
  'Knowledge (Outer Hellfrost)':'Attribute=Smarts',
  /*
  // Knowledge skills for individual areas below? Seems like clutter.
  'Knowledge (Alantaris Isle)':'Attribute=Smarts',
  'Knowledge (Angarion)':'Attribute=Smarts',
  'Knowledge (Angmark)':'Attribute=Smarts',
  'Knowledge (Aspiria)':'Attribute=Smarts',
  'Knowledge (The Battlelands)':'Attribute=Smarts',
  'Knowledge (Barony Of Blackstone)':'Attribute=Smarts',
  'Knowledge (The Borderlands)':'Attribute=Smarts',
  'Knowledge (Cairn Lands)':'Attribute=Smarts',
  'Knowledge (Chalis)':'Attribute=Smarts',
  'Knowledge (Coglelund)':'Attribute=Smarts',
  'Knowledge (Crystalflow Confederacy)':'Attribute=Smarts',
  'Knowledge (Barony Of Cul)':'Attribute=Smarts',
  'Knowledge (Drachenlands)':'Attribute=Smarts',
  'Knowledge (Dwarf Cities)':'Attribute=Smarts',
  'Knowledge (Freelands)':'Attribute=Smarts',
  'Knowledge (Freetown)':'Attribute=Smarts',
  'Knowledge (Frozen Forest)':'Attribute=Smarts',
  "Knowledge (Giant's Throne)":'Attribute=Smarts',
  'Knowledge (Glittersands)':'Attribute=Smarts',
  'Knowledge (The Great Swamp)':'Attribute=Smarts',
  'Knowledge (Heldalund)':'Attribute=Smarts',
  'Knowledge (Heligioland)':'Attribute=Smarts',
  'Knowledge (Hrimthyr Isle)':'Attribute=Smarts',
  'Knowledge (Icedale Freeholds)':'Attribute=Smarts',
  'Knowledge (Isle Of The Seareavers)':'Attribute=Smarts',
  'Knowledge (Lakeland)':'Attribute=Smarts',
  'Knowledge (Liche Lands Of Old)':'Attribute=Smarts',
  'Knowledge (The Magocracy)':'Attribute=Smarts',
  'Knowledge (Midmark)':'Attribute=Smarts',
  'Knowledge (The Mistlands)':'Attribute=Smarts',
  'Knowledge (Nerenel)':'Attribute=Smarts',
  'Knowledge (Nordmark)':'Attribute=Smarts',
  'Knowledge (Orcmark)':'Attribute=Smarts',
  'Knowledge (Ostmark)':'Attribute=Smarts',
  'Knowledge (Rimeholm)':'Attribute=Smarts',
  'Knowledge (Royalmark)':'Attribute=Smarts',
  'Knowledge (Seithrby)':'Attribute=Smarts',
  'Knowledge (Shattered Moor)':'Attribute=Smarts',
  'Knowledge (Sunken Realm)':'Attribute=Smarts',
  'Knowledge (Sutmark)':'Attribute=Smarts',
  'Knowledge (Tethilin)':'Attribute=Smarts',
  'Knowledge (Barony Of Trond)':'Attribute=Smarts',
  'Knowledge (Unclaimed Lands)':'Attribute=Smarts',
  'Knowledge (The Vale)':'Attribute=Smarts',
  'Knowledge (Veermark)':'Attribute=Smarts',
  'Knowledge (Vestmark)':'Attribute=Smarts',
  'Knowledge (Witchwood)':'Attribute=Smarts',
  'Knowledge (Withered Lands)':'Attribute=Smarts'
  */
};
Hellfrost.SKILLS = Object.assign(Object.fromEntries(Object.entries(SWD.SKILLS).filter(([k, v]) => !v.includes('Era') || v.match(/Era=[\w,]*Medieval/))), Hellfrost.SKILLS_ADDED);
delete Hellfrost.SKILLS['Knowledge (Language (%language))'];
delete Hellfrost.SKILLS['Language (%language)'];
delete Hellfrost.SKILLS['Weird Science'];
Hellfrost.WEAPONS = {
  'Unarmed':'Damage=Str+d0 Weight=0 Category=Unarmed',
  'Antler Staff':'Damage=Str+d6 Weight=10 Category=Two-Handed Parry=1',
  'Bear Claw':'Damage=Str+d4 Weight=8 Category=One-Handed Parry=1',
  'Double Toothpick':'Damage=Str+d6 Weight=5 Category=One-Handed',
  'Twin Toothpick':'Damage=Str+d8 Weight=5 Category=One-Handed',
  'Boot Spikes':'Damage=Str+d4 Weight=3 Category=Unarmed',
  'Dagger':'Damage=Str+d4 Weight=1 Category=One-Handed',
  'Flail':'Damage=Str+d6 Weight=8 Category=One-Handed',
  'Great Sword':'Damage=Str+d10 Weight=12 Category=Two-Handed Parry=-1',
  'Long Sword':'Damage=Str+d8 Weight=8 Category=One-Handed',
  'Short Sword':'Damage=Str+d6 Weight=4 Category=One-Handed',
  'Axe':'Damage=Str+d6 Weight=2 Category=One-Handed',
  'Battle Axe':'Damage=Str+d8 Weight=10 Category=One-Handed',
  'Great Axe':'Damage=Str+d10 Weight=15 Category=Two-Handed Parry=-1',
  'Mace':'Damage=Str+d6 Weight=4 Category=One-Handed',
  'Maul':'Damage=Str+d8 Weight=20 Category=Two-Handed Parry=-1 AP=2',
  'Warhammer':'Damage=Str+d6 Weight=8 Category=One-Handed AP=1',
  'Halberd':'Damage=Str+d8 Weight=15 Category=Two-Handed',
  'Lance':'Damage=Str+d8 Weight=10 Category=Two-Handed AP=2',
  'Pike':'Damage=Str+d8 Weight=25 Category=Two-Handed',
  'Long Spear':'Damage=Str+d6 Weight=5 Category=Two-Handed Parry=1',
  'Short Spear':'Damage=Str+d6 Weight=3 Category=One-Handed Range=3',
  'Staff':'Damage=Str+d4 Weight=8 Category=Two-Handed Parry=1',
  'Throwing Axe':'Damage=Str+d6 Weight=2 Category=One-Handed Range=3',
  'Bow':'Damage=2d6 MinStr=6 Weight=3 Category=Ranged Range=12',
  'Long Bow':'Damage=2d6 MinStr=8 Weight=5 Category=Ranged Range=15',
  'Crossbow':'Damage=2d6 MinStr=6 Weight=10 Category=Ranged Range=15 AP=2',
  'Sling':'Damage=Str+d4 Weight=1 Category=One-Handed Range=4',
  'Throwing Knife':'Damage=Str+d4 Weight=1 Category=One-Handed Range=3'
};

Hellfrost.SWD2SWADE = function(table) {
  let replacements = {
    // Special for Roadwarden
    'skills.Survival.*skills.Tracking':'skills.Survival',
    '.2 Survival/.2 Tracking':'+2 Survival',
    // Special for Wizard
    'features.Arcane Background \\(Magic\\)':'features.Arcane Background (Druidism) || features.Arcane Background (Elementalism) || features.Arcane Background (Heahwisardry) || features.Arcane Background (Hrimwisardry) || features.Arcane Background (Rune Magic) || features.Arcane Background (Solar Magic) || features.Arcane Background (Song Magic)',
    // Edges
    'Aristocrat':'Noble',
    // Skills
    'Charisma\\b':'Persuasion',
    'Climbing':'Athletics',
    'Investigation':'Research',
    'Knowledge \\(Academics\\)':'Academics',
    'Knowledge \\(Arcana\\)':'Occult',
    'Knowledge \\(Battle\\)':'Battle',
    'Knowledge \\(Electronics\\)':'Electronics',
    'Knowledge \\(Hacking\\)':'Hacking',
    'Knowledge \\(Language \\((.*)\\)\\)':'Language ($1)',
    'Knowledge \\(Science\\)':'Science',
    'Lockpicking':'Thievery',
    // Avoid translating the SWADE Streetwise edge
    '\\.Streetwise':'.Common Knowledge',
    ' Streetwise':' Common Knowledge',
    'Swimming':'Athletics',
    'Throwing':'Athletics',
    'Tracking':'Survival'
  };
  let result = Object.assign({}, table);
  for(let r in replacements) {
    if(r in result) {
      result[replacements[r]] = result[r];
      delete result[r];
    }
    for(let key in result) {
      result[key] = result[key].replace(new RegExp(r, 'g'), replacements[r]);
    }
  }
  return result;
};

/* Defines rules related to powers. */
Hellfrost.arcaneRules = function(rules, arcanas, powers) {
  rules.basePlugin.arcaneRules(rules, arcanas, powers);
  // No changes needed to the rules defined by base method
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
  rules.basePlugin.identityRules(rules, {}, {}, concepts);
  QuilvynUtils.checkAttrTable(deities, []);
  QuilvynUtils.checkAttrTable(races, ['Requires', 'Abilities', 'Languages']);
  for(let d in deities) {
    rules.choiceRules(rules, 'Deity', d, deities[d]);
  }
  for(let r in races) {
    rules.choiceRules(rules, 'Race', r, races[r]);
  }
  rules.defineEditorElement
    ('deity', 'Deity', 'select-one', 'deity', 'origin');
  rules.defineSheetElement('Deity', 'Origin', '<b>Deity</b>: %V');
};

/* Defines rules related to character aptitudes. */
Hellfrost.talentRules = function(
  rules, edges, features, goodies, hindrances, skills, languages, gloryRewards
) {
  rules.basePlugin.talentRules
    (rules, edges, features, goodies, hindrances, skills);
  QuilvynUtils.checkAttrTable(gloryRewards, ['Require']);
  QuilvynUtils.checkAttrTable(languages, []);
  for(let g in gloryRewards) {
    rules.choiceRules(rules, 'Glory Reward', g, gloryRewards[g]);
  }
  for(let l in languages) {
    rules.choiceRules(rules, 'Language', l, languages[l]);
  }
  rules.defineRule('gloryPoints',
    'glory', '=', 'source >= 20 ? Math.floor(source / 20) : null'
  );
  rules.defineEditorElement
    ('glory', 'Glory', 'text', [10, '\\+?\\d+'], 'notes');
  rules.defineEditorElement
    ('gloryRewards', 'Glory Rewards', 'bag', 'gloryRewards', 'notes');
  rules.defineSheetElement('Glory', 'Improvement Points Allocation+');
  rules.defineSheetElement('GloryPart', 'Hindrances+', null, ' ');
  rules.defineSheetElement('GloryStats', 'GloryPart/', null, '');
  rules.defineSheetElement
    ('Glory Points', 'GloryStats/', '<b>Glory Rewards</b> (%V points):');
  rules.defineSheetElement('Glory Rewards', 'GloryPart/', '%V', '; ');
  rules.defineChoice('extras', 'Glory Rewards');
  QuilvynRules.validAllocationRules
    (rules, 'gloryRewards', 'gloryPoints', 'Sum "^gloryRewards\\."');
  rules.defineEditorElement
    ('languages', 'Languages', 'set', 'languages', 'origin');
  rules.defineSheetElement('Languages', 'Skills+', null, '; ');
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
  else if(type == 'Glory Reward') {
    Hellfrost.gloryRewardRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require')
    );
    Hellfrost.gloryRewardRulesExtra(rules, name);
  } else if(type == 'Goody')
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
      QuilvynUtils.getAttrValue(attrs, 'Description'),
      QuilvynUtils.getAttrValueArray(attrs, 'Modifier'),
      QuilvynUtils.getAttrValue(attrs, 'BasedOn')
    );
  else if(type == 'Race') {
    Hellfrost.raceRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValueArray(attrs, 'Abilities'),
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
  type =
    type.charAt(0).toLowerCase() + type.substring(1).replaceAll(' ', '') + 's';
  rules.addChoice(type, name, attrs);
};

/*
 * Defines in #rules# the rules associated with arcane power source #name#,
 * which draws on skill #skill# when casting and allows access to the list of
 * powers #powers#.
 */
Hellfrost.arcanaRules = function(rules, name, skill, powers) {
  rules.basePlugin.arcanaRules(rules, name, skill);
  if(name.match(/Elementalism/)) {
    // Override computation of arcaneSkill for Elementalism, since Hellfrost
    // defines a single Arcane Background (Elementalism), rather than one for
    // each element
    let compactName = name.replaceAll(' ', '');
    rules.defineRule('arcaneSkill' + compactName,
      'features.Arcane Background (' + name + ')', '+', '0',
      'features.Arcane Background (Elementalism)', '?', null,
      'features.' + name, '?', null,
      'skills.' + skill, '=', null
    );
  }
};

/*
 * Defines in #rules# the rules associated with armor #name#, which covers the
 * body areas listed in #areas#, adds #armor# to the character's Toughness,
 * requires a strength of #minStr# to use effectively, and weighs #weight#.
 */
Hellfrost.armorRules = function(rules, name, areas, armor, minStr, weight) {
  if(rules.basePlugin == window.SWD)
    minStr = 0;
  rules.basePlugin.armorRules
    (rules, name, ['Medieval'], areas, armor, minStr, weight);
  rules.defineChoice('notes',
    'sanityNotes.blessedArmor:' +
      'Blessed Armor benefits require Arcane Background (Miracles)',
    'sanityNotes.blessedRobes:' +
      'Blessed Robes benefits require Arcane Background (Miracles)'
  );
  rules.defineRule('sanityNotes.blessedArmor',
    'armor.Blessed Armor', '=', '1',
    'features.Arcane Background (Miracles)', 'v', '0'
  );
  rules.defineRule('sanityNotes.blessedRobes',
    'armor.Blessed Robes', '=', '1',
    'features.Arcane Background (Miracles)', 'v', '0'
  );
  rules.defineRule('armorToughness',
    'sanityNotes.blessedRobes', '+', 'source==1 ? -1 : null'
  );
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
  // Add a backdoor to allow testing multiple disciple edges w/1 character
  if(requires.filter(x => x.includes('deity')).length > 0) {
    let note = 'validationNotes.' + name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '') + 'Edge';
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
  let matchInfo;
  if((matchInfo = name.match(/^Arcane Background \((.*)\)$/)) != null &&
     matchInfo[1] != 'Hrimwisardry' && matchInfo[1] != 'Miracles') {
    let note = 'validationNotes.' + name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '') + 'EdgeFrostborn';
    rules.defineChoice('notes',
      note + ':' + 'Frostborn may only take Hrimwisardry and Miracles Arcane Background edges'
    );
    rules.defineRule(note,
      'race', '=', 'source=="Frostborn" ? 0 : null',
      'edges.' + name, '+', '1'
    );
  }
  if(name == 'Arcane Background (Elementalism)') {
    rules.defineRule('elementalismCount',
      'arcanaNotes.arcaneBackground(Elementalism)', '=', '1'
    );
    rules.defineRule('edgePoints', 'elementalismCount', '+', null);
  } else if(name == 'Arcane Background (Miracles)') {
    rules.defineRule('features.Connections',
      'featureNotes.arcaneBackground(Miracles)', '=', '1'
    );
    rules.defineRule
      ('features.Orders', 'featureNotes.arcaneBackground(Miracles)', '=', '1');
  } else if(name == 'Arcane Background (Rune Magic)') {
    rules.defineRule
      ('runeCount', 'arcanaNotes.arcaneBackground(RuneMagic)', '=', '1');
    rules.defineRule('edgePoints', 'runeCount', '+', null);
  } else if(name == 'Bludgeoner') {
    rules.defineRule
      ('combatNotes.bludgeoner', 'advances', '=', 'Math.floor(source/4) + 1');
    rules.defineRule('range.Sling', 'combatNotes.bludgeoner', '+', null);
  } else if(name == 'Disciple Of Eostre Animalmother') {
    rules.defineRule('features.Beast Master',
      'featureNotes.discipleOfEostreAnimalmother', '=', '1'
    );
  } else if(name == 'Elemental Mastery') {
    rules.defineRule('arcanaNotes.elementalMastery',
      'edges.Elemental Mastery', '=', 'source + 1'
    );
    rules.defineRule
      ('elementalismCount', 'arcanaNotes.elementalMastery', '+', 'source - 1');
  } else if((matchInfo = name.match(/Elementalism \((.*)\)/)) != null) {
    rules.defineRule('features.Arcane Background (' + name + ')',
      'features.' + name, '=', '1'
    );
  } else if(name == 'Giant Blood') {
    rules.defineRule('features.Mean', 'featureNotes.giantBlood', '=', '1');
  } else if(name == 'Knight Hrafn') {
    rules.defineRule
      ('combatNotes.knightHrafn', 'advances', '=', 'Math.floor(source/4) + 1');
    rules.defineRule('commandRange', 'combatNotes.knightHrafn', '+', null);
  } else if(name == 'Library') {
    rules.defineRule
      ('skillNotes.library', 'smarts', '=', 'Math.floor(source / 2)');
    rules.defineRule('skillPoints', 'skillNotes.library', '+', null);
  } else if(name == 'Lurker') {
    rules.defineRule('combatNotes.lurker.1',
      'features.Lurker', '?', null,
      'skills.Stealth', '=', 'Math.floor(source / 2)',
      'skillModifier.Stealth', '+', 'Math.floor(source / 2)',
      'combatNotes.fightingParryModifier', '+', '-source'
    );
    rules.defineRule('combatNotes.lurker',
      'combatNotes.lurker.1', '=', 'QuilvynUtils.signed(source)'
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
    let allWeapons = rules.getChoices('weapons');
    for(let w in allWeapons) {
      if(allWeapons[w].includes('Range') &&
         !allWeapons[w].includes('Category=Ranged'))
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
    let runePowers = QuilvynUtils.getAttrValueArray(rules.getChoices('arcanas')[name], 'Powers');
    runePowers.forEach
      (x => rules.defineRule('powers.' + x, 'features.' + name, '=', '1'));
  } else if(name == 'Wood Warden') {
    rules.defineRule('powers.Beast Friend', 'features.Wood Warden', '=', '1');
  } else if(name == 'World-Wise') {
    rules.defineRule('skillPoints', 'skillNotes.world-Wise', '+', '5');
  } else if(name == 'Linguist' || name == 'Tactician') {
    // empty; overrides base plugin computation
  } else if(rules.basePlugin.edgeRulesExtra) {
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
 * Defines in #rules# the rules associated with glory reward #name#, which has
 * the list of hard prerequisites #requires#.
 */
Hellfrost.gloryRewardRules = function(rules, name, requires) {
  if(!name) {
    console.log('Empty glory reward name');
    return;
  }
  if(!Array.isArray(requires)) {
    console.log
      ('Bad requires list "' + requires + '" for glory reward ' + name);
    return;
  }
  let prefix =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '');
  if(requires.length > 0)
    QuilvynRules.prerequisiteRules
      (rules, 'validation', prefix + 'GloryReward', 'gloryRewards.' + name,
       requires);
  rules.defineRule('features.' + name, 'gloryRewards.' + name, '=', null);
};

/*
 * Defines in #rules# the rules associated with glory reward #name# that cannot
 * be derived directly from the attributes passed to gloryRewardRules.
 */
Hellfrost.gloryRewardRulesExtra = function(rules, name) {
  if(name == 'Combat Prowess') {
    rules.defineRule
      ('featureNotes.combatProwess', 'gloryRewards.Combat Prowess', '=', null);
    rules.defineRule('edgePoints', 'featureNotes.combatProwess', '+', null);
  } else if(name == 'Heroic Aura') {
    let allArmors = rules.getChoices('armors');
    rules.defineRule('wearingArmor',
      'combatNotes.heroicAura', '=', '0'
    );
    for(let armor in allArmors)
      rules.defineRule('wearingArmor', 'armor.' + armor, '+', '1');
    rules.defineRule
      ('combatNotes.heroicAura', 'gloryRewards.Heroic Aura', '=', null);
    rules.defineRule('combatNotes.heroicAura.1',
      'wearingArmor', '?', 'source == 0',
      'combatNotes.heroicAura', '=', null
    );
    rules.defineRule('toughness', 'combatNotes.heroicAura.1', '+', null);
  } else if(name == 'Heroic Status') {
    rules.defineRule
      ('skillNotes.heroicStatus', 'gloryRewards.Heroic Status', '=', null);
    rules.defineRule
      ('skillNotes.heroicStatus-1', 'gloryRewards.Heroic Status', '=', null);
  } else if(name == 'Leader Of Men') {
    rules.defineRule
      ('featureNotes.leaderOfMen', 'gloryRewards.Leader Of Men', '=', null);
    rules.defineRule('edgePoints', 'featureNotes.leaderOfMen', '+', null);
  }
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
  if(rules.basePlugin.hindranceRulesExtra)
    rules.basePlugin.hindranceRulesExtra(rules, name);
  // No changes needed to the rules defined by base method
};

/* Defines in #rules# the rules associated with language #name#. */
Hellfrost.languageRules = function(rules, name) {
  if(!name) {
    console.log('Empty language name');
    return;
  }
  // No rules pertain to language
};

/*
 * Defines in #rules# the rules associated with power #name#, which may be
 * acquired only after #advances# advances, requires #powerPoints# Power Points
 * to use, and can be cast at range #range#. #description# is a concise
 * description of the power's effects. #modifiers# lists specific modifications
 * that may be applied when using this power. #basedOn#, if defined, is an
 * existing power that this power adapts; other undefined parameters are copied
 * from the attributes of this power.
 */
Hellfrost.powerRules = function(
  rules, name, advances, powerPoints, range, description, modifiers, adapts
) {
  if(rules.basePlugin == window.SWD)
    rules.basePlugin.powerRules(
      rules, name, advances, powerPoints, range, description, adapts
    );
  else
    rules.basePlugin.powerRules(
      rules, name, advances, powerPoints, range, description, modifiers, adapts
    );
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with race #name#, which has the list
 * of hard prerequisites #requires#. #abilities# list associated abilities and
 * #languages# any automatic languages.
 */
Hellfrost.raceRules = function(rules, name, requires, abilities, languages) {
  rules.basePlugin.raceRules(rules, name, requires, abilities);
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
  if(rules.basePlugin == window.SWD)
    minStr = 0;
  rules.basePlugin.shieldRules
    (rules, name, ['Medieval'], parry, cover, minStr, weight);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with skill #name#, associated with
 * #attribute# (one of 'agility', 'spirit', etc.).
 */
Hellfrost.skillRules = function(rules, name, attribute, core) {
  rules.basePlugin.skillRules(rules, name, ['Medieval'], attribute, core);
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
  if(minStr == null && (damage + '').match(/d\d+/))
    minStr = damage.match(/d(\d+)/)[1] - 0;
  rules.basePlugin.weaponRules(
    rules, name, ['Medieval'], damage, minStr, weight, category, armorPiercing,
    range, rateOfFire, parry
  );
  // No changes needed to the rules defined by base method
};

/*
 * Returns the list of editing elements needed by #choiceRules# to add a #type#
 * item to #rules#.
 */
Hellfrost.choiceEditorElements = function(rules, type) {
  let result;
  if(type == 'Deity')
    result = [];
  else if(type == 'Edge') {
    result = SWADE.choiceEditorElements(rules, 'Edge');
    let typeIndex = result.findIndex(x => x[0] == 'Type');
    result[typeIndex][3] = result[typeIndex][3].concat('Disciple').sort();
  } else if(type == 'Glory Reward')
    result = [['Require', 'Prerequisite', 'text', [40]]];
  else if(type == 'Language')
    result = [];
  else
    result = rules.basePlugin.choiceEditorElements(rules, type);
  return result;
};

Hellfrost.NAMES = {
  Engro: {
    Male: [
      'Bertrem', 'Jym', 'Odbert', 'Oxbow', 'Rodgar',
      '%{Syllables}',
      // Behind the Name Germanic
      'Adalfar', 'Aldwin', 'Alfbern', 'Anzo', 'Baldo', 'Bodo', 'Colobert',
      'Faramund', 'Filibert', 'Haimo', 'Humbert', 'Pepin', 'Rocco', 'Waldo'
    ],
    Female: [
      'Daisy', 'Foxglove', 'Petunia', 'Rose',
      '%{Syllables}',
      // Wikipedia "County flowers of the United Kingdom"
      'Heather', 'Primrose', 'Poppy', 'Daffodil', 'Violet', 'Holly', 'Crocus',
      'Rosemary', 'Pansy', 'Iris', 'Lily'
    ],
    Nonbinary: [
      '%{Syllables}',
      // Nature-based English and Germanic
      'Alba', 'Asco', 'Ash', 'Cherry', 'Engel', 'Goda', 'Isa', 'Ivo',
      'Leutwin', 'River', 'Wido', 'Wina'
    ],
    Surname: [] // PG: Engro use no surname
  },
  'Frost Dwarf': {
    Male: [
      'Ari', 'Bardi', 'Geirstein', 'Hord', 'Ljot', 'Olvir',
      '%{Syllables}',
      // Behind the Name Old Norse
      'Agnarr', 'Hallbjorn', 'Herleifr', 'Magni', 'Steinunn'
    ],
    Female: [
      'Asleif', 'Herdis', 'Svala', 'Thyra',
      '%{Syllables}',
      // Behind the Name Old Norse
      'Asta', 'Brynja', 'Eydis', 'Ingunn', 'Ragna', 'Saldis'
    ],
    Nonbinary: [
      '%{Syllables}',
      // Behind the Name Old Norse
      'Authr', 'Herleif', 'Baggi', 'Somerled', 'Stigr'
    ],
    Surname: ['%{Adjective}%{Noun}'],
    Adjective: [
      'Bright', 'Foe', 'Gold', 'Steel',
      // Add some others
      'Bold', 'Sure', 'True', 'Swift', 'Sharp', 'Stout'
    ],
    Noun: [
      'hammer', 'axe', 'beard', 'hand',
      // Add some others
      'helm', 'fist', 'forge', 'shield', 'horn', 'hall'
    ]
  },
  Frostborn: {
    Male: ['%{Cold}%{Noun}'],
    Female: ['%{Cold}%{Noun}'],
    Nonbinary: ['%{Cold}%{Noun}'],
    Surname: [], // PG: Frostborn use no surname
    Cold: [
      'Frost', 'Ice', 'Rime', 'Snow',
      // Add some others
      'Chill', 'Winter', 'Cold', 'Winter', 'Sleet', 'Wind', 'White'
    ],
    Noun: [
      'mane', 'razor', 'hand', 'walker',
      // Add some others
      'foot', 'gaze', 'breath', 'brow', 'glider', 'spear'
    ]
  },
  'Hearth Elf': {
    Male: [
      'Ailinnil', 'Elleneirlir', 'Melasion', 'Nielian', 'Sinrilli',
      '%{Syllables}',
      // Quilvyn random elf names
      'Quoyalci', 'Fefylesefimi', 'Esmypmy', 'Mylvhefsa', 'Mallosep',
      'Lymyemyas', 'Ilemelm', 'Quaali', 'Pellee', 'Plami'
    ],
    Female: [
      'Ailinnil', 'Elleneirlir', 'Melasion', 'Nielian', 'Sinrilli',
      '%{Syllables}',
      // Quilvyn random elf names
      'Quoyalci', 'Fefylesefimi', 'Esmypmy', 'Mylvhefsa', 'Mallosep',
      'Lymyemyas', 'Ilemelm', 'Quaali', 'Pellee', 'Plami'
    ],
    Nonbinary: [
      'Ailinnil', 'Elleneirlir', 'Melasion', 'Nielian', 'Sinrilli',
      '%{Syllables}',
      // Quilvyn random elf names
      'Quoyalci', 'Fefylesefimi', 'Esmypmy', 'Mylvhefsa', 'Mallosep',
      'Lymyemyas', 'Ilemelm', 'Quaali', 'Pellee', 'Plami'
    ],
    Surname: ['%{Nature}%{Noun}'],
    Nature: [
      'Bough', 'Leaf', 'Morning', 'Sharp',
      // Add some others
      'Bog', 'Vale', 'Hill', 'Rill', 'Glen', 'Twig', 'Evening'
    ],
    Noun: [
      'runner', 'rustle', 'mist', 'whistle',
      // Add some others
      'friend', 'breeze', 'shadow', 'moon', 'spirit', 'dew'
    ]
  },
  'Taiga Elf': {
    Male: ['%{Cold}%{Noun}'],
    Female: ['%{Cold}%{Noun}'],
    Nonbinary: ['%{Cold}%{Noun}'],
    Surname: [], // PG: Taiga Elves use no surname
    Cold: [
      'Flake', 'Frost', 'Ice', 'Night', 'Shadow', 'Snow',
      // Add some others
      'Dark', 'Winter', 'Cold', 'Star', 'Stone', 'Moon'
    ],
    Noun: [
      'rider', 'man', 'gleam', 'eyes', 'weaver', 'runner',
      // Add some others
      'master', 'speaker', 'reach', 'grip', 'water', 'maker'
    ]
  },
  'Anari Human': {
    Male: [
      'Argius', 'Bron', 'Bovert', 'Delbaeth', 'Emeric', 'Gaidon', 'Garth',
      'Howel', 'Patris', 'Rochad', 'Serin', 'Thosa',
      '%{Syllables}',
      // Behind the Name Old Celtic
      'Berach', 'Brychan', 'Cadoc', 'Cathal', 'Cian', 'Fergal', 'Iorwerth',
      'Mathgamain', 'Ronan', 'Taran'
    ],
    Female: [
      'Aife', 'Armide', 'Branwen', 'Elianor', 'Emer', 'Liaze', 'Lusiane',
      'Tangwenn', 'Ursanne',
      '%{Syllables}',
      // Behind the Name Old Celtic
      'Aine', 'Angharad', 'Bebinn', 'Eithne', 'Grainne', 'Ite', 'Mairenn',
      'Muadnat', 'Ordanat', 'Orlaith'
    ],
    Nonbinary: [
      '%{Syllables}',
      // Behind the Name Old Celtic
      'Ailbe', 'Ciar', 'Feidlimid', 'Flann', 'Slaine'
    ],
    Surname: [
      'ap-%{Male}', '%{Trade}', '%{Syllables}',
      // Add matrilineal
      'ap-%{Female}'
    ],
    Trade: [
      'Smith', 'Tailor', 'Weaver',
      // Add some others
      'Carter', 'Cooper', 'Mason', 'Thatcher', 'Fletcher', 'Baker', 'Brewer',
      'Miller', 'Slater', 'Dyer'
    ]
  },
  'Finnar Human': {
    Male: [
      'Arto', 'Kaiju', 'Konsta', 'Taneli', 'Tove', 'Vilho',
      // Behind the Name Finnish
      'Aulis', 'Eero', 'Ensio', 'Jalmari', 'Kalervo', 'Keijo',
      'Maija', 'Niilo', 'Olavi', 'Paavo', 'Seppo'
    ],
    Female: [
      'Esko', 'Hannu', 'Kaari', 'Merja', 'Pirkka', 'Tyko',
      // Behind the Name Finnish
      'Aamu', 'Ansa', 'Eija', 'Eila', 'Hannele', 'Hertta',
      'Ilma', 'Ilta', 'Katja', 'Maija', 'Orvokki', 'Ritva'
    ],
    Nonbinary: [
      '%{Syllables}',
      // Behind the Name Finnish
      'Ale', 'Manu', 'Maria', 'Vieno'
    ],
    Surname: [
      'Aho', 'Hietanen', 'Jarnefelt', 'Paatalo', 'Petelius', 'Stenvall',
      'Utrio', 'Waltari',
      // Behind the Name Finnish
      'Aalto', 'Honkanen', 'Jokela', 'Karppinen', 'Laaksonen',
      'Mustonen', 'Nurmi', 'Ojala', 'Peltola', 'Turunen'
    ]
  },
  'Saxa Human': {
    Male: [
      'Agdi', 'Cynric', 'Edwin', 'Gaurek', 'Leofric', 'Penda', 'Runolf',
      'Seaxwulf', 'Skuli', 'Wiglaf',
      // Behind the Name Anglo-Saxon
      'Aethelred', 'Botwulf', 'Dunstan', 'Hereward', 'Osgar', 'Waermund'
    ],
    Female: [
      'Aalfwynn', 'Eadgifu', 'Gytha', 'Isgerrd', 'Skjalf', 'Thorgerd',
      'Wulfwynn', 'Yrsa',
      // Behind the Name Anglo-Saxon
      'Bealdhild', 'Mildburg', 'Wassa', 'Cyneburg', 'Hild', 'Wihtburg'
    ],
    Nonbinary: [
      '%{Syllables}',
      // Behind the Name Anglo-Saxon
      'Leofdaeg', 'Puck', 'Cola', 'Doerwine', 'Heard', 'Tata', 'Wine'
    ],
    Surname: [
      '%{Male}s%{Parentage}',
      // Add matrilineal
      '%{Female}s%{Parentage}'
    ],
    Parentage: {
      Male: 'unu', Female: 'dohtor', Nonbinary: 'bearn'
    }
  },
  'Tuomi Human': {
    Male: [
      'Achivir', 'Arcois', 'Bili', 'Brude', 'Canaul', 'Gart', 'Volas',
      // Wikipedia List of legendary kings of Pictland
      'Cruithne', 'Fidach', 'Cait', 'Circin', 'Wurget', 'Urgant'
    ],
    Female: [
      'Aniel', 'Bannatia', 'Breth', 'Cailis', 'Ila', 'Olfinecta', 'Tamia',
      // https://eithni.com/pictish-names/
      'Coblaith', 'Derile', 'Domelch', 'Eithne', 'Nadbroicc'
    ],
    Nonbinary: [
      '%{Syllables}',
      // https://eithni.com/pictish-names/
      'Nectudad', 'Feidelm', 'Fina', 'Fotla', 'Luan'
    ],
    Surname: [
      'Argentocoxus', 'Bliesblituth', 'Canutulachama', 'Deocilunon',
      'Muircholaich', 'Tolarggan',
      '%{Syllables}',
      // Wikipedia List of legendary kings of Pictland
      'Usconbuts', 'Dectotric', 'Tharain', 'Cimoiod', 'Moreleo'
    ]
  }
};

/* Sets #attributes#'s #attribute# attribute to a random value. */
Hellfrost.randomizeOneAttribute = function(attributes, attribute) {

  /* Returns a random element from the array #list#. */
  function randomElement(list) {
    return list.length>0 ? list[QuilvynUtils.random(0, list.length - 1)] : '';
  }

  let attr;
  let attrs = this.applyRules(attributes);
  let choices;
  let howMany;
  let i;

  if(attribute == 'languages') {
    howMany =
      attrs['features.Linguist'] ? attrs.smarts : Math.floor(attrs.smarts / 2);
    choices = [];
    for(let l in this.getChoices('languages')) {
      if('languages.' + l in attrs)
        howMany--;
      else
        choices.push(l);
    }
    let allRaces = this.getChoices('races');
    let racialLanguages = [];
    if(allRaces && attrs.race && allRaces[attrs.race])
      racialLanguages =
        QuilvynUtils.getAttrValueArray(allRaces[attrs.race], 'Languages');
    racialLanguages.forEach(l => {
      if(howMany > 0 && choices.includes(l)) {
        attributes['languages.' + l] = 1;
        howMany--;
        choices = choices.filter(x => x != l);
      }
    });
    while(howMany > 0) {
      i = QuilvynUtils.random(0, choices.length - 1);
      attributes['languages.' + choices[i]] = 1;
      choices.splice(i, 1);
      howMany--;
    }
    return;
  } else if(attribute == 'name') {
    let race = attributes.race || 'Anari Human';
    let swadeRace = race == 'Engro' ? 'Half-folk' : race;
    let raceNames = Hellfrost.NAMES[race];
    let gender = attributes.gender;
    if(!(gender+'').match(/^(Female|Male)$/))
      gender = 'Nonbinary';
    choices = raceNames[gender] || ['%{Syllables}'];
    attr = randomElement(choices);
    choices = raceNames.Surname;
    if(choices && choices.length > 0)
      attr += ' ' + randomElement(choices);
    let matchInfo;
    while((matchInfo = attr.match(/%{(\w+)}/)) != null) {
      if(matchInfo[1] in raceNames) {
        choices = raceNames[matchInfo[1]];
        if(Array.isArray(choices))
          attr = attr.replace(matchInfo[0], randomElement(choices));
        else if(gender in choices)
          attr = attr.replace(matchInfo[0], choices[gender]);
        else
          attr = attr.replace(matchInfo[0], SWADE.randomName(swadeRace));
      } else {
        attr = attr.replace(matchInfo[0], SWADE.randomName(swadeRace));
      }
    }
    attributes.name = attr;
    return;
  }

  // Give priests their deity's signature spell
  if(attribute == 'powers' && attrs['features.Arcane Background (Miracles)']) {
    let arcana =
      this.getChoices('arcanas')['Miracles (' + attributes.deity + ')'];
    let powers = [];
    if(arcana)
      powers = QuilvynUtils.getAttrValueArray(arcana, 'Powers');
    if(powers.length > 0)
      attributes['powers.' + powers[0]] = 1;
  }

  // Handle targeted feature allocations
  if(attribute == 'skills' && attrs['features.Sneaky'] != null) {
    choices = ['Lockpicking', 'Stealth', 'Thievery'];
    howMany =
      2 - QuilvynUtils.sumMatching(attributes, /skillAllocation.(Lockpicking|Stealth|Thievery)/);
    while(howMany > 0) {
      attr =
        'skillAllocation.' + choices[QuilvynUtils.random(0, choices.length-1)];
      if(!attributes[attr])
        attributes[attr] = 0;
      attributes[attr]++;
      howMany--;
    }
  }
  if(attribute == 'skills' && attrs['features.Library'] != null) {
    choices = [];
    for(attr in this.getChoices('skills')) {
      if(attr.startsWith('Knowledge'))
        choices.push(attr);
    }
    howMany =
      attrs.smarts / 2 -
      QuilvynUtils.sumMatching(attributes, /skillAllocation.Knowledge/);
    while(howMany > 0 && choices.length > 0) {
      attr =
        'skillAllocation.' + choices[QuilvynUtils.random(0, choices.length-1)];
      if(!attributes[attr])
        attributes[attr] = 0;
      attributes[attr]++;
      howMany--;
    }
  }
  if(attribute == 'skills' && attrs['features.World-Wise'] != null) {
    howMany = 5;
    choices = [];
    for(attr in this.getChoices('skills')) {
      if(('skillAllocation.' + attr) in attributes)
        howMany -= attributes['skillAllocation.' + attr];
    }
    while(howMany > 0 && choices.length > 0) {
      attr =
        'skillAllocation.' + choices[QuilvynUtils.random(0, choices.length-1)];
      if(!attributes[attr])
        attributes[attr] = 0;
      attributes[attr]++;
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
  let preAttributes = Object.assign({}, attributes);
  let allChoices = null;
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
      let skill = QuilvynUtils.getAttrValue(choices[attr], 'Skill');
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
    let countEdges =
      {'elementalismCount':'Elementalism', 'runeCount':'Rune Magic'};
    let newEdges = [];
    for(attr in attributes) {
      if(attr.startsWith('edges.') && !(attr in preAttributes))
        newEdges.push(attr);
    }
    for(let count in countEdges) {
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
  let result = [this.basePlugin].concat(this.basePlugin.getPlugins());
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
    '  Quilvyn calculates and reports Power Points for those who want to use' +
    '  the power mechanics from the base rules. Edges that affect power' +
    '  points (Rapid Recharge, Soul Drain, etc.) are also available. Power'+
    '  Point costs of Hellfrost spells are estimated by comparison with' +
    '  spells of similar power from the base rules.\n' +
    '  </li><li>\n' +
    '  The SWADE Hellfrost implementation uses a simple transition of SWD' +
    '  rules to SWADE rules, largely limited to a translation of skills. This' +
    '  will be replaced if an official adaptation of Hellfrost to SWADE' +
    '  becomes available.\n' +
    '  </li><li>\n' +
    '  Instead of using the New Power edge with rune magic, Quilvyn defines a' +
    '  separate New Rune edge that gives rune mages access to additional' +
    '  runes.\n' +
    '  </li><li>\n' +
    '  The Hellfrost rule set supports all the homebrew types discussed in' +
    '  the <a href="homebrew-swade.html">SWADE Homebrew Examples document</a>' +
    '  other than Era. In addition, Hellfrost allows you to add homebrew' +
    '  deities, languages, and glory rewards. Adding a homebrew deity or' +
    '  language requires only giving the name; glory rewards also allow' +
    '  specifying prerequisites for obtaining the reward.\n' +
    '  </li><li>\n' +
    '  Many of the random names Quilvyn uses when generating characters are' +
    '  taken from the medieval name lists on the' +
    '  <a href="https://www.behindthename.com/">Behind the Name website</a>.' +
    '  Tuomi names are taken from Wikipedia\'s' +
    '  <a href="https://en.wikipedia.org/wiki/List_of_legendary_kings_of_Pictland">list of Pictish kings</a> and the website <a href="https://eithni.com/pictish-names/">Eithni\'s Keep</a>.\n' +
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
    '</p><p>\n' +
    'Hellfrost Rassilon Expansion © 2010 Triple Ace Games.\n' +
    '</p><p>\n' +
    'Hellfrost Rassilon Expansion II © 2014 Triple Ace Games.\n' +
    '</p>\n' +
    '<img alt="Savage Worlds Fan Logo" width="300" height="200" src="https://peginc.com/wp-content/uploads/2019/01/SW_LOGO_FP_2018.png"/>\n';
};
