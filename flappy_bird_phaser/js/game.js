
const configurations = {
    type: Phaser.AUTO,
    width: 288,
    height: 512,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 300
            },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

const game = new Phaser.Game(configurations)

let gameOver
let gameStarted
let upButton
let restartButton
let gameOverBanner
let messageInitial
let player
let framesMoveUp
let backgroundDay
let ground
let pipesGroup
let gapsGroup
let nextPipes
let scoreboardGroup
let score

function preload() {
    // Backgrounds and ground
    this.load.image('background', 'assets/background-day.png')

    this.load.spritesheet('ground', 'assets/ground-sprite.png', {
        frameWidth: 336,
        frameHeight: 112
    })

    // Pipes
    this.load.image('pipe_top', 'assets/pipe-green-top.png')
    this.load.image('pipe_bottom', 'assets/pipe-green-bottom.png')

    // Start game
    this.load.image('messageInitial', 'assets/message-initial.png')

    // End game
    this.load.image('gameOver', 'assets/gameover.png')
    this.load.image('restart', 'assets/restart-button.png')

    // Birds
    this.load.spritesheet('bird', 'assets/bird-red-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    })

    // Numbers
    this.load.image('number0', 'assets/number0.png')
    this.load.image('number1', 'assets/number1.png')
    this.load.image('number2', 'assets/number2.png')
    this.load.image('number3', 'assets/number3.png')
    this.load.image('number4', 'assets/number4.png')
    this.load.image('number5', 'assets/number5.png')
    this.load.image('number6', 'assets/number6.png')
    this.load.image('number7', 'assets/number7.png')
    this.load.image('number8', 'assets/number8.png')
    this.load.image('number9', 'assets/number9.png')
}


function create() {
    backgroundDay = this.add.image(144, 256, 'background').setInteractive()
    backgroundDay.on('pointerdown', moveBird)


    gapsGroup = this.physics.add.group()
    pipesGroup = this.physics.add.group()
    scoreboardGroup = this.physics.add.staticGroup()

    ground = this.physics.add.sprite(144, 458, 'ground')
    ground.setCollideWorldBounds(true)
    ground.setDepth(10)

    messageInitial = this.add.image(144, 156, 'messageInitial')
    messageInitial.setDepth(30)
    messageInitial.visible = false

    upButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)


    this.anims.create({
        key: 'moving-ground',
        frames: this.anims.generateFrameNumbers('ground', {
            start: 0,
            end: 2
        }),
        frameRate: 15,
        repeat: -1
    })
    this.anims.create({
        key: 'stop-ground',
        frames: [{
            key: 'ground',
            frame: 0
        }],
        frameRate: 20
    })

    this.anims.create({
        key: 'clap_wings',
        frames: this.anims.generateFrameNumbers('bird', {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: 'stop',
        frames: [{
            key: 'bird',
            frame: 1
        }],
        frameRate: 20
    })

    prepareGame(this)

    gameOverBanner = this.add.image(144, 206, 'gameOver')
    gameOverBanner.setDepth(20)
    gameOverBanner.visible = false

    restartButton = this.add.image(144, 300, 'restart').setInteractive()
    restartButton.on('pointerdown', restartGame)
    restartButton.setDepth(20)
    restartButton.visible = false
}


function update() {
    if (gameOver || !gameStarted)
        return

    if (framesMoveUp > 0)
        framesMoveUp--
    else if (Phaser.Input.Keyboard.JustDown(upButton))
        moveBird()
    else {
        player.setVelocityY(120)

        if (player.angle < 90)
            player.angle += 1
    }

    pipesGroup.children.iterate(function (child) {
        if (child == undefined)
            return

        if (child.x < -50)
            child.destroy()
        else
            child.setVelocityX(-100)
    })

    gapsGroup.children.iterate(function (child) {
        child.body.setVelocityX(-100)
    })

    nextPipes++
    if (nextPipes === 130) {
        makePipes(game.scene.scenes[0])
        nextPipes = 0
    }
}


function hitBird(player) {
    this.physics.pause()

    gameOver = true
    gameStarted = false

    player.anims.play('stop')
    ground.anims.play('stop-ground')

    gameOverBanner.visible = true
    restartButton.visible = true
}


function updateScore(_, gap) {
    score++
    gap.destroy()

    updateScoreboard()
}


function makePipes(scene) {
    if (!gameStarted || gameOver) return

    const pipeTopY = Phaser.Math.Between(-120, 120)

    const gap = scene.add.line(288, pipeTopY + 210, 0, 0, 0, 98)
    gapsGroup.add(gap)
    gap.body.allowGravity = false
    gap.visible = false

    const pipeTop = pipesGroup.create(288, pipeTopY, 'pipe_top')
    pipeTop.body.allowGravity = false

    const pipeBottom = pipesGroup.create(288, pipeTopY + 420, 'pipe_bottom')
    pipeBottom.body.allowGravity = false
}


function moveBird() {
    if (gameOver)
        return

    if (!gameStarted)
        startGame(game.scene.scenes[0])

    player.setVelocityY(-700)
    player.angle = -15
    framesMoveUp = 5
}

function updateScoreboard() {
    scoreboardGroup.clear(true, true)

    const scoreAsString = score.toString()
    if (scoreAsString.length == 1)
        scoreboardGroup.create(144, 30, 'number' + score).setDepth(10)
    else {
        let initialPosition = 144 - ((score.toString().length * 25) / 2)

        for (let i = 0; i < scoreAsString.length; i++) {
            scoreboardGroup.create(initialPosition, 30, 'number' + scoreAsString[i]).setDepth(10)
            initialPosition += 25
        }
    }
}


function restartGame() {
    pipesGroup.clear(true, true)
    pipesGroup.clear(true, true)
    gapsGroup.clear(true, true)
    scoreboardGroup.clear(true, true)
    player.destroy()
    gameOverBanner.visible = false
    restartButton.visible = false

    const gameScene = game.scene.scenes[0]
    prepareGame(gameScene)

    gameScene.physics.resume()
}

function prepareGame(scene) {
    framesMoveUp = 0
    nextPipes = 0
  
    score = 0
    gameOver = false
    backgroundDay.visible = true

    messageInitial.visible = true


    player = scene.physics.add.sprite(60, 265, 'bird')
    player.setCollideWorldBounds(true)
    player.anims.play('clap_wings', true)
    player.body.allowGravity = false

    scene.physics.add.collider(player, ground, hitBird, null, scene)
    scene.physics.add.collider(player, pipesGroup, hitBird, null, scene)

    scene.physics.add.overlap(player, gapsGroup, updateScore, null, scene)

    ground.anims.play('moving-ground', true)
}


function startGame(scene) {
    gameStarted = true
    messageInitial.visible = false

    const score0 = scoreboardGroup.create(144, 30, 'number0')
    score0.setDepth(20)

    makePipes(scene)
}