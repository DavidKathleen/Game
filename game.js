window.addEventListener("load", () => {
  const startButton = document.getElementById("start-button");
  const startOverlay = document.getElementById("start-overlay");
  const gameContainer = document.getElementById("game-container");


const menuMusic = new Audio("bgmusic.mp3"); 
menuMusic.loop = true;
menuMusic.volume = 0.4; 


  startButton.addEventListener("click", () => {
    startOverlay.style.display = "none";
    gameContainer.style.display = "block";
    showIntroDialogue(); 
      menuMusic.play();

  });

  function showIntroDialogue() {
    const introPopup = document.createElement("div");
    introPopup.id = "intro-popup";
    Object.assign(introPopup.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "1000",
      color: "#fff",
      fontFamily: "Press Start 2P",
      fontSize: "12px",
      textAlign: "center",
      padding: "20px",
      lineHeight: "1.8",
    });

    const textBox = document.createElement("div");
    textBox.style.maxWidth = "500px";
    textBox.style.padding = "20px";
    textBox.style.border = "2px solid #fff";
    textBox.style.borderRadius = "10px";
    textBox.style.background = "rgba(0,0,0,0.5)";

    const textElement = document.createElement("p");
    textElement.id = "intro-text";
    textElement.style.minHeight = "120px";

    const hint = document.createElement("p");
    hint.textContent = "(Press SPACE to start!)";
    hint.style.marginTop = "20px";
    hint.style.color = "#ffff88";

    textBox.appendChild(textElement);
    textBox.appendChild(hint);
    introPopup.appendChild(textBox);
    document.body.appendChild(introPopup);

    const fullText =
      "Hi, my name is Ikay!\nI'm about to collect all the letters my baby gave me. \nCan you help me find them all?";
    let index = 0;

    function typeNextChar() {
      if (index < fullText.length) {
        textElement.textContent += fullText[index];
        index++;
        setTimeout(typeNextChar, 40); 
      }
    }
    typeNextChar();

    const handleStart = (e) => {
      if (e.code === "Space") {
        introPopup.remove();
        window.removeEventListener("keydown", handleStart);
        startGame();
      }
    };

    window.addEventListener("keydown", handleStart);
  }


  function startGame() {
    menuMusic.pause();
    menuMusic.currentTime = 0;
    const TOTAL_LEVELS = 8;

    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: "game-container",
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 900 }, debug: false },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: { pixelArt: true },
      scene: createScenesArray(TOTAL_LEVELS),
    };

    new Phaser.Game(config);

    window.addEventListener("resize", () => {
      const game = Phaser.GAMES[0]; 
      if (game && game.scale) {
      game.scale.resize(window.innerWidth, window.innerHeight);

    
    const scene = game.scene.getScenes(true)[0]; 
    if (scene && scene.bg) {
      scene.bg.setDisplaySize(window.innerWidth, window.innerHeight);
    }
  }

  const controls = document.getElementById("touch-controls");
if (window.innerWidth < 700) {
  controls.style.transform = "scale(0.8) translateX(-50%)";
} else {
  controls.style.transform = "scale(1) translateX(-50%)";
}

});


    
    const gameMusic = new Audio("bgmusic.mp3");
    gameMusic.loop = true;
    gameMusic.volume = 0.5;
    gameMusic.play();

    const musicBtn = document.getElementById("music-button");
    let musicOn = true;

    musicBtn.addEventListener("click", () => {
      if (musicOn) {
      gameMusic.pause();
      musicBtn.textContent = "🔇";
    } else {
      gameMusic.play();
      musicBtn.textContent = "🎵";
    }
      musicOn = !musicOn;
    });


    function createScenesArray(total) {
      const arr = [];
      for (let i = 1; i <= total; i++) arr.push(createLevelScene(i, total));
      arr.push(createEndScene());
      return arr;
    }

    function createLevelScene(levelNumber, totalLevels) {
      return new Phaser.Class({
        Extends: Phaser.Scene,
        initialize: function SceneLevel() {
          Phaser.Scene.call(this, { key: "Level" + levelNumber });
        },

        preload: function () {
          this.load.image("background", "background.png");
          this.load.image("player", "ikay.png");
          this.load.image("cherry", "mushroom.png");
          this.load.audio("jump", "jump.mp3");
          this.load.audio("pickup", "pickup.mp3");
          this.load.audio("bgMusic", "bgmusic.mp3");

        },

        create: function () {
          const w = this.scale.width;
          const h = this.scale.height;

          this.bg = this.add.image(0, 0, "background").setOrigin(0).setDisplaySize(w, h);
          createStoneTexture(this);

        this.scale.on('resize', (gameSize) => {
        const width = gameSize.width;
        const height = gameSize.height;
        if (this.bg) this.bg.setDisplaySize(width, height);
        }, this);


          const raiseBy = window.innerHeight / 15;
          this.ground = this.physics.add.staticGroup();
          const groundSprite = this.ground.create(w / 2, h - raiseBy, "stoneTile")
            .setDisplaySize(w, 48)
            .setOrigin(0.5, 0.5);
          groundSprite.refreshBody();
          groundSprite.setVisible(false);

          const spawnX = 100;
          const spawnY = h - 180 - raiseBy;
          this.player = this.physics.add.sprite(spawnX, spawnY, "player");
          this.player.setScale(0.25);
          this.player.setCollideWorldBounds(true);
          this.player.setDepth(10);
          this.player.body.setSize(this.player.width * 0.6, this.player.height * 0.9);
          this.player.body.setOffset(this.player.width * 0.2, this.player.height * 0.05);
          this.physics.add.collider(this.player, this.ground);

          this.jumpSound = this.sound.add("jump", { volume: 0.5 });
          this.pickupSound = this.sound.add("pickup", { volume: 0.5 });

          const plats = [
            { x: w * 0.2, y: h - 220, w: 170 }, /* 2nd bricks */
            { x: w * 0.55, y: h - 400, w: 160 }, /* 4th bricks */
            { x: w * 0.3, y: h - 550, w: 160 },
            { x: w * 0.8, y: h - 320, w: 140 }, /* 6th bricks */
            { x: w * 0.45, y: h - 420, w: 120 }, /* 3rd bricks */
            { x: w * 0.1, y: h - 500, w: 160 }, /* 1st bricks */
            { x: w * 0.7, y: h - 220, w: 200 }, /* 5th bricks */
          ];

          this.platforms = [];
          plats.forEach(p => {
            const plat = createPlatform(this, p.x, p.y, p.w, 24);
            this.physics.add.collider(this.player, plat);
            this.platforms.push(plat);
          });

          this.cherries = this.physics.add.group();
          const cherryData = [
            { x: w * 0.1, y: h - 540 }, /* 1st cherry */
            { x: w * 0.2, y: h - 260 }, /* 2nd cherry */
            { x: w * 0.45, y: h - 460 }, /* 3rd cherry */
            { x: w * 0.8, y: h - 360 }, /* 8th cherry */
            { x: w * 0.55, y: h - 440 }, /* 6th cherry */
            { x: w * 0.75, y: h - 690 },
            { x: w * 0.7, y: h - 260 },
            { x: w * 0.3, y: h - 590 },
          ];

          cherryData.forEach((pos, index) => {
  const c = this.cherries.create(pos.x, pos.y, "cherry");
  c.setScale(0.15);
  c.body.allowGravity = false;

 
  this.tweens.add({
    targets: c,
    y: pos.y - 20,
    duration: 1500 + index * 200,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
  });

  
  this.tweens.add({
    targets: c,
    x: pos.x + Phaser.Math.Between(-15, 15),
    duration: 2000 + index * 100,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
  });
});


          this.collectedCount = 0;
          this.totalCherries = this.cherries.getChildren().length;

          this.physics.add.overlap(this.player, this.cherries, (player, cherry) => {
            if (!this.canCollect || this.letterShown) return;
            cherry.disableBody(true, true);
            this.collectedCount++;
            this.pickupSound.play();
            this.showLetter(this.collectedCount);
          });

          this.canCollect = false;
          this.time.delayedCall(250, () => { this.canCollect = true; });

          this.letterShown = false;
          this.levelNumber = levelNumber;
          this.totalLevels = totalLevels;

        
          this.loveMessages = [
            "Hey love, I tried something different this time hehe i made you a game. \n  \nI know i usually build websites for you, but i wanted to make something a little more fun and special. So here you are, playing something made with all my love (and a bit of my sanity while coding this, hehe).\n  \nI hope as you collect each letter, you feel just how much I adore you.",
            "Every day with you feels like a little adventure i didn’t know i needed. \n \nEven if we’re just doing nothing, it somehow turns into something special,  because you’re here, love.\n You make the boring things fun, the hard things lighter, and the quiet moments meaningful.",
            "You’ve shown me what love really means, not grand gestures, but the small, quiet things that last.\n The late night talks, the late night game, the shared laughter, the movie dates, the comfort in silence. \nYou’ve made me realize that love isn’t about perfection, it’s about presence.",
            "There are days when i don’t say it enough, thank you, love, honestly. Thank you for being patient with me, for understanding me, \n for being my umbrella on my rainy days, for drying my tears, for hugging me after we fought, and for loving me even when i fall short.\n You’re my calm in the chaos, my reason to breathe a little easier.",
            "Sometimes i look at you and think, 'How did i get so lucky?' You make my world brighter without even trying. You make my heart feel safe in a way nothing else ever has. \n  \n You are my favorite feeling, my sweetest peace.",
            "I know we’ll face hard days too, but i want you to remember this, I’ll always choose you. Through every high and low, every distance or doubt, i’ll be here, loving you the best way i can, every single day.",
            "I’m sorry if i’m a little makulit sometimes or if i make things harder for you. But please know, i’m learning.\n I’m trying to be better, not just for myself, but for you. You deserve to be loved at my best, and that’s exactly what I’m working on every day. \n  \nThank you for being patient with me, love.",
            "words aren't enough to express how grateful i am.\n  \nThank you for being the most hardworking peroson i know. You've spoiled me not just with gifts, but with consistency, effort and genuine care. You've held me through the high and lows, stood by me when i couldn't even stand on my own. You taught me how to love unconditionally, and i never thought i could love someone so deeply. You showed me just how big my heart can be.\n \n Thank you for your patience, time, effort, and understanding. I love you with all my heart."
          ];

          this.cursors = this.input.keyboard.createCursorKeys();
          this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
            R: Phaser.Input.Keyboard.KeyCodes.R
          });

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
      document.getElementById("touch-controls").style.display = "flex";

      const leftBtn = document.getElementById("btn-left");
      const rightBtn = document.getElementById("btn-right");
      const jumpBtn = document.getElementById("btn-jump");

      this.mobile = { left: false, right: false, jump: false };

      const setHold = (btn, key) => {
        btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.mobile[key] = true;
      });
        btn.addEventListener("touchend", (e) => {
        e.preventDefault();
        this.mobile[key] = false;
      });
    };

      setHold(leftBtn, "left");
      setHold(rightBtn, "right");
      setHold(jumpBtn, "jump");
    }

        },

        update: function () {
          if (!this.player) return;
          if (this.letterShown) {
            this.player.setVelocityX(0);
            return;
          }

          const speed = 200;
const jumpSpeed = -620;
const onFloor = this.player.body.blocked.down || this.player.body.touching.down;

if (this.cursors.left.isDown || this.keys.A.isDown || (this.mobile && this.mobile.left)) {
  this.player.setVelocityX(-speed);
  this.player.flipX = true;

  if (onFloor && !this.isRunning) {
    this.isRunning = true;
    this.runTween = this.tweens.add({
      targets: this.player,
      y: this.player.y - 6,
      duration: 120,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

} else if (this.cursors.right.isDown || this.keys.D.isDown || (this.mobile && this.mobile.right)) {
  this.player.setVelocityX(speed);
  this.player.flipX = false;

  if (onFloor && !this.isRunning) {
    this.isRunning = true;
    this.runTween = this.tweens.add({
      targets: this.player,
      y: this.player.y - 6,
      duration: 120,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

} else {
  this.player.setVelocityX(0);

  if (this.isRunning) {
    this.runTween.stop();
    this.isRunning = false;
    this.player.y = Math.round(this.player.y);
  }
}

if ((this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown || (this.mobile && this.mobile.jump)) && onFloor) {
  this.player.setVelocityY(jumpSpeed);
  this.jumpSound.play();

  if (this.isRunning) {
    this.runTween.stop();
    this.isRunning = false;
    this.player.y = Math.round(this.player.y);
  }
}

if (!onFloor && this.isRunning) {
  this.runTween.stop();
  this.isRunning = false;
  this.player.y = Math.round(this.player.y);
}


          if ((this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown) && onFloor) {
            this.player.setVelocityY(jumpSpeed);
            this.jumpSound.play();
          }

          if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
          this.scene.restart();
          }

          if (this.collectedCount >= this.totalCherries) {
          this.time.delayedCall(1000, () => {
          this.scene.start("GameEnd");
        });
      }
    },

        showLetter: function (cherryNumber = 1) {
        this.letterShown = true;
        this.physics.world.pause();

        const popup = document.getElementById("letter-popup");
        const popupText = document.getElementById("popup-letter-text");
        const popupClose = document.getElementById("popup-close");
        const gameContainer = document.getElementById("game-container");

  const index = Math.min(cherryNumber - 1, this.loveMessages.length - 1);
  popupText.innerText = this.loveMessages[index];

  popup.classList.remove("hidden");
  gameContainer.classList.add("blurred");

  const closePopup = () => {
    popup.classList.add("hidden");
    gameContainer.classList.remove("blurred");
    this.physics.world.resume();
    this.letterShown = false;

    popupClose.removeEventListener("click", closePopup);
    window.removeEventListener("keydown", handleKey);

    if (this.collectedCount >= this.totalCherries) {
      this.time.delayedCall(1000, () => {
        this.scene.start("GameEnd");
      });
    }
  };

  const handleKey = (e) => {
    if (e.code === "Space" || e.code === "Enter") {
      closePopup();
    }
  };

  popupClose.addEventListener("click", closePopup);
  window.addEventListener("keydown", handleKey);
}

      });
    }

function createEndScene() {
  return new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function SceneEnd() {
      Phaser.Scene.call(this, { key: "GameEnd" });
    },

    preload: function () {
      this.load.image("background", "background.png");
    },

    create: function () {
      const w = this.scale.width;
      const h = this.scale.height;

      const bg = this.add.image(0, 0, "background").setOrigin(0).setDisplaySize(w, h);
      this.scale.on('resize', (gameSize) => {
      const width = gameSize.width;
      const height = gameSize.height;
      bg.setDisplaySize(width, height);
    }, this);

      bg.setAlpha(0);
      this.tweens.add({
        targets: bg,
        alpha: 1,
        duration: 1500,
        ease: "Sine.easeInOut"
      });

      this.add.particles(0, 0, "cherry", {
        x: { min: 0, max: w },
        y: { min: 0, max: h },
        scale: { start: 0.06, end: 0 },
        alpha: { start: 0.4, end: 0 },
        lifespan: 4000,
        speedY: { min: -25, max: 25 },
        speedX: { min: -15, max: 15 },
        quantity: 1,
        frequency: 180,
        tint: 0xffff88
      });

const title = this.add.text(
  w / 2,
  h / 2 - 120,
  "Hi love! 💕\n\nYou did it! You collected all the letters, each one a piece of how much I love you. I'm so proud of you, ikay! This game might be small, but it carries every heartbeat that thinks of you.\n\nI made this because you make life feel like an adventure, one that’s full of laughter, warmth, and the sweetest moments.\n\nEven when we’re apart, i hope this little world reminds you that you’re always with me. Every pixel, every jump, every sound, they all whisper your name.\n\nThank you for loving me the way you do. I’ll keep creating little worlds for you to explore, but none will ever compare to the world we’re building together.\n\nI love you endlessly, my player two. 💖",
  {
    fontFamily: "Press Start 2P",
    fontSize: "14px",
    color: "#ffffff",
    align: "center",
    lineSpacing: 12,
    wordWrap: { width: w * 0.8 }
  }
).setOrigin(0.5).setAlpha(0);


      const subtitle = this.add.text(
        w / 2,
        h / 2 + 40,
        "Thank you for playing, my love ❤",
        {
          fontFamily: "Press Start 2P",
          fontSize: "16px",
          color: "#ffffcc"
        }
      ).setOrigin(0.5).setAlpha(0);

      const credit = this.add.text(
        w / 2,
        h / 2 + 100,
        "Made with love by Kath 💌",
        {
          fontFamily: "Press Start 2P",
          fontSize: "14px",
          color: "#ffff88"
        }
      ).setOrigin(0.5).setAlpha(0);

      const restart = this.add.text(
        w / 2,
        h / 2 + 160,
        "Press R to play again",
        {
          fontFamily: "Press Start 2P",
          fontSize: "16px",
          color: "#ff66cc"
        }
      ).setOrigin(0.5).setAlpha(0);

      this.tweens.add({ targets: title, alpha: 1, duration: 1500, delay: 800 });
      this.tweens.add({ targets: subtitle, alpha: 1, duration: 1500, delay: 1800 });
      this.tweens.add({ targets: credit, alpha: 1, duration: 1500, delay: 2800 });
      this.tweens.add({ targets: restart, alpha: 1, duration: 1500, delay: 3800 });


      this.time.delayedCall(5500, () => {
        this.tweens.add({
          targets: restart,
          alpha: { from: 1, to: 0.3 },
          duration: 700,
          yoyo: true,
          repeat: -1
        });
      });

      this.input.keyboard.on("keydown-R", () => {
        this.scene.start("Level1");
      });
    }
  });
}

    function createStoneTexture(scene) {
      const key = "stoneTile";
      if (scene.textures.exists(key)) return;
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x6b6b6b, 1);
      g.fillRect(0, 0, 32, 16);
      g.lineStyle(1, 0x4a4a4a, 1);
      g.beginPath();
      g.moveTo(0, 8);
      g.lineTo(32, 8);
      g.strokePath();
      g.lineStyle(1, 0x4a4a4a, 1);
      g.beginPath();
      g.moveTo(8, 0);
      g.lineTo(8, 8);
      g.moveTo(24, 8);
      g.lineTo(24, 16);
      g.strokePath();
      g.generateTexture(key, 32, 16);
      g.destroy();
    }

    function createPlatform(scene, x, y, displayWidth = 120, displayHeight = 24) {
      const tile = scene.add.tileSprite(x, y, displayWidth, displayHeight, "stoneTile").setOrigin(0.5);
      const staticGroup = scene.physics.add.staticGroup();
      const hit = staticGroup.create(x, y, null).setOrigin(0.5);
      hit.displayWidth = displayWidth;
      hit.displayHeight = displayHeight;
      hit.refreshBody();
      hit.setVisible(false);
      return hit;
    }
  }
});