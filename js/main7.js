
        window.onload = function () {
            // You might want to start with a template that uses GameStates:
            //     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic

            // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
            // You will need to change the fourth parameter to "new Phaser.Game()" from
            // 'phaser-example' to 'game', which is the id of the HTML element where we
            // want the game to go.
            // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
            // You will need to change the paths you pass to "game.load.image()" or any other
            // loading functions to reflect where you are putting the assets.
            // All loading functions will typically all be found inside "preload()".

            "use strict";

            // code patterned after the tank example

            //Germ = function (index, game, player) {

            //    var x = game.world.randomX;
            //    var y = game.world.randomY;

            //    this.game = game;
            //    this.health = 3;
            //   this.player = player;
            //    this.alive = true;

            //    this.germ = game.add.sprite(x, y, 'germ');

            //    this.germ.anchor.set(0.5);

            //    this.germ.name = index.toString();
            //    game.physics.enable(this.germ, Phaser.Physics.ARCADE);
            //    this.germ.body.immovable = false;
            //    this.germ.body.collideWorldBounds = true;
            //    this.germ.body.bounce.setTo(1, 1);

            //    this.germ.angle = game.rnd.angle();

            //    game.physics.arcade.velocityFromRotation(this.germ.rotation, 100, this.germ.body.velocity);

            //};

            //Germ.prototype.damage = function () {

            //    this.health -= 1;

            //    if (this.health <= 0) {
            //        this.alive = false;

            //        this.germ.kill();

            //        return true;
            //    }

            //    return false;

            //};

            //Germ.prototype.update = function () {

            //};

            var game = new Phaser.Game(1024, 512, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

            function preload() {

                game.load.image('tech', 'assets/large dude.png');
                game.load.image('zapper', 'assets/blowgun.png');
                game.load.image('bright lab', 'assets/1024 x 512 lab bright.png');
                game.load.image('bullet', 'assets/bullet.png');
                game.load.image('bug', 'assets/slime.png');
                game.load.image('bigbug', 'assets/ large slime.png');
                game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
                game.load.image('rip', 'assets/RIP.png');
                game.load.image('hero', 'assets/hero.png');


            }

            var lab;

            var tech;
            var zapper;

            var germs;
            var germsTotal = 0;
            var germsAlive = 0;
            var explosions;

            var currentSpeed = 0;
            var cursors;

            var bullets;
            var fireRate = 100;
            var nextFire = 0;

            var tempX;
            var tempY;

            var rip;
            var hero;

            function create() {

                //  Resize our game world to be a 3076 x 512 rectangle
                game.world.setBounds(0, 0, 3076, 512);

                //  Our tiled scrolling background
                lab = game.add.tileSprite(0, 0, 1024, 512, 'bright lab');
                lab.fixedToCamera = true;

                //  The base of our lab tech
                tech = game.add.sprite(512, 256, 'tech');
                tech.anchor.setTo(0.5, 0.5);

                //  This will force it to decelerate and limit its speed
                game.physics.enable(tech, Phaser.Physics.ARCADE);
                tech.body.drag.set(0.2);
                tech.body.maxVelocity.setTo(400, 400);
                tech.body.collideWorldBounds = true;

                //  Finally the zapper that we place on-top of the lab tech body
                zapper = game.add.sprite(512, 256, 'zapper');
                zapper.anchor.setTo(0.0, 0.5);

                //  Create some germs to eliminate
                germs = [];

                germsTotal = 20;
                germsAlive = 20;

                for (var i = 0; i < germsTotal; i++) {
                    //germs.push(new Germ(i, game, tech));

                        //var bug;

                        tempX = game.world.randomX;
                        tempY = game.world.randomY;
                       
                        // different types of germs
                        if (i % 2 == 0) {
                            germs[i] = game.add.sprite(tempX, tempY, 'bug');
                            germs[i].health = 3;
                        }
                        else {
                            germs[i] = game.add.sprite(tempX, tempY, 'bigbug');
                            germs[i].health = 6;
                        }
                        germs[i].game = game;
                        
                        germs[i].player = tech;
                        germs[i].alive = true;
                        germs[i].anchor.set(0.5);
                        // make the germs mobile
                        game.physics.enable(germs[i], Phaser.Physics.ARCADE);
                        germs[i].body.immovable = false;
                        germs[i].body.collideWorldBounds = true;
                        germs[i].body.bounce.setTo(1, 1);
                        germs[i].angle = game.rnd.angle();
                        // different germs go different speeds
                        game.physics.arcade.velocityFromRotation(germs[i].rotation, 10*i, germs[i].body.velocity);
                   
                }

                //  Our bullet group
                bullets = game.add.group();
                bullets.enableBody = true;
                bullets.physicsBodyType = Phaser.Physics.ARCADE;
                bullets.createMultiple(30, 'bullet', 0, false);
                bullets.setAll('anchor.x', 0.5);
                bullets.setAll('anchor.y', 0.5);
                bullets.setAll('outOfBoundsKill', true);
                bullets.setAll('checkWorldBounds', true);

                //  Explosion pool
                explosions = game.add.group();

                for (var i = 0; i < 10; i++) {
                    var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
                    explosionAnimation.anchor.setTo(0.5, 0.5);
                    explosionAnimation.animations.add('kaboom');
                }

                tech.bringToTop();
                zapper.bringToTop();
                
                game.camera.follow(tech);
                game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
                game.camera.focusOnXY(0, 0);

                cursors = game.input.keyboard.createCursorKeys();

            }

            function update() {

                germsAlive = 0;

                for (var i = 0; i < germs.length; i++) {
                    if (germs[i].alive) {
                        germsAlive++;
                        //game.physics.arcade.collide(tech, germs[i]);
                        game.physics.arcade.overlap(germs[i], tech, techHitGerm, null, this);
                        game.physics.arcade.overlap(bullets, germs[i], bulletHitGerm, null, this);
                        //germs[i].update();
                    }
                }

                if (germsAlive == 0) {
                    hero = game.add.sprite(tech.x - 250, 0, 'hero');
                    tech.kill();
                    zapper.kill();
                }

                if (cursors.left.isDown) {
                    tech.angle -= 4;
                }
                else if (cursors.right.isDown) {
                    tech.angle += 4;
                }

                if (cursors.up.isDown) {
                    //  The speed we'll travel at
                    currentSpeed = 300;
                }
                else {
                    if (currentSpeed > 0) {
                        currentSpeed -= 4;
                    }
                }

                if (currentSpeed > 0) {
                    game.physics.arcade.velocityFromRotation(tech.rotation, currentSpeed, tech.body.velocity);
                }

                lab.tilePosition.x = -game.camera.x;
                lab.tilePosition.y = -game.camera.y;

                //  Position all the parts and align rotations
                zapper.x = tech.x;
                zapper.y = tech.y;

                zapper.rotation = game.physics.arcade.angleToPointer(zapper);

                if (game.input.activePointer.isDown) {
                    //  Boom!
                    fire();
                }

            }

            function bulletHitGerm(germ, bullet) {

                bullet.kill();
                germ.health -= 1;
                if (germ.health <= 0) {
                    germ.alive = false;
                    germ.kill();
                    var explosionAnimation = explosions.getFirstExists(false);
                    explosionAnimation.reset(germ.x, germ.y);
                    explosionAnimation.play('kaboom', 30, false, true);
                }
            
            }

            function techHitGerm(germ, tech) {

                rip = game.add.sprite(tech.x, 50, 'rip');
                tech.kill();
                zapper.kill();
                
            }

            function fire() {

                if (game.time.now > nextFire && bullets.countDead() > 0) {
                    nextFire = game.time.now + fireRate;
                    var bullet = bullets.getFirstExists(false);
                    bullet.reset(zapper.x, zapper.y);
                    bullet.rotation = game.physics.arcade.moveToPointer(bullet, 1000, game.input.activePointer, 500);
                }

            }

            function render() {

                // game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.length, 32, 32);
                // game.debug.text('Germs: ' + germsAlive + ' / ' + germsTotal, 32, 32);

            }


        };