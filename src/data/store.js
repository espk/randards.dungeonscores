/* eslint-disable no-console */
import Vue from 'vue'
import Vuex from 'vuex'
import armory from "./armory"


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    dungeons: [
      //{ id: 13309, name: "De Other Side" },
      //{ id: 12831, name: "Halls of Atonement" },
      //{ id: 13334, name: "Mists of Tirna Scithe" },
      //{ id: 12916, name: "The Necrotic Wake" },
      //{ id: 13228, name: "Plaguefall" },
      //{ id: 12842, name: "Sanguine Depths" },
      //{ id: 12837, name: "Spires of Ascension" },
      //{ id: 12841, name: "Theater of Pain" },

      /*
      { id: 6984, name: "Grimrail Depot" },
      { id: 6951, name: "Iron Docks" },
      { id: 800001, name: "Mechagon Junkyard" },
      { id: 800002, name: "Mechagon Workshop" },
      { id: 999998, name: "Return to Karazhan: Lower" },
      { id: 999999, name: "Return to Karazhan: Upper" },
      { id: 1000001, name: "Tazavesh: So'leah's Gambit" },
      { id: 1000000, name: "Tazavesh: Streets of Wonder" },
      */

      { id: 14032, name: "Algeth'ar Academy" },
      { id: 13954, name: "The Azure Vault" },
      { id: 8079, name: "Court of Stars" },
      { id: 7672, name: "Halls of Valor" },
      { id: 13982, name: "The Nokhud Offensive" },
      { id: 14063, name: "Ruby Life Pools" },
      { id: 6932, name: "Shadowmoon Burial Grounds" },
      { id: 5965, name: "Temple of the Jade Serpent" },

    ],

    character: '',
    realm: '',

    currentCharacter: {},

    range: [15, 16, 17, 18, 19],
    loaded: false
  },

  mutations: {
    clearData(state) {
      while (state.characters.length > 0) {
        state.characters.pop()
      }
    },
    clearRange(state) {
      while (state.range.length > 0) {
        state.range.pop()
      }
    },
    setLoading(state, payload) {
      state.loaded = !payload
    },
    addCharacter(state, payload) {
      state.characters.push(payload)
    },
    updateCurrentCharacter(state, payload) {
      state.currentCharacter = payload
    },
    removeCharacter(state, payload) {
      var index = state.characters.findIndex(e => { return ((e.name.toLowerCase() === payload.name.toLowerCase()) && (e.realm.toLowerCase() === payload.realm).toLowerCase()) })
      state.characters.splice(index, 1)
    },
    repopulateRange(state, payload) {
      for (let i = payload.min; i <= payload.max; i++) {
        state.range.push(i)
      }
    },

  },


  actions: {

    loadCharacter(context, payload) {
      context.commit('setLoading', true)
      // set default
      if (payload.realm === '') { payload.realm = 'whisperwind' }

      armory.getCharacterCharacterScores(payload.character, payload.realm)
        .then(result => {
          context.commit('updateCurrentCharacter', helpers.mapCharacterStructure(result.data))
          context.commit('setLoading', false)
        })
        .catch(error => {
          console.log(error)
        })

    },
    removeCharacter(context, payload) {
      context.commit('removeCharacter', payload)
    },
    updateRange(context, payload) {
      context.commit('clearRange')
      context.commit('repopulateRange', payload)
    },
    pingApi() {
      armory.pingHeartbeat()
    }
  }
})


