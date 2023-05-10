<template>
  <div class="group">
    <div class="control-area">
      <div class="load-raid">
        <input type="range" name="range" min="6" max="30" step="1" class="key-range" v-model="max" @change="updateRange()" />
        {{ max - 4 }} to {{ max }}
      </div>
      <div class="spacer">&nbsp;</div>
      <div class="character-input">
        <input type="text" placeholder="character" v-model="character" />
      </div>
      <div class="realm-input">
        <input type="text" placeholder="realm" v-model="realm" />
      </div>
      <div class="load-button">
        <button @click="addCharacter()">Load Character</button>
      </div>
    </div>
    <div class="character-scores" v-if="loaded">
      <h2><span :class="currentCharacter.className">{{ currentCharacter.name }}</span> <span class="score">( <span class="score-value">{{ currentCharacter.dungeons.score() }}</span> )</span></h2>
      <h3>{{ currentCharacter.realm }}</h3>
      <table>
        <thead class="head-key">
          <tr>
            <th style="border-right: 1px solid #555;"></th>
            <th v-for="item in range" v-bind:key="item" colspan="2" style="border-right: 1px solid #555;">{{ item }}</th>
          </tr>
        </thead>
        <thead class="head-affix">
          <tr>
            <th style="border-right: 1px solid #555;"></th>
            <template v-for="item in range" v-bind:key="item">
              <th>fortified</th>
              <th>tyrannical</th>
            </template>
          </tr>
        </thead>
        <tbody v-for="dungeon in dungeons" v-bind:key="dungeon.id">
          <tr>
            <td class="dungeon-name" style="border-right: 1px solid #555;">{{ dungeon.name }}</td>
            <template v-for="item in range" v-bind:key="item">
              <td :class="getPercentile(updatedScoreFortified(dungeon.id, item))" style="background-color: #222; font-weight: bold">{{ updatedScoreFortified(dungeon.id, item) }}</td>
              <td :class="getPercentile(updatedScoreTyrannical(dungeon.id, item))" style="background-color: #222; font-weight: bold; border-right: 1px solid #555;">{{ updatedScoreTyrannical(dungeon.id, item) }}</td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import store from "../data/store";
import { mapState } from "vuex";

