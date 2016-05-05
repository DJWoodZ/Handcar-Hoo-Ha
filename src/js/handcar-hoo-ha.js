(function() {
  'use strict';
  var version = '0.1.0';

  // prevent context menu
  document.oncontextmenu = document.body.oncontextmenu = function() {
    return false;
  };

  var canvas = document.createElement('canvas');
  canvas.width  = 640;
  canvas.height = 360;
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.oImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;

  // show loading text
  ctx.fillStyle = 'white';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LOADING', canvas.width / 2, canvas.height / 2);

  var game = function() {

    var imagesLoaded = false;
    var highScore = 0;
    var tempScore = 0;

    var lastUpdate = 0;
    var lives = 3;
    var level = 1;
    var score = 0;

    var levelComplete = false;
    var player = {};
    var goal = {};
    var enemies = [];
    var trees = [];

    var sprites = {};

    var keyPressed = false;

    function resetLevel() {
      levelComplete = false;

      player = {
        x: 10,
        y: (canvas.height / 2) - (22 / 2),
        speedX: 2,
        w: 30,
        h: 22,
        isMoving: false
      };

      goal = {
        x: canvas.width - player.w,
        w: player.w,
        h: player.h
      };

      enemies = [];
      var lastEnemyX = player.w + player.x;

      // build up some enemies
      var nextEnemyXPos = function() {
        return lastEnemyX + 12 + randomInt(player.w + 2, player.w * 5);
      };

      var enemyX = nextEnemyXPos();

      while(enemyX < goal.x - player.w) {

        var enemy = {
          x: enemyX,
          y: randomInt(10, canvas.height - 24 - 10),
          w: 12,
          h: 24,
          speedY: randomInt(1, 8),
          style: randomInt(0, 3),
          wait: 0
        };

        // randomly flip direction
        if(randomInt(0,2)) {
          enemy.speedY *= -1;
        }

        enemies.push(enemy);

        lastEnemyX = enemyX;
        enemyX = nextEnemyXPos();
      }

      // create some trees
      trees = [];
      for(var i = 0; i < 10; i++) {
        var tree = {
          x: randomInt(0, canvas.width - 12),
          y: randomInt(0, canvas.height - 22),
          w: 12,
          h: 22,
          style: randomInt(0,2)
        };

        var collision = false;

        // check for collision with roads
        enemies.forEach(function(e) {
          if(checkCollision(tree, {
              x: e.x - 4,
              y: 0,
              w: e.w + 8,
              h:canvas.height
            })) {
            collision = true;
          }
        });

        // check for collision with other trees
        trees.forEach(function(e) {
          if(checkCollision(tree, e)) {
            collision = true;
          }
        });

        // check for collision with track or tunnel
        if(checkCollision(tree, {x: 0, y: (canvas.height / 2) - (30 / 2), w: canvas.width, h: 30})) {
          collision = true;
        }

        if(!collision) {
          trees.push(tree);
        }
      }
    }

    var update = function(dt) {
      // if player reached goal
      if(player.x >= goal.x) {
        levelComplete = true;
        score += tempScore;
        tempScore = 0;
        player.isMoving = false;
        delete player.startedMoving;
      }

      if(player.isMoving) {
        // move player
        player.x += (player.speedX * dt * 60);

        var started = player.startedMoving;
        if(player.startedMoving) {
          // update score for this continuous run
          tempScore = Math.pow(2, ((Date.now() - started) / 500)) * 10;
        }
      } else if(tempScore > 0) {
        score += tempScore;
        tempScore = 0;
      }

      enemies.forEach(function(e) {
        if(checkCollision(player, e)) {
          score += tempScore;
          tempScore = 0;
          player.isMoving = false;
          player.x = 10;
          lives--;
        }

        // if not waiting
        if(e.wait <= 0) {
          // if above top of screen
          if(e.y <= 0 - (e.h * 2)) {
            if(randomInt(0, 2)) {
              // flip direction
              e.y = 0 - (e.h * 2);
              e.speedY *= -1;
            } else {
              // set back to bottom
              e.y = canvas.height + e.h;
            }
            e.style = randomInt(0, 3);
            e.wait = (Math.random() * 0.75) + 0.25;
          } else
          // if below bottom of screen
           if(e.y >= (canvas.height + e.h)) {
            if(randomInt(0, 2)) {
              // flip direction
              e.y = canvas.height + e.h;
              e.speedY *= -1;
            } else {
              // set back to top
              e.y = 0 - (e.h * 2);
            }
            e.style = randomInt(0, 3);
            e.wait = (Math.random() * 0.75) + 0.25;
          }

          e.y += (e.speedY * dt * 60);
        } else {
          e.wait -= (dt);
        }

      });
    };

    var draw = function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(sprites.background, 0, 0);

      // road
      ctx.fillStyle = 'rgba(255, 201, 14, 0.5)';
      enemies.forEach(function(e) {
        ctx.fillRect(e.x - 1, 0, 4, canvas.height);
        ctx.fillRect(e.x + e.w - 3, 0, 4, canvas.height);
      });

      // rail track
      ctx.drawImage(sprites.track, 0, (canvas.height / 2) - (sprites.track.height / 2));

      // enemies
      ctx.fillStyle = 'rgba(88, 88, 88, 0.2)';
      enemies.forEach(function(e) {
        ctx.fillRect(e.x + 4, e.y + 4, e.w, e.h);
        if(e.speedY < 0) {
          switch (e.style) {
            case 0:
              ctx.drawImage(sprites.car1Up, e.x, e.y);
              break;
            case 1:
              ctx.drawImage(sprites.car2Up, e.x, e.y);
              break;
            case 2:
              ctx.drawImage(sprites.car3Up, e.x, e.y);
              break;
            default:
          }
        } else {
            switch (e.style) {
              case 0:
                ctx.drawImage(sprites.car1Down, e.x, e.y);
                break;
              case 1:
                ctx.drawImage(sprites.car2Down, e.x, e.y);
                break;
              case 2:
                ctx.drawImage(sprites.car3Down, e.x, e.y);
                break;
              default:
          }
        }
      });

      ctx.fillStyle = 'rgba(88, 88, 88, 0.2)';
      ctx.fillRect(player.x + 4, player.y + 4, player.w, player.h);

      // trees
      trees.forEach(function(e) {
        if(e.style === 0) {
          ctx.drawImage(sprites.tree1, e.x, e.y);
        } else {
          ctx.drawImage(sprites.tree2, e.x, e.y);
        }
      });

      // toggle player image
      if(player.x % 20 < 10) {
        ctx.drawImage(sprites.player1, player.x, player.y);
      } else {
        ctx.drawImage(sprites.player2, player.x, player.y);
      }

      // goal
      ctx.drawImage(sprites.goal, canvas.width - sprites.goal.width, (canvas.height / 2) - (sprites.goal.height / 2));

      // lives
      ctx.fillStyle = 'rgba(128, 0, 0, 1)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Health: ' + formatNumber(lives), 2, 0);

      // level
      ctx.fillStyle = 'rgba(0, 0, 128, 1)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('Level: ' + formatNumber(level), canvas.width - 2, 0);

      // score
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      if(score + tempScore > highScore) {
        ctx.font = 'bold 14px monospace';
      } else {
        ctx.font = '14px monospace';
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(formatNumber(parseInt(score + tempScore)), canvas.width / 2, 0);

      // high score
      if(highScore > 0) {
        if(highScore > score + tempScore) {
          ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        } else {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        }
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('Best: ' + formatNumber(parseInt(highScore)), canvas.width / 2, canvas.height);
      }

      // logo
      ctx.drawImage(sprites.logo, canvas.width - sprites.logo.width - 2, canvas.height - sprites.logo.height - 1);

      // version
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('v ' + version, 2, canvas.height);
    };

    var step = function(now) {
      var dt = (now - lastUpdate) / 1000;
      lastUpdate = now;

      if(!imagesLoaded) {
        var proceed = true;
        var spritedLoaded = 0;
        for (var img in sprites) {
          if (sprites.hasOwnProperty(img)) {
            if(!imageLoaded(sprites[img])) {
              proceed = false;
              break;
            } else {
              spritedLoaded++;
            }
          }
        }

        if(!proceed) {
          // show loading text
          ctx.fillStyle = 'white';
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.font = '24px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('LOADING', canvas.width / 2, canvas.height / 2);
          var percentage = parseInt((spritedLoaded / Object.keys(sprites).length) * 100);
          if(percentage) {
            ctx.fillText(percentage + '%', canvas.width / 2, canvas.height * 0.75);
          }
        }

        imagesLoaded = proceed;
      } else {
        update(dt);
        draw();
      }

      if(lives <= 0) {
        lives = 3;
        level = 1;

        if(score > highScore) {
          highScore = score;
        }

        score = 0;
        tempScore = 0;

        resetLevel();
      } else if(levelComplete) {
        // add new life for every 10th level completed (max 5)
        if(lives < 5 && level % 10 === 0) {
          lives++;
        }

        level++;
        resetLevel();
      }

      window.requestAnimationFrame(step);
    };

    var imageLoaded = function(img) {
      return !(!img.complete || img.naturalWidth === 0);
    };

    var newImage = function(src) {
      var img = new Image();
      img.src = src;
      return img;
    };

    var createSpriteFromTiles = function(tiles, tileWidth, tileHeight, width, height){
      var image = new Image();
      var tempCanvas = document.createElement('canvas');
      var tileImages = [];
      var done = false; // set to true when all images are loaded

      var tileLoaded = function() {
        if(!done) {
          var proceed = true;
          for(var i = 0; i < tileImages.length; i++) {
            if(!imageLoaded(tileImages[i])) {
              proceed = false;
              break;
            }
          }

          if(proceed) {
            done = true;
            tempCanvas.width = width;
            tempCanvas.height = height;
            for(var y = 0; y < height; y += tileHeight) {
              for(var x = 0; x < width; x += tileWidth) {
                tempCanvas.getContext('2d').drawImage(tileImages[randomInt(0, tileImages.length)], x, y);
              }
            }

            image.src = tempCanvas.toDataURL('image/png');
          }
        }
      };

      if(Array.isArray(tiles)) {
        for(var i = 0; i < tiles.length; i++) {
          var arrImg = newImage(tiles[i]);
          tileImages.push(arrImg);
          arrImg.onload = tileLoaded;
        }
      } else if(typeof tiles === 'string') {
        var strImg = newImage(tiles);
        tileImages.push(strImg);
        strImg.onload = tileLoaded;
      }

      return image;
    };

    sprites.background = createSpriteFromTiles(['images/bg1.png', 'images/bg2.png', 'images/bg3.png', 'images/bg4.png'], 8, 8, canvas.width, canvas.height);
    sprites.track = createSpriteFromTiles('images/track.png', 6, 26, canvas.width, 26);
    sprites.player1 = newImage('images/player1.png');
    sprites.player2 = newImage('images/player2.png');
    sprites.car1Up = newImage('images/car1Up.png');
    sprites.car1Down = newImage('images/car1Down.png');
    sprites.car2Up = newImage('images/car2Up.png');
    sprites.car2Down = newImage('images/car2Down.png');
    sprites.car3Up = newImage('images/car3Up.png');
    sprites.car3Down = newImage('images/car3Down.png');
    sprites.goal = newImage('images/goal.png');
    sprites.tree1 = newImage('images/tree1.png');
    sprites.tree2 = newImage('images/tree2.png');
    sprites.logo = newImage('images/djwoodz-logo-small.png');

    var randomInt = function(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    };

    var formatNumber = function(num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    };

    var checkCollision = function(rect1, rect2) {
      return rect1.x < rect2.x + rect2.w &&
         rect1.x + rect1.w > rect2.x &&
         rect1.y < rect2.y + rect2.h &&
         rect1.h + rect1.y > rect2.y;
    };

    var movePlayer = function(e) {
      e.preventDefault();
      if(!player.isMoving) {
        player.startedMoving = Date.now();
        player.isMoving = true;
      }
    };

    var stopPlayer = function(e) {
      e.preventDefault();
      if(player.isMoving) {
        player.isMoving = false;
        delete player.startedMoving;
      }
    };

    document.addEventListener('keydown', function(e) {
      if(!keyPressed && e.code.toLowerCase() === 'space') {
        keyPressed = true;
        movePlayer(e);
      }
    });
    document.addEventListener('keyup', function(e) {
      if(e.code.toLowerCase() === 'space') {
        keyPressed = false;
        stopPlayer(e);
      }
    });

    document.addEventListener('mousedown', function(e) {
      if(e.button === 0) {
        movePlayer(e);
      }
    });
    document.addEventListener('mouseup', function(e) {
      if(e.button === 0) {
        stopPlayer(e);
      }
    });
    document.addEventListener('mouseout', stopPlayer);

    document.addEventListener('touchstart', movePlayer);
    document.addEventListener('touchend', stopPlayer);

    resetLevel();
    step(0);
  };

  // hide address bar trick
  document.body.style.height = (window.innerHeight + 1) + 'px';

  window.addEventListener('load', game);
})();
