//Object Pattern Manager

function Pattern_manager(nb_patterns,nb_tracks){
    this.nb_patterns=nb_patterns;
    this.nb_tracks=nb_tracks;
    this.selected_pattern=0;
    this.pattern_length=16;
    this.patterns;
}

Pattern_manager.prototype.save=function (array){
    
    var newpattern = new Array(this.nb_tracks);
    for(var row=0; row < this.nb_tracks; row++ ){
        newpattern[row] = new Array(this.pattern_length);
        for(var col=0; col< this.pattern_length; col++ ){
            newpattern[row][col] = array[row][col];
        }
    }
    this.patterns[this.selected_pattern]=newpattern;
}

Pattern_manager.prototype.duplicate=function (){
   
    var pattern = new Array(this.nb_tracks);
    for(var row=0; row < this.nb_tracks; row++ ){
        pattern[row] = new Array(this.pattern_length);
        for(var col=0; col< this.pattern_length; col++ ){
            pattern[row][col] = this.patterns[this.selected_pattern][row][col];
        }
    }
    return pattern;
}

Pattern_manager.prototype.init=function (index){
    
    this.patterns=new Array(this.nb_patterns);
    
    for (var index=0;index<this.nb_patterns;index++)
    {
        this.patterns[index]=new Array(this.nb_tracks);
        for (var row=0;row<this.nb_tracks;row++)
        {
            this.patterns[index][row]=new Array(this.pattern_length);
            for (var col=0;col<this.pattern_length;col++)
            {
                this.patterns[index][row][col]=0;
            }
        }
    }
}

//Object sequencer
function Sequencer(context,matrix,kit){
    this.context=context;
    this.currentstep=0;
    this.nbstep=16;
    this.tempo=120;
    this.nextNoteTime;
    this.scheduleAheadTime=0.1;   //SEE TUTORIAL OF CHRIS WILSON ABOUT WEB AUDIO CLOCK (great tut!)
    this.interval=0.025;
    this.kit=kit;
    this.current_matrix=current_matrix;
    this.nb_tracks=6;
    this.uistep=function(){};
}

Sequencer.prototype.start=function (){
    this.currentstep=0;
    this.nextNoteTime=this.context.currentTime;
    var mysequencer=this;
    this.timeout=setInterval(function(){mysequencer.scheduler();},this.interval*1000);
}

Sequencer.prototype.stop=function (){clearInterval(this.timeout);}

Sequencer.prototype.scheduler=function(){
    while (this.nextNoteTime < this.context.currentTime + this.scheduleAheadTime ) {
        // Trigger sounds
        for (var indice=0;indice<this.nb_tracks;indice++)
        {
            if (this.current_matrix[indice][this.currentstep]==true && this.kit[indice] )
            {
                this.kit[indice].trigger(this.nextNoteTime);
            }
        }
        setTimeout(this.uistep(this.currentstep), this.nextNoteTime*1000);
        //Compute next note time
        this.nextNoteTime += 0.25 * 60.0 / this.tempo;
        this.currentstep=(this.currentstep+1)% this.nbstep; //Take the modulo operator
    }
}

//Object sampler
function Sampler(context,file,name) {
    this.context=context;
    this.attack=0.001;
    this.decay=0.1;
    this.sustain=1.;
    this.release=0.001;
    this.playbackRate=1;
    this.buffer=null;
    this.start=null;
    this.end=null;
    this.amp=1;
    this.file=file;
    this.name=name;
    
    //Web audio object
    this.filter_lp=this.context.createBiquadFilter();
    this.filter_hp=this.context.createBiquadFilter();
    this.filter_hp.type="highpass";
    this.filter_lp.frequency.value=20000;
    this.filter_hp.frequency.value=0;
    this.gain = this.context.createGain();
    
    //Web audio connection
    this.filter_lp.connect(this.filter_hp);
    this.filter_hp.connect(this.gain);
    this.gain.connect(this.context.destination);
    
    //Define output
    this.output=this.filter_lp;
};

Sampler.prototype.loaded=function (){}

Sampler.prototype.loadBuffer = function() {
    var sampler=this;
    var request = new XMLHttpRequest();
    request.open('get', 'https://s3-eu-west-1.amazonaws.com/choqueuse/samples/wav/'+this.file, true);
    request.responseType = 'arraybuffer';
    
    request.onload = function() {
        sampler.context.decodeAudioData(request.response, function(buffer) {
                                         sampler.buffer=buffer;
                                         sampler.start=0;
                                         sampler.end=buffer.duration;
                                         sampler.loaded();
                                         });
    };
    request.send();
};


Sampler.prototype.trigger = function(time) {
    //Make web audio connection
    this.buffer_source = this.context.createBufferSource();
    this.envelope = this.context.createGain();
    this.buffer_source.connect(this.envelope);
    this.envelope.connect(this.output);
    
    //Initialize Values
    this.buffer_source.playbackRate.value=this.playbackRate;
    this.buffer_source.buffer=this.buffer;
    
    //create gain envelope
    this.envelope.gain.setValueAtTime(0,time);
    this.envelope.gain.setValueAtTime(1,time+this.attack);
    this.envelope.gain.exponentialRampToValueAtTime(this.sustain,time+this.end-this.start-this.decay);
    this.envelope.gain.linearRampToValueAtTime(0,time+this.end-this.start);
    
    //Schedule sound
    this.buffer_source.start(time,this.start,this.end);
    this.buffer_source.stop(time+this.end-this.start);
};