export default {
  name: "DungeonScores",
  computed: mapState([
    "characters",
    "dungeons",
    "minTargetKeyLevel",
    "maxTargetKeyLevel",
    "range",
    "currentCharacter",
    "loaded",
  ]),
  store,
  data: function () {
    return {
      character: "",
      realm: "",
      min: 15,
      max: 19,
      minScore: 0,
      maxScore: 29
    };
  },
  methods: {
    addCharacter: function () {
      this.$store.dispatch("loadCharacter", {
        character: this.character,
        realm: this.realm
      });

      this.character = "";
      this.realm = "";
    },

    handleRemoveCharacter: function (character) {
      this.$store.commit("removeCharacter", character);
      this.$store.commit("calculateStatistics");
    },
    updateRange: function() {
      this.min = parseInt(this.max - 4)
      this.$store.dispatch("updateRange", { min: parseInt(this.min), max: parseInt(this.max) })
    },

    getPercentile: function(value) {
      var percentile = Math.floor(value * (100 / this.maxScore))
      percentile = Math.min(percentile, 100)
      return "percent-" + percentile
    },

    updatedScoreFortified: function (dungeonId, keyLevel) {
      var keyScores = this.keyScores(keyLevel)
      var bonusScore = keyScores.baseScore + keyScores.bonus

      var currentDungeon = this.currentCharacter.dungeons.scores.find(d => d.id === dungeonId)
      var currentFortified = currentDungeon.fortified
      var currentTyrannical = currentDungeon.tyrannical

      if (currentFortified >= bonusScore) return '--'
      
      if (bonusScore > currentTyrannical) {
        
        return (((bonusScore * 1.5 ) + (currentTyrannical * 0.5)) - currentDungeon.score()).toFixed(2)
      } else {
        return (((currentTyrannical * 1.5 ) + (bonusScore * 0.5)) - currentDungeon.score()).toFixed(2)
      }
    },

    updatedScoreTyrannical: function (dungeonId, keyLevel) {
      var keyScores = this.keyScores(keyLevel)
      var bonusScore = keyScores.baseScore + keyScores.bonus

      var currentDungeon = this.currentCharacter.dungeons.scores.find(d => d.id === dungeonId)
      var currentFortified = currentDungeon.fortified
      var currentTyrannical = currentDungeon.tyrannical

      if (currentTyrannical >= bonusScore) return '--'
      
      if (bonusScore > currentFortified) {
        return (((bonusScore * 1.5 ) + (currentFortified * 0.5)) - currentDungeon.score()).toFixed(2)
      } else {
        return (((currentFortified * 1.5 ) + (bonusScore * 0.5)) - currentDungeon.score()).toFixed(2)
      }
    },

    keyScores: function (keyLevel) {
      var baseScores = [
        { keyLevel: 2, baseScore: 40, bonus: 0 },
        { keyLevel: 3, baseScore: 45, bonus: 0 },
        { keyLevel: 4, baseScore: 50, bonus: 0 },
        { keyLevel: 5, baseScore: 55, bonus: 0 },
        { keyLevel: 6, baseScore: 60, bonus: 0 },
        { keyLevel: 7, baseScore: 75, bonus: 0 },
        { keyLevel: 8, baseScore: 80, bonus: 0 },
        { keyLevel: 9, baseScore: 85, bonus: 0 },
        { keyLevel: 10, baseScore: 90, bonus: 0 },
        { keyLevel: 11, baseScore: 95, bonus: 2 },
        { keyLevel: 12, baseScore: 100, bonus: 4 },
        { keyLevel: 13, baseScore: 105, bonus: 6 },
        { keyLevel: 14, baseScore: 120, bonus: 8 },
        { keyLevel: 15, baseScore: 125, bonus: 10 },
        { keyLevel: 16, baseScore: 130, bonus: 12 },
        { keyLevel: 17, baseScore: 135, bonus: 14 },
        { keyLevel: 18, baseScore: 140, bonus: 16 },
        { keyLevel: 19, baseScore: 145, bonus: 18 },
        { keyLevel: 20, baseScore: 150, bonus: 20 },
        { keyLevel: 21, baseScore: 155, bonus: 22 },
        { keyLevel: 22, baseScore: 160, bonus: 24 },
        { keyLevel: 23, baseScore: 165, bonus: 26 },
        { keyLevel: 24, baseScore: 170, bonus: 28 },
        { keyLevel: 25, baseScore: 175, bonus: 30 },
        { keyLevel: 26, baseScore: 180, bonus: 32 },
        { keyLevel: 27, baseScore: 185, bonus: 34 },
        { keyLevel: 28, baseScore: 190, bonus: 36 },
        { keyLevel: 29, baseScore: 195, bonus: 38 },
        { keyLevel: 30, baseScore: 200, bonus: 40 }
      ];

      return baseScores.find(s => s.keyLevel === keyLevel)
    },
  },
  mounted: function () {
    //this.$store.dispatch("loadData");
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.control-area {
  display: grid;
  grid-template-areas: "raid spacer character realm search";
  grid-template-columns: 2fr 0.2fr 0.8fr 0.8fr 0.7fr;
  height: 30px;
  padding: 10px;
  border: 1px solid #333;
  margin-bottom: 20px;
}

.load-raid {
  grid-area: raid;
  min-width: 190px;
  text-align: left;
}
.spacer {
  grid-area: spacer;
}
.character-input {
  grid-area: character;
  margin-top: 4px;
  text-align: left;
}
.realm-input {
  grid-area: realm;
  margin-top: 4px;
  text-align: left;
}
.load-button {
  grid-area: search;
  min-width: 160px;
  text-align: left;
}
.range-input {
  width: 40px;
}
.head-key {
  background-color: #222;
}
.head-affix {
  background-color: #999;
  color: #111;
}
.dungeon-name {
  text-align: left;
}
h2 {
  text-align: left;
  font-size: 2.8em;
  font-weight: normal;
}
h2 .score {
  font-size: .6em;
  vertical-align: middle;
}
h2 .score .score-value {
  color: #909;
}
h3 {
  text-align: left;
  font-style: italic;
  font-weight: normal;
  margin-top: -14px;
  margin-bottom: 10px;
  margin-left: 20px;
  font-size: 1.2em;
}
table {
  border-collapse: collapse;
  font-size: 1em;
}
th {
  padding: 2px 10px;
}
td, th {
  margin: 0;

}
td {
    padding: 10px 10px;
}
tbody {
  border-bottom: 1px solid #444;
}


input[type=range] {
  -webkit-appearance: none;
  margin-top: 8px;
  width: 300px;
  background-color: transparent;
}
input[type=range]:focus {
  outline: none;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  animate: 0.2s;
  box-shadow: 1px 1px 1px #000000;
  background: #9482C9;
  border-radius: 0px;
  border: 0px solid #010101;
}
input[type=range]::-webkit-slider-thumb {
  box-shadow: 1px 1px 1px #000031;
  border: 1px solid #00001E;
  height: 26px;
  width: 26px;
  border-radius: 15px;
  background: #FFFFFF;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -11px;
}
input[type=range]:focus::-webkit-slider-runnable-track {
  background: #9482C9;
}
input[type=range]::-moz-range-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  animate: 0.2s;
  box-shadow: 1px 1px 1px #000000;
  background: #9482C9;
  border-radius: 0px;
  border: 0px solid #010101;
}
input[type=range]::-moz-range-thumb {
  box-shadow: 1px 1px 1px #000031;
  border: 1px solid #00001E;
  height: 26px;
  width: 26px;
  border-radius: 15px;
  background: #FFFFFF;
  cursor: pointer;
}
input[type=range]::-ms-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  animate: 0.2s;
  background: transparent;
  border-color: transparent;
  color: transparent;
}
input[type=range]::-ms-fill-lower {
  background: #9482C9;
  border: 0px solid #010101;
  border-radius: 0px;
  box-shadow: 1px 1px 1px #000000;
}
input[type=range]::-ms-fill-upper {
  background: #9482C9;
  border: 0px solid #010101;
  border-radius: 0px;
  box-shadow: 1px 1px 1px #000000;
}
input[type=range]::-ms-thumb {
  margin-top: 1px;
  box-shadow: 1px 1px 1px #000031;
  border: 1px solid #00001E;
  height: 26px;
  width: 26px;
  border-radius: 15px;
  background: #FFFFFF;
  cursor: pointer;
}
input[type=range]:focus::-ms-fill-lower {
  background: #9482C9;
}
input[type=range]:focus::-ms-fill-upper {
  background: #9482C9;
}



