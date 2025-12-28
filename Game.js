/*  Created by Nambiar for Game Dolphin (gamedolph.in)
    Game - Follow Me - Simple Simon Clone 
*/

BasicGame.Game = function (game) {
};

BasicGame.Game.prototype = {

	create: function () {
        var storedLocale = null;
        try {
            storedLocale = localStorage.getItem('edusimon_locale');
        } catch (e) {
            storedLocale = null;
        }
        var lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        var detectedLocale = 'en';
        if (lang.indexOf('ca') === 0) {
            detectedLocale = 'ca';
        } else if (lang.indexOf('es') === 0) {
            detectedLocale = 'es';
        }
        this.locale = (storedLocale === 'es' || storedLocale === 'ca' || storedLocale === 'en') ? storedLocale : detectedLocale;
        this.texts = {
            en: {
                tapToStart: "Double tap to\nstart the lesson",
                instructions: "Listen to the musical pattern\nset by the teacher.\nRepeat the notes\nin the same order.",
                round: "Round {round}",
                teacherTurn: "Listen",
                classTurn: "Repeat",
                notesLegend: "Notes: DO  RE  MI  FA",
                tempoLabel: "Tempo",
                tempoApprox: "{bpm} bpm",
                result: "You reached {round} rounds.\nBreathe, listen, and\ntry again."
            },
            es: {
                tapToStart: "Doble toque para\ncomenzar la clase",
                instructions: "Escucha el patrón musical\nque marca el docente.\nRepite las notas\nen el mismo orden.",
                round: "Ronda {round}",
                teacherTurn: "Escucha",
                classTurn: "Repite",
                notesLegend: "Notas: DO  RE  MI  FA",
                tempoLabel: "Tempo",
                tempoApprox: "{bpm} bpm",
                result: "Lograste {round} rondas.\nRespira, escucha y\nvuelve a intentarlo."
            },
            ca: {
                tapToStart: "Doble toc per\ncomençar la classe",
                instructions: "Escolta el patró musical\nque marca el docent.\nRepeteix les notes\nen el mateix ordre.",
                round: "Ronda {round}",
                teacherTurn: "Escolta",
                classTurn: "Repeteix",
                notesLegend: "Notes: DO  RE  MI  FA",
                tempoLabel: "Tempo",
                tempoApprox: "{bpm} bpm",
                result: "Has arribat a {round} rondes.\nRespira, escolta i\ntorna-ho a provar."
            }
        };
        this.t = function(key, vars){
            var str = (this.texts[this.locale] && this.texts[this.locale][key]) || this.texts.en[key] || key;
            if (!vars) {
                return str;
            }
            return str.replace(/\{(\w+)\}/g, function(match, k){
                return (vars[k] !== undefined) ? vars[k] : match;
            });
        };

        //declare a few 'global' variables here
        this.score = 0;
        this.tapCount = 0;
        this.playSound = true;
        this.compDelay = 900;
        this.baseCompDelay = 900;
        this.gameState = 'comp';
        this.counter = 0;
        this.noteNames = ['DO', 'RE', 'MI', 'FA'];
        this.stage.backgroundColor = '#0b111a';
        this.showingResult = false;
        this.lastResultRound = 0;
        this.minDelay = 450;
        this.maxDelay = 1200;

        //initialize the 4 boxes
        this.initBoxes();

        //create the rest of the interface - title image, instructions, etc
        this.titleimage = this.add.sprite(this.world.centerX,100,'spriteset');
        this.titleimage.frameName = 'title.png';
        this.titleimage.anchor.setTo(0.5,0.5);
        this.titleimage.scale.setTo(0.5,0.5);
        this.titleimage.alpha = 0;

        this.titleText = this.add.text(this.world.centerX, 100, "EduSimon", { font: "42px Georgia", fill: "#ffffff", align: "center" });
        this.titleText.anchor.setTo(0.5,0.5);

        this.mask = this.add.sprite(0,0,'spriteset');
        this.mask.frameName = 'mask.png'
        this.mask.width = this.world.width;
        this.mask.height = this.world.height;
        this.mask.inputEnabled = true;
        this.mask.events.onInputDown.add(this.startGame,this);

        this.tapText = this.add.text(this.world.centerX, this.world.centerY, this.t('tapToStart'), { font: "30px Georgia", fill: "#ffffff", align: "center" });
        this.tapText.anchor.setTo(0.5,0.5);
        this.instructionText = this.add.text(this.world.centerX, this.world.centerY+180, this.t('instructions'), { font: "20px Georgia", fill: "#ffffff", align: "center" })
        this.instructionText.anchor.setTo(0.5,0.5);

        this.scoreText = this.add.text(this.world.centerX, this.world.centerY-150, this.t('round', { round: 0 }), { font: "30px Georgia", fill: "#ffffff", align: "center" });
        this.scoreText.anchor.setTo(0.5,0.5);
        this.scoreText.alpha = 0;

        this.playerText = this.add.text(this.world.centerX, this.world.centerY-190, this.t('teacherTurn'), { font: "28px Georgia", fill: "#ffffff", align: "center" });
        this.playerText.anchor.setTo(0.5,0.5);
        this.playerText.alpha = 0;

        this.tempoText = this.add.text(this.world.centerX, this.world.height-150, "", { font: "18px Georgia", fill: "#cfe8ff", align: "center" });
        this.tempoText.anchor.setTo(0.5,0.5);
        this.tempoText.alpha = 0;

        this.tempoLabel = this.add.text(this.world.centerX, this.world.height-175, "", { font: "16px Georgia", fill: "#cfe8ff", align: "center" });
        this.tempoLabel.anchor.setTo(0.5,0.5);
        this.tempoLabel.alpha = 0;

        this.tempoMinus = this.add.text(this.world.centerX - 70, this.world.height-175, "-", { font: "20px Georgia", fill: "#cfe8ff", align: "center" });
        this.tempoMinus.anchor.setTo(0.5,0.5);
        this.tempoMinus.inputEnabled = true;
        this.tempoMinus.input.useHandCursor = true;
        this.tempoMinus.events.onInputDown.add(this.decreaseTempo, this);
        this.tempoMinus.alpha = 0;

        this.tempoPlus = this.add.text(this.world.centerX + 70, this.world.height-175, "+", { font: "20px Georgia", fill: "#cfe8ff", align: "center" });
        this.tempoPlus.anchor.setTo(0.5,0.5);
        this.tempoPlus.inputEnabled = true;
        this.tempoPlus.input.useHandCursor = true;
        this.tempoPlus.events.onInputDown.add(this.increaseTempo, this);
        this.tempoPlus.alpha = 0;

        this.createLanguageSelector();

        this.musicButton = this.add.sprite(this.world.width-60,this.world.height-10,'spriteset');
        this.musicButton.frameName = 'music_on.png';
        this.musicButton.anchor.setTo(0,1);
        this.musicButton.scale.setTo(0.5,0.5);
        this.musicButton.inputEnabled = true;
        this.musicButton.input.useHandCursor = true;
        this.musicButton.events.onInputDown.add(this.musicToggle,this);
    },

    startGame : function(){
        if(this.tapCount==1){
            /* Tap count ensures that the user clicks/taps twice. Sometimes when the user clicks the boxes twice, 
            it may be a wrong click and hence the game over screen comes up BUT since he clicked twice, this startGame screen 
            is dismissed too. Hence the double click */

            //tween the interface.. .show some (alpha:1), hide some (alpha : 0)
            var temp = this.add.tween(this.mask).to({alpha : 0},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.tapText).to({alpha : 0},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.instructionText).to({alpha : 0},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.scoreText).to({alpha : 1},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.titleimage).to({y:50},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.titleText).to({y:50},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.playerText).to({alpha:1},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.tempoText).to({alpha:1},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.tempoLabel).to({alpha:1},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.tempoMinus).to({alpha:1},500, Phaser.Easing.Sinusoidal.InOut, true);
            this.add.tween(this.tempoPlus).to({alpha:1},500, Phaser.Easing.Sinusoidal.InOut, true);

            this.scoreText.setText(this.t('round', { round: 0 }));
            this.updateTempoText();
            temp.onComplete.add(function(){
                this.mask.kill();
            },this);

            this.tapCount=0;
            this.showingResult = false;

            //start the computer turn
            this.compPlay();

        }
        else{
            this.tapCount++;
        }
    },

    initBoxes : function(){
        //initialize the sounds, and boxes
        this.fx = this.add.audio('sfx');
        this.fx.addMarker('death',4,0.5);
        this.playOrder = [];                //stores the computer's order
        this.boxes = this.add.group();
        this.noteLabels = this.add.group();
        this.initOneBox(0,-1,-1);
        this.initOneBox(1,1,-1);
        this.initOneBox(2,1,1);
        this.initOneBox(3,-1,1);

        this.playOrder.push(this.rnd.integerInRange(0,3)); // start the series with a choice between [0,3]

    },

    initOneBox : function(no,x,y){
        //initialize individual boxes
        var temp = this.add.sprite(this.world.centerX+60*x,this.world.centerY+60*y,'spriteset');
        this.fx.addMarker('box'+no,no, 0.5);
        temp.no = no+1;
        temp.frameName = 'box'+(no+1)+'.png';
        temp.anchor.setTo(0.5,0.5);
        temp.scale.setTo(0.5,0.5);
        temp.inputEnabled = true;
        temp.defaultFr = function(){
            this.frameName = 'box'+(this.no)+'.png';
        };
        temp.glowFrame = function(){
            this.frameName = 'box'+(this.no)+'glow.png';
        };
        temp.events.onInputDown.add(function(){
            //only respond to input if its the player's turn
            if(this.gameState=='player'){
                this.chooseShape(temp);
            }
        }, this);
        this.boxes.add(temp);

        var label = this.add.text(temp.x, temp.y, this.noteNames[no], { font: "18px Georgia", fill: "#f0f6ff", align: "center" });
        label.anchor.setTo(0.5,0.5);
        this.noteLabels.add(label);
    },

    compPlay : function(){
        //computer's turn
        this.gameState = 'comp';  
        this.playerText.setText(this.t('teacherTurn'));
        var i=0;
        for(i=1;i<=this.playOrder.length;i++){
            var temp = this.boxes.getAt(this.playOrder[i-1]); 
            //add events to timer at regular intervals
            this.time.events.add(this.compDelay*i, this.chooseShape,this,temp);
        }
        this.time.events.add(this.compDelay*i,function(){
            this.counter = 0;
            this.gameState = 'player';
            this.playerText.setText(this.t('classTurn'));
            //after final turn of the computer, start player's turn
        },this);
    },

    chooseShape : function(a){
        //function that actually makes the boxes blink
        this.sound.stopAll();
        this.boxes.callAll('defaultFr');
        this.boxes.setAll('inputEnabled',false);
        a.glowFrame();
        if(this.playSound==true){
            //sounds played only if toggle set to true - controlled by musicToggle function
            this.fx.play('box'+(a.no-1));
        }
        this.time.events.add(400, this.resetFrames, this,a);
        
    },

    resetFrames : function(a){
        //function that resets the boxes
        this.sound.stopAll();
        this.boxes.callAll('defaultFr');
        this.boxes.setAll('inputEnabled',true);
        if(this.gameState=='player'&&this.counter<this.playOrder.length){
            //check for lose condition 
            if(this.playOrder[this.counter]!=a.no-1){
                this.resetGame();
                return;
            }
            this.counter++;  //keeps track of the player's number of moves
            //check if the player has completed all the steps
            if(this.counter>=this.playOrder.length){
                this.score++;
                this.scoreText.setText(this.t('round', { round: this.score }));
                this.playOrder.push(this.rnd.integerInRange(0,3));
                this.time.events.removeAll();
                if(this.compDelay>this.minDelay){
                    this.compDelay-=50;
                    if (this.compDelay < this.minDelay) {
                        this.compDelay = this.minDelay;
                    }
                }
                this.updateTempoText();
                this.compPlay();
            }
        }
    },

    resetGame : function(){
        //reset the UI and global variables after a lose condition
        this.sound.stopAll();
        this.showingResult = true;
        this.lastResultRound = this.score;
        this.instructionText.setText(this.t('result', { round: this.lastResultRound }));
        this.score = 0;
        this.compDelay = this.baseCompDelay;
        this.playOrder.length = 0;
        this.playOrder.push(this.rnd.integerInRange(0,3));

        this.mask.visible = true;
        if(this.playSound==true){
            this.fx.play('death');
        }

        var temp = this.add.tween(this.mask).to({alpha : 1},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.tapText).to({alpha : 1},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.instructionText).to({alpha : 1},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.scoreText).to({alpha : 0},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.titleimage).to({y:100},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.titleText).to({y:100},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.playerText).to({alpha:0},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.tempoText).to({alpha:0},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.tempoLabel).to({alpha:0},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.tempoMinus).to({alpha:0},500, Phaser.Easing.Sinusoidal.InOut, true);
        this.add.tween(this.tempoPlus).to({alpha:0},500, Phaser.Easing.Sinusoidal.InOut, true);

        temp.onComplete.add(function(){
            this.mask.reset(0,0);
            this.tempoText.alpha = 0;
            this.tempoLabel.alpha = 0;
            this.tempoMinus.alpha = 0;
            this.tempoPlus.alpha = 0;
        },this);
    },

	musicToggle : function(){
        //toggle the sound effects flag
        if(this.playSound==true){
            this.musicButton.frameName = 'music_off.png';
            this.playSound = false;
        }
        else{
            this.musicButton.frameName = 'music_on.png';
            this.playSound = true;
        }
    },

    updateTempoText : function(){
        var bpm = Math.round(60000 / this.compDelay);
        this.tempoText.setText(this.t('tempoApprox', { bpm: bpm }));
        this.tempoLabel.setText(this.t('tempoLabel'));
        if (this.tempoMinus && this.tempoPlus) {
            this.tempoMinus.fill = (this.compDelay < this.maxDelay) ? "#cfe8ff" : "#6b7b8b";
            this.tempoPlus.fill = (this.compDelay > this.minDelay) ? "#cfe8ff" : "#6b7b8b";
        }
    },

    setLocale : function(locale){
        this.locale = locale;
        try {
            localStorage.setItem('edusimon_locale', locale);
        } catch (e) {
        }
        this.applyLocale();
    },

    applyLocale : function(){
        this.tapText.setText(this.t('tapToStart'));
        if (this.showingResult) {
            this.instructionText.setText(this.t('result', { round: this.lastResultRound }));
        } else {
            this.instructionText.setText(this.t('instructions'));
        }
        this.scoreText.setText(this.t('round', { round: this.score }));
        if (this.gameState === 'player') {
            this.playerText.setText(this.t('classTurn'));
        } else {
            this.playerText.setText(this.t('teacherTurn'));
        }
        this.updateTempoText();
        if (this.langButtons && this.langButtons.length) {
            var i = 0;
            for (i = 0; i < this.langButtons.length; i++) {
                this.langButtons[i].fill = (this.langButtons[i].localeCode === this.locale) ? "#ffffff" : "#cfe8ff";
            }
        }
    },

    createLanguageSelector : function(){
        var labels = ['ES', 'CA', 'EN'];
        var locales = ['es', 'ca', 'en'];
        var startX = this.world.width - 30;
        var y = 24;
        var i = 0;
        this.langButtons = [];
        for (i = 0; i < labels.length; i++) {
            var label = this.add.text(startX - (i * 34), y, labels[i], { font: "16px Georgia", fill: "#cfe8ff", align: "center" });
            label.anchor.setTo(0.5, 0.5);
            label.inputEnabled = true;
            label.input.useHandCursor = true;
            label.localeCode = locales[i];
            label.events.onInputDown.add(function(target){
                this.setLocale(target.localeCode);
            }, this);
            this.langButtons.push(label);
        }
        this.applyLocale();
    },

    increaseTempo : function(){
        if (this.compDelay > this.minDelay) {
            this.compDelay -= 50;
            if (this.compDelay < this.minDelay) {
                this.compDelay = this.minDelay;
            }
            this.baseCompDelay = this.compDelay;
            this.updateTempoText();
        }
    },

    decreaseTempo : function(){
        if (this.compDelay < this.maxDelay) {
            this.compDelay += 50;
            if (this.compDelay > this.maxDelay) {
                this.compDelay = this.maxDelay;
            }
            this.baseCompDelay = this.compDelay;
            this.updateTempoText();
        }
    }
};
