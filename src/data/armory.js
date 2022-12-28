import axios from '../../node_modules/axios'
import config from './config'


export default {
  apiRoot: config.apiRoot,

  pingHeartbeat() {
    return "ba-dum"//axios.get(this.apiRoot + `/api/characters/heartbeat`)
  },

  getCharacterCharacterScores(name, realm) {
    return axios.get(this.apiRoot + `/api/charactermythicdungeons/${realm}/${name}`)
  }
  
}