.percent-0 { color: rgba(255,63,0,1); }
.percent-1 { color: rgba(252,65,0,1); }
.percent-2 { color: rgba(250,67,0,1); }
.percent-3 { color: rgba(247,69,0,1); }
.percent-4 { color: rgba(245,71,0,1); }
.percent-5 { color: rgba(242,73,0,1); }
.percent-6 { color: rgba(240,75,0,1); }
.percent-7 { color: rgba(237,76,0,1); }
.percent-8 { color: rgba(235,78,0,1); }
.percent-9 { color: rgba(232,80,0,1); }
.percent-10 { color: rgba(230,82,0,1); }
.percent-11 { color: rgba(227,84,0,1); }
.percent-12 { color: rgba(224,86,0,1); }
.percent-13 { color: rgba(222,88,0,1); }
.percent-14 { color: rgba(219,90,0,1); }
.percent-15 { color: rgba(217,92,0,1); }
.percent-16 { color: rgba(214,94,0,1); }
.percent-17 { color: rgba(212,96,0,1); }
.percent-18 { color: rgba(209,98,0,1); }
.percent-19 { color: rgba(207,99,0,1); }
.percent-20 { color: rgba(204,101,0,1); }
.percent-21 { color: rgba(201,103,0,1); }
.percent-22 { color: rgba(199,105,0,1); }
.percent-23 { color: rgba(196,107,0,1); }
.percent-24 { color: rgba(194,109,0,1); }
.percent-25 { color: rgba(191,111,0,1); }
.percent-26 { color: rgba(189,113,0,1); }
.percent-27 { color: rgba(186,115,0,1); }
.percent-28 { color: rgba(184,117,0,1); }
.percent-29 { color: rgba(181,119,0,1); }
.percent-30 { color: rgba(179,121,0,1); }
.percent-31 { color: rgba(176,123,0,1); }
.percent-32 { color: rgba(173,124,0,1); }
.percent-33 { color: rgba(171,126,0,1); }
.percent-34 { color: rgba(168,128,0,1); }
.percent-35 { color: rgba(166,130,0,1); }
.percent-36 { color: rgba(163,132,0,1); }
.percent-37 { color: rgba(161,134,0,1); }
.percent-38 { color: rgba(158,136,0,1); }
.percent-39 { color: rgba(156,138,0,1); }
.percent-40 { color: rgba(153,140,0,1); }
.percent-41 { color: rgba(150,142,0,1); }
.percent-42 { color: rgba(148,144,0,1); }
.percent-43 { color: rgba(145,146,0,1); }
.percent-44 { color: rgba(143,147,0,1); }
.percent-45 { color: rgba(140,149,0,1); }
.percent-46 { color: rgba(138,151,0,1); }
.percent-47 { color: rgba(135,153,0,1); }
.percent-48 { color: rgba(133,155,0,1); }
.percent-49 { color: rgba(130,157,0,1); }
.percent-50 { color: rgba(128,159,0,1); }
.percent-51 { color: rgba(125,161,0,1); }
.percent-52 { color: rgba(122,163,0,1); }
.percent-53 { color: rgba(120,165,0,1); }
.percent-54 { color: rgba(117,167,0,1); }
.percent-55 { color: rgba(115,169,0,1); }
.percent-56 { color: rgba(112,171,0,1); }
.percent-57 { color: rgba(110,172,0,1); }
.percent-58 { color: rgba(107,174,0,1); }
.percent-59 { color: rgba(105,176,0,1); }
.percent-60 { color: rgba(102,178,0,1); }
.percent-61 { color: rgba(99,180,0,1); }
.percent-62 { color: rgba(97,182,0,1); }
.percent-63 { color: rgba(94,184,0,1); }
.percent-64 { color: rgba(92,186,0,1); }
.percent-65 { color: rgba(89,188,0,1); }
.percent-66 { color: rgba(87,190,0,1); }
.percent-67 { color: rgba(84,192,0,1); }
.percent-68 { color: rgba(82,194,0,1); }
.percent-69 { color: rgba(79,195,0,1); }
.percent-70 { color: rgba(77,197,0,1); }
.percent-71 { color: rgba(74,199,0,1); }
.percent-72 { color: rgba(71,201,0,1); }
.percent-73 { color: rgba(69,203,0,1); }
.percent-74 { color: rgba(66,205,0,1); }
.percent-75 { color: rgba(64,207,0,1); }
.percent-76 { color: rgba(61,209,0,1); }
.percent-77 { color: rgba(59,211,0,1); }
.percent-78 { color: rgba(56,213,0,1); }
.percent-79 { color: rgba(54,215,0,1); }
.percent-80 { color: rgba(51,217,0,1); }
.percent-81 { color: rgba(48,219,0,1); }
.percent-82 { color: rgba(46,220,0,1); }
.percent-83 { color: rgba(43,222,0,1); }
.percent-84 { color: rgba(41,224,0,1); }
.percent-85 { color: rgba(38,226,0,1); }
.percent-86 { color: rgba(36,228,0,1); }
.percent-87 { color: rgba(33,230,0,1); }
.percent-88 { color: rgba(31,232,0,1); }
.percent-89 { color: rgba(28,234,0,1); }
.percent-90 { color: rgba(26,236,0,1); }
.percent-91 { color: rgba(23,238,0,1); }
.percent-92 { color: rgba(20,240,0,1); }
.percent-93 { color: rgba(18,242,0,1); }
.percent-94 { color: rgba(15,243,0,1); }
.percent-95 { color: rgba(13,245,0,1); }
.percent-96 { color: rgba(10,247,0,1); }
.percent-97 { color: rgba(8,249,0,1); }
.percent-98 { color: rgba(5,251,0,1); }
.percent-99 { color: rgba(3,253,0,1); }
.percent-100 { color: rgba(0,255,0,1); }





