<template>
  <div id="app">
    <DungeonScores />
  </div>
</template>

<script>
import DungeonScores from './components/DungeonScores.vue'

export default {
  name: 'App',
  components: {
    DungeonScores
  }
}
</script>

<style>
#app {
  /*font-family: 'Avenir', Helvetica, Arial, sans-serif;*/
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ddd;
}
button {
  padding: 6px 20px;
  border-radius: 5px;
  font-size: 16px;
  border: 1px solid #111;
  background-color: #333;
  color: #eee;
  cursor: pointer;
}
a:link,
a:visited,
a:hover {
  text-decoration: none;
  color: inherit;
}
button:hover {
  color: #eee;
  background-color: #039;
}
.column-name {
  width: auto;
  text-align: left;
  padding: 0 5px;
  border-left: none;
  border-right: none;
}
.pull-right {
  float: right;
}

button.remove-toon {
  border: 0;
  margin: 5px -2px 0 0;
  padding: 0;
  background-color: transparent;
  color: #333;
}
button.remove-toon :hover {
  color: #900;
}

.row {
  width: 980px;
  margin: 0 auto;
  padding: 0 20px;
}
.grid-body .grid-item:hover {
  background: #444 !important;
  color: #999 !important;
}
input {
  padding: 5px 10px;
  border-radius: 6px;
  margin-right: 10px;
  background: #ccc;
  border: #555;
}
.spinner {
  font-size: 36px;
  position: fixed;
  height: 100%;
  background: #606060;
}


.waiting-panel {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
}

.waiting-spinner {
  display: block;
  margin: 0 auto;
  text-align: center;
  margin-top: 300px;
}
</style>