const helpers = {

  mapCharacterStructure(wowApiResult) {
    var mapped = {};

    mapped.id = 9001;
    mapped.name = wowApiResult.name;
    mapped.realm = wowApiResult.realm.name;
    mapped.spec = wowApiResult.active_spec_name;
    mapped.className = wowApiResult.class.toLowerCase().replace(' ', '-');

    mapped.dungeons = this.getNewDungeonScores(wowApiResult);

    return mapped;
  },

  mappedItem(item) {
    if (item === undefined) { return {} }

    var mapped = {
      id: item.item.id,
      quality: item.quality.name,
      itemLevel: item.level.value,
      sockets: []
    };

    if (item.slot.name === 'Main Hand') {
      mapped.weaponType = item.inventory_type.name;
    }

    if (item.azerite_details) {
      mapped.azeriteEmpoweredItem = { azeritePowers: [] };
      if (item.azerite_details.selected_powers) {
        item.azerite_details.selected_powers.forEach(power => { mapped.azeriteEmpoweredItem.azeritePowers.push({ id: power.id }) });
      }
    }

    if (item.bonus_list) {
      mapped.bonus = item.bonus_list
    }

    if (item.sockets !== undefined && item.sockets.length > 0) {
      item.sockets.forEach(socket => {
        if (socket.item !== undefined) {
          mapped.sockets.push({ id: socket.item.id, name: socket.item.name, displayString: socket.display_string })
        }
        else {
          mapped.sockets.push({ id: null, name: "", displayString: "no gem" })
        }
      })
    }

    return mapped
  },

  sortResults(state) {
    state.raid.sort((a, b) => { return b.items.averageItemLevel - a.items.averageItemLevel })
  },

  getPercentileForItemLevel(state, itemLevel) {

    var percentile = Math.floor(100 * ((itemLevel - state.statistics.curveBottom) / (state.statistics.curveTop - state.statistics.curveBottom)))

    if (percentile > 100) return 100
    if (percentile < 0) return 0

    return percentile
  },

  getNewMapping() {
    return {
      averageItemLevel: -1,
      averageItemLevelEquipped: -1,
      head: -1,
      neck: -1,
      shoulder: -1,
      back: -1,
      chest: -1,
      shirt: -1,
      tabard: -1,
      wrist: -1,
      hands: -1,
      waist: -1,
      legs: -1,
      feet: -1,
      finger1: -1,
      finger2: -1,
      trinket1: -1,
      trinket2: -1,
      mainHand: -1,
      offHand: -1,
    }
  },

  getCharacterTemplate() {
    return
  },

  getNewDungeonScores(character) {
    var result = {
      scores: [/*
        { id: 13309, name: "De Other Side", fortified: 0, tyrannical: 0 },
        { id: 12831, name: "Halls of Atonement", fortified: 0, tyrannical: 0 },
        { id: 13334, name: "Mists of Tirna Scithe", fortified: 0, tyrannical: 0 },
        { id: 12916, name: "The Necrotic Wake", fortified: 0, tyrannical: 0 },
        { id: 13228, name: "Plaguefall", fortified: 0, tyrannical: 0 },
        { id: 12842, name: "Sanguine Depths", fortified: 0, tyrannical: 0 },
        { id: 12837, name: "Spires of Ascension", fortified: 0, tyrannical: 0 },
        { id: 12841, name: "Theater of Pain", fortified: 0, tyrannical: 0 },
        
        { id: 1000001, name: "Tazavesh: So'leah's Gambit", fortified: 0, tyrannical: 0  },
        { id: 1000000, name: "Tazavesh: Streets of Wonder", fortified: 0, tyrannical: 0  },
  
        { id: 6984, name: "Grimrail Depot", fortified: 0, tyrannical: 0  },
        { id: 6951, name: "Iron Docks", fortified: 0, tyrannical: 0  },
        { id: 800001, name: "Mechagon Junkyard", fortified: 0, tyrannical: 0  },
        { id: 800002, name: "Mechagon Workshop", fortified: 0, tyrannical: 0  },
        { id: 999998, name: "Return to Karazhan: Lower", fortified: 0, tyrannical: 0  },
        { id: 999999, name: "Return to Karazhan: Upper", fortified: 0, tyrannical: 0  },
        */

        { id: 14032, name: "Algeth'ar Academy", fortified: 0, tyrannical: 0  },
        { id: 13954, name: "The Azure Vault", fortified: 0, tyrannical: 0  },
        { id: 8079, name: "Court of Stars", fortified: 0, tyrannical: 0  },
        { id: 7672, name: "Halls of Valor", fortified: 0, tyrannical: 0  },
        { id: 13982, name: "The Nokhud Offensive", fortified: 0, tyrannical: 0  },
        { id: 14063, name: "Ruby Life Pools", fortified: 0, tyrannical: 0  },
        { id: 6932, name: "Shadowmoon Burial Grounds", fortified: 0, tyrannical: 0  },
        { id: 5965, name: "Temple of the Jade Serpent", fortified: 0, tyrannical: 0  },
      ]
    }

    result.scores.forEach(dungeon => {
      dungeon.score = function () {
        if (this.fortified > this.tyrannical) {
          return (this.fortified * 1.5) + (this.tyrannical * 0.5)
        } else {
          return (this.tyrannical * 1.5) + (this.fortified * 0.5)
        }
      }
    })

    result.score = function () {
      var result = 0
      this.scores.forEach(dungeon => {
        result += dungeon.score()
      })

      return result.toFixed(1)
    }

    character.mythic_plus_best_runs.forEach(run => {
      var score = run.score
      var dungeon = run.zone_id
      var affix = run.affixes[0].id

      if (affix === 9) {
        result.scores.find(e => e.id === dungeon).tyrannical = score
      } else {
        result.scores.find(e => e.id === dungeon).fortified = score
      }

    })

    character.mythic_plus_alternate_runs.forEach(run => {
      var score = run.score
      var dungeon = run.zone_id
      var affix = run.affixes[0].id

      if (affix === 9) {
        result.scores.find(e => e.id === dungeon).tyrannical = score
      } else {
        result.scores.find(e => e.id === dungeon).fortified = score
      }

    })


    return result
  }
}