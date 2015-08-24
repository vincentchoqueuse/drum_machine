function SamplerUI(sampler)
    {
    this.container="container";
    this.resolution=1;
    this.width=800;
    this.sampler=sampler;
    this.Lowbuffer=null;
        
    }



SamplerUI.prototype.setLowBuffer = function() {
    
    console.log(this);
    var prebuff=this.sampler.buffer;
    
    this.pieces = this.width/this.resolution;
    this.duration = prebuff.duration
    this.sampleRate = prebuff.sampleRate
    this.Lowbuffer = []
    
    // reduce/crush buffers
    
    this.rawbuffer=prebuff.getChannelData(0)
    
    var countinc = ~~(this.rawbuffer.length / (this.sampleRate*5)) + 1
    
    var groupsize = ~~(this.rawbuffer.length/this.pieces)
    var cmax = 0
    var cmin = 0
    var group = 0
    var vis = []
    for (var j=0;j<this.rawbuffer.length;j += countinc) {
        if (this.rawbuffer[j]>0) {
            cmax = Math.max(cmax,this.rawbuffer[j])
        } else {
            cmin = Math.min(cmin,this.rawbuffer[j])
        }
        if (j > group * groupsize) {
            this.Lowbuffer.push([j/this.sampleRate,cmax,cmin])
            group++
            cmin = 0
            cmax = 0
        }
    }
}



SamplerUI.prototype.draw = function() {
    
    if(this.Lowbuffer==null)
    {
        this.setLowBuffer();
    }
        
    
    var samplerUI=this;
    $("#"+this.container).highcharts({
                               title: {text: ''},
                               chart: {
                                   events: {
                                       selection: function (event) {
                                           if (event.xAxis)
                                            {
                                            samplerUI.sampler.start=parseFloat(event.xAxis[0].min.toFixed(6));
                                            samplerUI.sampler.end=parseFloat(event.xAxis[0].max.toFixed(6));
                                            samplerUI.setSelection();
                                            event.preventDefault();
                                            }
                                        }
                                     },
                                     zoomType: 'x'
                                     },
                               credits: {enabled: false},
                               yAxis: {min: -1.,max: 1},
                               legend: {enabled: false},
                               plotOptions: {series: {states: {hover: {enabled: false }}}},
                               tooltip: {enabled: false},
                               series: [{
                                        animation: false,
                                        name: 'Range',
                                        data: this.Lowbuffer,
                                        type: 'arearange',
                                        lineWidth: 0,
                                        fillOpacity: 0.8,
                                        }]
                               });
    this.setSelection();
};
    

SamplerUI.prototype.setSelection = function() {
    var chart=  $("#"+this.container).highcharts();
    chart.xAxis[0].removePlotBand('plot-band');
    chart.xAxis[0].addPlotBand({from: this.sampler.start,to: this.sampler.end,color: '#E4EDF2',id: 'plot-band'});
}
