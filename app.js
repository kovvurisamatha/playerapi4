const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

let db = null
const dbPath = path.join(__dirname, 'cricketTeam.db')
const initilizeAndStartServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`db error:${e.message}`)
    process.exit(1)
  }
}
initilizeAndStartServer()

//api1
const convertdbtoobject = dbobject => {
  return {
    playerId: dbobject.player_id,
    playerName: dbobject.player_name,
    jerseyNumber: dbobject.jersey_number,
    role: dbobject.role,
  }
}
app.get('/players/', async (request, response) => {
  let playersquery = `select * from cricket_team`
  let players = await db.all(playersquery)
  response.send(players.map(eachplayer => convertdbtoobject(eachplayer)))
})
//api2
app.post('/players/', async (request, response) => {
  const player_details = request.body
  const {playerName, jerseyNumber, role} = player_details
  const addplayerQuery = `insert into cricket_team
  (player_name,jersey_number,role) 
  values('${playerName}',${jerseyNumber},'${role}')`
  const dbresponse = await db.run(addplayerQuery)
  const playerId = dbresponse.lastId
  response.send('Player Added to Team')
})
//api3
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getplayerquery = `select * from cricket_team
  where player_id=${playerId}`
  const player = await db.get(getplayerquery)
  response.send(convertdbtoobject(player))
})
//api4
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const player_details = request.body
  const {playerName, jerseyNumber, role} = player_details
  const updateplayerquery = `update cricket_team set 
  player_name='${playerName}',jersey_number=${jerseyNumber},
  role='${role}' where player_id=${playerId}`
  await db.run(updateplayerquery)
  response.send('Player Details Updated')
})

module.exports = app