/*
.percent-100 { background-color: rgba(0,100,0,1); }
.percent-99 { background-color: rgba(2,102,2,1); }
.percent-98 { background-color: rgba(4,103,4,1); }
.percent-97 { background-color: rgba(6,105,6,1); }
.percent-96 { background-color: rgba(8,106,8,1); }
.percent-95 { background-color: rgba(10,108,10,1); }
.percent-94 { background-color: rgba(12,109,12,1); }
.percent-93 { background-color: rgba(14,111,14,1); }
.percent-92 { background-color: rgba(16,112,16,1); }
.percent-91 { background-color: rgba(18,114,18,1); }
.percent-90 { background-color: rgba(20,116,20,1); }
.percent-89 { background-color: rgba(22,117,22,1); }
.percent-88 { background-color: rgba(24,119,24,1); }
.percent-87 { background-color: rgba(25,120,25,1); }
.percent-86 { background-color: rgba(27,122,27,1); }
.percent-85 { background-color: rgba(29,123,29,1); }
.percent-84 { background-color: rgba(31,125,31,1); }
.percent-83 { background-color: rgba(33,126,33,1); }
.percent-82 { background-color: rgba(35,128,35,1); }
.percent-81 { background-color: rgba(37,129,37,1); }
.percent-80 { background-color: rgba(39,131,39,1); }
.percent-79 { background-color: rgba(41,133,41,1); }
.percent-78 { background-color: rgba(43,134,43,1); }
.percent-77 { background-color: rgba(45,136,45,1); }
.percent-76 { background-color: rgba(47,137,47,1); }
.percent-75 { background-color: rgba(49,139,49,1); }
.percent-74 { background-color: rgba(51,140,51,1); }
.percent-73 { background-color: rgba(53,142,53,1); }
.percent-72 { background-color: rgba(55,143,55,1); }
.percent-71 { background-color: rgba(57,145,57,1); }
.percent-70 { background-color: rgba(59,147,59,1); }
.percent-69 { background-color: rgba(61,148,61,1); }
.percent-68 { background-color: rgba(63,150,63,1); }
.percent-67 { background-color: rgba(65,151,65,1); }
.percent-66 { background-color: rgba(67,153,67,1); }
.percent-65 { background-color: rgba(69,154,69,1); }
.percent-64 { background-color: rgba(71,156,71,1); }
.percent-63 { background-color: rgba(73,157,73,1); }
.percent-62 { background-color: rgba(74,159,74,1); }
.percent-61 { background-color: rgba(76,160,76,1); }
.percent-60 { background-color: rgba(78,162,78,1); }
.percent-59 { background-color: rgba(80,164,80,1); }
.percent-58 { background-color: rgba(82,165,82,1); }
.percent-57 { background-color: rgba(84,167,84,1); }
.percent-56 { background-color: rgba(86,168,86,1); }
.percent-55 { background-color: rgba(88,170,88,1); }
.percent-54 { background-color: rgba(90,171,90,1); }
.percent-53 { background-color: rgba(92,173,92,1); }
.percent-52 { background-color: rgba(94,174,94,1); }
.percent-51 { background-color: rgba(96,176,96,1); }
.percent-50 { background-color: rgba(98,178,98,1); }
.percent-49 { background-color: rgba(100,179,100,1); }
.percent-48 { background-color: rgba(102,181,102,1); }
.percent-47 { background-color: rgba(104,182,104,1); }
.percent-46 { background-color: rgba(106,184,106,1); }
.percent-45 { background-color: rgba(108,185,108,1); }
.percent-44 { background-color: rgba(110,187,110,1); }
.percent-43 { background-color: rgba(112,188,112,1); }
.percent-42 { background-color: rgba(114,190,114,1); }
.percent-41 { background-color: rgba(116,191,116,1); }
.percent-40 { background-color: rgba(118,193,118,1); }
.percent-39 { background-color: rgba(120,195,120,1); }
.percent-38 { background-color: rgba(122,196,122,1); }
.percent-37 { background-color: rgba(123,198,123,1); }
.percent-36 { background-color: rgba(125,199,125,1); }
.percent-35 { background-color: rgba(127,201,127,1); }
.percent-34 { background-color: rgba(129,202,129,1); }
.percent-33 { background-color: rgba(131,204,131,1); }
.percent-32 { background-color: rgba(133,205,133,1); }
.percent-31 { background-color: rgba(135,207,135,1); }
.percent-30 { background-color: rgba(137,209,137,1); }
.percent-29 { background-color: rgba(139,210,139,1); }
.percent-28 { background-color: rgba(141,212,141,1); }
.percent-27 { background-color: rgba(143,213,143,1); }
.percent-26 { background-color: rgba(145,215,145,1); }
.percent-25 { background-color: rgba(147,216,147,1); }
.percent-24 { background-color: rgba(149,218,149,1); }
.percent-23 { background-color: rgba(151,219,151,1); }
.percent-22 { background-color: rgba(153,221,153,1); }
.percent-21 { background-color: rgba(155,222,155,1); }
.percent-20 { background-color: rgba(157,224,157,1); }
.percent-19 { background-color: rgba(159,226,159,1); }
.percent-18 { background-color: rgba(161,227,161,1); }
.percent-17 { background-color: rgba(163,229,163,1); }
.percent-16 { background-color: rgba(165,230,165,1); }
.percent-15 { background-color: rgba(167,232,167,1); }
.percent-14 { background-color: rgba(169,233,169,1); }
.percent-13 { background-color: rgba(171,235,171,1); }
.percent-12 { background-color: rgba(172,236,172,1); }
.percent-11 { background-color: rgba(174,238,174,1); }
.percent-10 { background-color: rgba(176,240,176,1); }
.percent-9 { background-color: rgba(178,241,178,1); }
.percent-8 { background-color: rgba(180,243,180,1); }
.percent-7 { background-color: rgba(182,244,182,1); }
.percent-6 { background-color: rgba(184,246,184,1); }
.percent-5 { background-color: rgba(186,247,186,1); }
.percent-4 { background-color: rgba(188,249,188,1); }
.percent-3 { background-color: rgba(190,250,190,1); }
.percent-2 { background-color: rgba(192,252,192,1); }
.percent-1 { background-color: rgba(194,253,194,1); }
.percent-0 { background-color: rgba(196,255,196,1); }
*/


</style>
