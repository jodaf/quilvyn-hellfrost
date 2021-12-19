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
  rules.randomizeOneAttribute = rules.basePlugin.randomizeOneAttribute;
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
  Hellfrost.identityRules(rules, Hellfrost.RACES);
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
  'Disciple Of The Unkowable One':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"agility >= 8",' +
      '"smarts >= 8",' +
      '"skills.Faith >= 6",' +
      '"skills.Taunt >= 8",' +
      '"deity == \'The Unknowable One\'"',
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
  'Disciple Of The Unkowable One':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"agility >= 8",' +
      '"smarts >= 8",' +
      '"skills.Faith >= 6",' +
      '"skills.Taunt >= 8",' +
      '"deity == \'The Unknowable One\'"',
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
      '"deity == \'The Unknowable One\'"',
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
  'Disciple Of The Unkowable One':
    'Type=disciple ' +
    'Require=' +
      '"advances >= 4",' +
      '"features.Arcane Background (Miracles)",' +
      '"agility >= 8",' +
      '"smarts >= 8",' +
      '"skills.Faith >= 6",' +
      '"skills.Taunt >= 8",' +
      '"deity == \'The Unknowable One\'"',
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
       '"advances >= 8",' +
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
  'Focus':'Type=power Require="advances >= 4","spirit >= 6","arcaneSkill >= 8"',
  'Improved Focus':'Type=power Require="advances >= 8",features.Focus',
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
  'Spell Finesse':
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
      '"skills.Fighting >= 8"',
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
      '"spirit >= 6",' +
      '"skills.Faith >= 6"',
  'Iron Guild Mercenary':
    'Type=professional ' +
    'Require=' +
      '"strength >= 8",' +
      '"spirit >= 6",' +
      '"skills.fighting >= 6"',
  'Knight Hfrafn':
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
      '"skills.Survival >= 6",' +
      '"skills.Tracking >= 6"',
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
  'A Few Good Men':'Section=feature Note="TODO"',
  'Alchemy':'Section=feature Note="TODO"',
  'Augment Staff (Aura)':'Section=feature Note="TODO"',
  'Augment Staff (Damage)':'Section=feature Note="TODO"',
  'Augment Staff (Deflect)':'Section=feature Note="TODO"',
  'Augment Staff (Spell Store)':'Section=feature Note="TODO"',
  'Bladedancer':'Section=feature Note="TODO"',
  'Blood And Guts':
    'Section=combat ' +
    'Note="Halve negative difference between tokens in mass battle"',
  'Bludgeoner':'Section=feature Note="TODO"',
  'Combine Spells':'Section=feature Note="TODO"',
  'Concentration':'Section=feature Note="TODO"',
  'Coordinated Firepower':'Section=feature Note="TODO"',
  'Courageous':'Section=attribute Note="+2 Spirit (fear), -2 Fear Table roll"',
  'Cry Havoc!':'Section=feature Note="TODO"',
  'Death Before Dishonor':'Section=feature Note="TODO"',
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
  'Disciple Of Hela':'Section=feature Note="TODO"',
  'Disciple Of Hoenir':'Section=feature Note="TODO"',
  'Disciple Of Hothar':'Section=feature Note="TODO"',
  'Disciple Of Kenaz':'Section=feature Note="TODO"',
  'Disciple Of Maera':'Section=feature Note="TODO"',
  'Disciple Of Nauthiz':'Section=feature Note="TODO"',
  'Disciple Of Neorthe':'Section=feature Note="TODO"',
  'Disciple Of Niht':'Section=feature Note="TODO"',
  'Disciple Of Rigr':'Section=feature Note="TODO"',
  'Disciple Of Scaetha':'Section=feature Note="TODO"',
  'Disciple Of Sigel':'Section=feature Note="TODO"',
  'Disciple Of The Norns':'Section=feature Note="TODO"',
  'Disciple Of The Unkowable One':'Section=feature Note="TODO"',
  'Disciple Of The Unkowable One':'Section=feature Note="TODO"',
  'Disciple Of The Unkowable One':'Section=feature Note="TODO"',
  'Disciple Of Thunor':'Section=feature Note="TODO"',
  'Disciple Of Tiw':'Section=feature Note="TODO"',
  'Disciple Of Ullr':'Section=feature Note="TODO"',
  'Double Shot':'Section=combat Note="Fire two arrows at one target%V"',
  'Elemental Mastery':'Section=feature Note="TODO"',
  'Fanaticism':'Section=feature Note="TODO"',
  'Favored Foe':
    'Section=combat ' +
    'Note="+1 Parry and d8 attack raise against chosen creature"',
  'Focus':'Section=feature Note="TODO"',
  'Gray Legionary':'Section=feature Note="TODO"',
  'Guild Thief':'Section=feature Note="TODO"',
  'Hearth Knight':'Section=feature Note="TODO"',
  'Hedge Magic':'Section=feature Note="TODO"',
  'Hellfreeze':'Section=feature Note="TODO"',
  'Holy/Unholy Warrior':'Section=feature Note="TODO"',
  'Improved Concentration':'Section=feature Note="TODO"',
  'Improved Double Shot':'Section=feature Note="Increased Double Shot effects"',
  'Improved Focus':'Section=feature Note="TODO"',
  'Improved Giant Killer':
    'Section=combat ' +
    'Note="Ignore Armor or Size benefits of creatures of Size %{size+3}"',
  'Improved Snow Walker':'Section=combat Note="Increased Snow Walker effects"',
  'Improved Sunder':'Section=feature Note="Increased Sunder effects"',
  'Iron Guild Mercenary':'Section=feature Note="TODO"',
  'Knight Hfrafn':'Section=feature Note="TODO"',
  'Legendary Storyteller':'Section=feature Note="TODO"',
  'Library':
    'Section=skill ' +
    'Note="Owns Tomes of Lore that give %V knowledge skill points"',
  'Linguist':'Section=feature Note="Knows %{smarts} languages"',
  'Lorekeeper':'Section=feature Note="TODO"',
  'Master Storyteller':'Section=feature Note="TODO"',
  'Mighty Shot':'Section=combat Note="Bow does %V%1+d6 damage"',
  'Mighty Throw':
    'Section=combat ' +
    'Note="Increase throw range by 1/2/4, +1 Strength die for short throws"',
  'Necromantic Severing':'Section=combat Note="Make Called Shots vs. undead"',
  'Noble':'Section=feature Note="TODO"',
  'Old Family':'Section=skill Note="+2 Occult"',
  'Oversized Weapon Master':
    'Section=combat Note="Use two-handed weapons with one hand"',
  'Power Surge':'Section=feature Note="TODO"',
  'Reliquary (Arcanologist)':'Section=feature Note="TODO"',
  'Reliquary (Reliqus)':'Section=feature Note="TODO"',
  'Roadwarden':'Section=feature Note="TODO"',
  'Runic Insight':'Section=feature Note="TODO"',
  'Scamper':'Section=combat Note="Larger foes -1 attack"',
  'Shieldwall':'Section=combat Note="Shield benefit apples to adjacent ally"',
  'Siege Breaker':'Section=feature Note="TODO"',
  'Siege Mentality':'Section=feature Note="TODO"',
  'Sister Of Mercy':'Section=feature Note="TODO"',
  'Snow Walker':'Section=combat Note="Move %V over snow and ice"',
  'Spell Finesse':'Section=feature Note="TODO"',
  'Styrimathr':'Section=feature Note="Owns a Smabyrding with no ice rig"',
  'Sunder':'Section=feature Note="Attacks ignore %V Armor points"',
  'Wall Of Steel':'Section=combat Note="Foes gin no Gang Up bonus"',
  'War Cry':
    'Section=combat Note="Force Intimidation Test against all in 40 yd radius"',
  'Warm Blooded':'Section=attribute Note="+2 Vigor (resist cold)"',
  'Wood Warden':'Section=feature Note="TODO"',
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
Hellfrost.identityRules = function(rules, races) {
  rules.basePlugin.identityRules(rules, races, {});
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
  } else if(name == 'Disciple Of Eostre Animalmother') {
    rules.defineRule('features.Beast Master',
      'features.Disciple Of Eostre Animalmother', '=', '1'
    );
  } else if(name == 'Double Shot') {
    rules.defineRule('combatNotes.doubleShot',
      '', '=', '" at -2 attack"',
      'combatNotes.improvedDoubleShot', '=', '""'
    );
  } else if(name == 'Library') {
    rules.defineRule
      ('skillNotes.library', 'smarts', '=', 'Math.floor(source / 2)');
    rules.defineRule('skillPoints', 'skillNotes.library', '+', null);
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
