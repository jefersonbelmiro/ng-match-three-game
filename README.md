# NgMatchThreeGame

### [Play the game](https://jefersonbelmiro.github.io/ng-match-three-game/)

### TODO
- [ ] update angular(current v9), try HMR)
- [ ] deploy in firebase
- [ ] level editor(admin)
- [ ] level sync(client)
- [ ] create progressively challenging levels
- [ ] rank
- [ ] detect user anonymously and late converte to auth provider(google, github, facebook...)
- [ ] multiplayer
- [ ] gifs in README

---

### CURRENT
 - hosted in github pages
 - 5 basic levels
 - firebase configured(apikey)
 - [app-shell](https://angular.io/guide/app-shell)
 - lazy loading first route (play module)

#### Routes
 - `/` MenuComponent: just a screen with play button
 - `/play` PlayComponent: play the game, where the magic happens
 - `/level` LevelComponent: switching levels


### Containers

##### LevelComponent
 - create current level and redirect to `/play`
 
> currently has only 5 pre-defined levels 
 
##### PlayComponent
 - create components
   - level-status: display current level status(score, goals, moves)
   - board: where game logic runs
   - power-ups: 5 different power ups(destory tiles: vertical, horizontal, by type, and single)
   - level-end: show when levels complete, diplay player performs and actions to foward or replay)
   - background: it is currently just a color, but it was created to have animations
   
- detect screen size and watch window size changes
- get level data from state service
- create board
- handles:
  - onSelect: when user select tile in board
  - onSwap: swap tiles positions(revert if is invalid move)
  - processMatches: remove matches, update level(score, moves and goals), create new tiles to pop

##### Services
 - BoardService: tile handler, getAt, setAt, createAt, removeAt
 - MatchService: match3 game logic, find matches 
 - StateService: single source of truth  
   ```
    scene: 'menu' | 'level' | 'play';
    busy: number;
    selected?: Tile;
    selectedPowerUp?: PowerUp;
    powerUps?: PowerUp[];
    level?: Level;
   ```
 - LevelService: create level from list of levels(`LEVEL_DATA`)
 - SpriteService: create and destroy components programmatically, with pool system
 - PowerUpService: create power ups
