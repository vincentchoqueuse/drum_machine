function init_ui(){
    
    //List of option
    html_options="";
    for (var indice=0;indice<files.length;indice++)
    {
        html_options=html_options.concat("<option value="+files[indice]+">"+files[indice]+"</option>\n");
    }
   
    //First kit
    first_kit=[{name:'kick1',file:'kick_simple.wav',playbackRate:'1',amp:'1'},
               {name:'kicksub',file:'kick.wav',playbackRate:'1',amp:'1'},
               {name:'snare',file:'snare_dnB.wav',playbackRate:'1',amp:'1'},
               {name:'HH',file:'closed_HH2.wav',playbackRate:'1',amp:'1'},
               {name:'machine1',file:'machine1.wav',playbackRate:'1',amp:'1'},
               {name:'machine2',file:'machine2.wav',playbackRate:'1',amp:'1'},
               {name:'machine2',file:'machine2.wav',playbackRate:'1',amp:'1'},];

    for (indice=0;indice<nb_tracks;indice++)
    {
        //create sampler
        sampler=new Sampler(context,first_kit[indice].file,first_kit[indice].name);
        sampler.amp=first_kit[indice].amp;
        sampler.playbackRate=first_kit[indice].playbackRate;
        sampler.loadBuffer();
        samplerUI_array[indice]=new SamplerUI(sampler);
        kit[indice]=sampler;
        
        //update ui
        trnode=$("#editor"+indice);
        trnode.find(".uiname").val(samplerUI_array[indice].sampler.name);
        trnode.find(".uifile").append(html_options);
        trnode.find(".uifile").val(samplerUI_array[indice].sampler.file);
        trnode.find(".uiplaybackRate").val(samplerUI_array[indice].sampler.playbackRate);
        trnode.find(".uiamp").val(samplerUI_array[indice].sampler.amp);
        $("#sample"+indice+"name").text(samplerUI_array[indice].sampler.name);
        
    }
    
    
    
    
    //trigger sound
    $(".listen").click(function(){
            //find the tr index
            index=parseInt($(this).parent().parent().parent().children().index($(this).parent().parent()));
            samplerUI_array[index].sampler.trigger(context.currentTime);
            });

    
    $(".update_sampler").change(function(){
                value=$(this).val();
                index=parseInt($(this).parent().parent().parent().children().index($(this).parent().parent()))
                sampler=samplerUI_array[index].sampler;
                if ($(this).hasClass("uiname")){sampler.name=value;$("#sample"+index+"name").text(value);};
                if ($(this).hasClass("uiplaybackrate")){sampler.playbackRate=value};
                if ($(this).hasClass("uiamp")){sampler.gain.gain.value=value;};
                if ($(this).hasClass("uifile")){sampler.file=value;kit[index].loadBuffer();};
                                });
    
    
    //Sequencer UI
    $("#pattern_play").click(function(){
            isplaying=(isplaying+1)%2;
            if (isplaying==1)
                {
                $(".fa-play").addClass("fa-pause").removeClass("fa-play");
                sequencer.start();
                }
            else
                {
                $(".fa-pause").addClass("fa-play").removeClass("fa-pause");
                sequencer.stop();
                }
              }
           );
    
    $("#pattern_tempo").change(function(){sequencer.tempo=parseFloat($(this).val());});
    

    //Waveform UI
    
    $(".waveform_selection").change(function(){
            id_string=$(this).attr('id');
            index=parseInt(id_string.slice(8))-1;
            samplerUI_array[index].draw();
            //waveform.setBuffer();
            //waveform.setSelection();
            });
    
    //sequencer
    $(".cell").click(function() {
        //get index of the cell
        var col = parseInt($(this).parent().parent().children().index($(this).parent()))-1;
        var row = parseInt($(this).parent().parent().parent().children().index($(this).parent().parent()));
        //update matrix
        value=!$(this).hasClass("active");
        sequencer.current_matrix[row][col]=value;
        });
    
    $(".pattern_selection").change(function(){
                                   id_string=$(this).attr('id');
                                   pattern_manager.selected_pattern=parseInt(id_string.slice(7))-1;
                                   sequencer.current_matrix=pattern_manager.duplicate();
                                   sequencer_draw();
                                   });
    
    $("#pattern_save").click(function(){pattern_manager.save(sequencer.current_matrix);});
    
    $("#pattern_clear").click(function(){
                              sequencer.current_matrix=[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                              [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
                              sequencer_draw();
                              });

    function sequencer_draw(){
        for (var row=0;row<nb_tracks;row++)
        {
            for (var col=0;col<16;col++)
            {
                if (sequencer.current_matrix[row][col]==1)
                    {
                    $("#table_sequencer").find("tr").eq(row+1).find("td").eq(col+1).find("button").addClass('active').prop('checked', true);
                    }
                else{
                    $("#table_sequencer").find("tr").eq(row+1).find("td").eq(col+1).find("button").removeClass('active').prop('checked', false);
                    }
            }
        }
    };
    

    //to improve
    setTimeout(function(){$("#waveform1").trigger("change");}, 2000);
    

    
}




