(function($, document, window, Raphael, undefined) {
  // jQuery Plugin Factory
  function jQueryPluginFactory( $, name, methods, getters ){
    getters = getters instanceof Array ? getters : [];
    var getters_obj = {};
    for(var i=0; i<getters.length; i++){
      getters_obj[getters[i]] = true;
    }
  
    
    // Create the object
    var Plugin = function(element){
      this.element = element;
    };
    Plugin.prototype = methods;
    
    // Assign the plugin
    $.fn[name] = function(){
      var args = arguments;
      var returnValue = this;
      
      this.each(function() {
        var $this = $(this);
        var plugin = $this.data('plugin-'+name);
        // Init the plugin if first time
        if( !plugin ){
          plugin = new Plugin($this);
          $this.data('plugin-'+name, plugin);
          if(plugin._init){
            plugin._init.apply(plugin, args);
          }
          
        // call a method
        } else if(typeof args[0] == 'string' && args[0].charAt(0) != '_' && typeof plugin[args[0]] == 'function'){
          var methodArgs = Array.prototype.slice.call(args, 1);
          var r = plugin[args[0]].apply(plugin, methodArgs);
          // set the return value if method is a getter
          if( args[0] in getters_obj ){
            returnValue = r;
          }
        }
        
      });
      
      return returnValue; // returning the jQuery object
    };
  };
  
  
  // Some constants
  var WIDTH = 930,
      HEIGHT = 630,
      LABELS_WIDTH = 70;
  
  // Default options
  var defaults = {
    // The styles for the state
    'stateStyles': {
      fill: "rgba(0,0,0,0.80)",
      stroke: "#666",
      "stroke-width": 1,
      "stroke-linejoin": "round",
      scale: [1, 1]
    },
    
    // The styles for the hover
    'stateHoverStyles': {
      fill: "#33c",
      stroke: "#000",
      scale: [1.1, 1.1]
    },
    
    // The time for the animation, set to false to remove the animation
    'stateHoverAnimation': 500,
    
    // State specific styles. 'ST': {}
    'stateSpecificStyles': {},
    
    // State specific hover styles
    'stateSpecificHoverStyles': {},
    
    
    // Events
    'click': {

    },
    
    'mouseover': null,
    
    'mouseout': null,
    
    'clickState': {},
    
    'mouseoverState': {},
    
    'mouseoutState': {},
    
    
    // Labels
    'showLabels' : true,
    
    'labelWidth': 20,
    
    'labelHeight': 15,
    
    'labelGap' : 6,
    
    'labelRadius' : 3,
    
    'labelBackingStyles': {
      fill: "#333",
      stroke: "#666",
      "stroke-width": 1,
      "stroke-linejoin": "round",
      scale: [1, 1]
    },
    
    // The styles for the hover
    'labelBackingHoverStyles': {
      fill: "#33c",
      stroke: "#000"
    },
    
    'stateSpecificLabelBackingStyles': {},
    
    'stateSpecificLabelBackingHoverStyles': {},
    
    'labelTextStyles': {
      fill: "#fff",
      'stroke': 'none',
      'font-weight': 300,
      'stroke-width': 0,
      'font-size': '10px'
    },
    
    // The styles for the hover
    'labelTextHoverStyles': {},
    
    'stateSpecificLabelTextStyles': {},
    
    'stateSpecificLabelTextHoverStyles': {}
  };
  
  
  // Methods
  var methods = {
    /**
     * The init function
     */
    _init: function(options) {
      // Save the options
      this.options = {};
      $.extend(this.options, defaults, options);
      
      // Save the width and height;
      var width = this.element.width();
      var height = this.element.height();
      
      // Calculate the width and height to match the container while keeping the labels at a fixed size
      var xscale = this.element.width()/WIDTH;
      var yscale = this.element.height()/HEIGHT;
      this.scale = Math.min(xscale, yscale);
      this.labelAreaWidth = Math.ceil(LABELS_WIDTH/this.scale); // The actual width with the labels reversed scaled
      
      var paperWidthWithLabels = WIDTH + Math.max(0, this.labelAreaWidth - LABELS_WIDTH);
      // Create the Raphael instances
      this.paper = Raphael(this.element.get(0), paperWidthWithLabels, HEIGHT);//this.element.width(), this.element.height());
      
      // Scale to fit
      this.paper.setSize(width, height);
      this.paper.setViewBox(0, 0, paperWidthWithLabels, HEIGHT, false);
      
      // Keep track of all the states
      this.stateHitAreas = {}; // transparent for the hit area
      this.stateShapes = {}; // for the visual shape
      this.topShape = null;
      
      // create all the states
      this._initCreateStates();
      
      // create the labels for the smaller states
      this.labelShapes = {};
      this.labelTexts = {};
      this.labelHitAreas = {};
      
      // Add the 
    },
    
    /**
     * Create the state objects
     */
    _initCreateStates: function() {
      // TODO: Dynamic attrs
      var attr = this.options.stateStyles;
      var R = this.paper; // shorter name for usage here
      
      // The coords for each state
      var paths = {
        IL: "M 617.80493,301.60133 L 617.80493,297.99662 L 618.06296,293.12969 L 620.43968,289.99286 L 622.21795,286.22646 L 624.80452,282.36371 L 624.43302,277.11131 L 622.42781,273.56874 L 622.33143,270.22206 L 623.02626,264.95255 L 622.20085,257.77418 L 621.13451,241.99673 L 619.84123,226.97939 L 618.91895,215.34019 L 618.64644,214.4188 L 617.83814,211.83223 L 616.54486,208.11404 L 614.92825,206.33577 L 613.47331,203.74921 L 613.23974,198.26025 L 603.33707,199.57249 L 576.13098,201.28716 L 567.44331,200.8585 L 567.67193,203.23045 L 569.95816,203.91632 L 570.87264,205.05943 L 571.32989,206.88841 L 575.21647,210.31775 L 575.90235,212.60398 L 575.21647,216.03332 L 573.38749,219.69128 L 572.70163,222.20612 L 570.4154,224.03511 L 568.58642,224.72098 L 563.3281,226.09271 L 562.64223,227.92169 L 561.95636,229.9793 L 562.64223,231.35104 L 564.47121,232.9514 L 564.24259,237.0666 L 562.4136,238.66696 L 561.72774,240.26732 L 561.72774,243.01079 L 559.89876,243.46803 L 558.2984,244.61115 L 558.06978,245.98289 L 558.2984,248.04049 L 556.58373,249.35506 L 555.55493,252.1557 L 556.01217,255.81365 L 558.2984,263.12958 L 565.61433,270.67413 L 571.10126,274.33209 L 570.87264,278.67592 L 571.78714,280.04766 L 578.18857,280.5049 L 580.93204,281.87664 L 580.24618,285.5346 L 577.95995,291.47879 L 577.27408,294.67951 L 579.5603,298.56609 L 585.96174,303.82441 L 590.5342,304.51028 L 592.59179,309.53998 L 594.6494,312.74069 L 593.73491,315.71278 L 595.33527,319.82799 L 597.16425,321.8856 L 599.10861,321.0933 L 599.7953,318.93012 L 601.8316,317.49228 L 605.06793,316.39174 L 608.15659,317.57154 L 611.03228,318.63788 L 611.82348,318.42804 L 611.75819,317.18606 L 610.69186,314.42072 L 611.12866,312.044 L 613.409,310.47557 L 615.76863,309.48851 L 616.93134,309.06882 L 616.34998,307.74444 L 615.58986,305.57757 L 616.83496,304.31536 z",
        WI: "M 612.94089,197.18116 L 613.31165,194.21124 L 611.69504,189.68474 L 611.0484,183.54165 L 609.91678,181.11674 L 610.88674,178.04519 L 611.69504,175.1353 L 613.14999,172.54874 L 612.50334,169.15387 L 611.8567,165.59734 L 612.34168,163.81907 L 614.28161,161.39416 L 614.44327,158.64593 L 613.63497,157.35265 L 614.28161,154.76608 L 614.76659,151.53287 L 617.51482,145.87476 L 620.42471,139.08502 L 620.58637,136.82177 L 620.26305,135.85181 L 619.45474,136.33679 L 615.25157,142.64155 L 612.50334,146.68306 L 610.56342,148.46133 L 609.75512,150.72457 L 608.30017,151.53287 L 607.16855,153.4728 L 605.7136,153.14948 L 605.55194,151.37121 L 606.84523,148.94631 L 608.94681,144.25815 L 610.72508,142.64155 L 611.8264,140.34999 L 610.19574,139.44474 L 608.824,138.073 L 607.22364,127.78498 L 603.56569,126.64187 L 602.19395,124.35564 L 589.6197,121.61217 L 587.10485,120.46906 L 578.87444,118.18283 L 570.64402,117.03971 L 566.47456,111.63491 L 565.94513,112.89602 L 564.81351,112.73436 L 564.16686,111.60274 L 561.41864,110.79444 L 560.28701,110.9561 L 558.50875,111.92606 L 557.53878,111.27942 L 558.18543,109.33949 L 560.12535,106.26794 L 561.25697,105.13632 L 559.31705,103.68138 L 557.21546,104.48968 L 554.30557,106.4296 L 546.86919,109.66281 L 543.9593,110.30945 L 541.04942,109.82447 L 540.06769,108.94622 L 537.95099,111.7814 L 537.72237,114.52487 L 537.72237,122.9839 L 536.57925,124.58427 L 531.32093,128.47084 L 529.03471,134.41503 L 529.49195,134.64365 L 532.0068,136.70126 L 532.69266,139.90198 L 530.86368,143.10269 L 530.86368,146.98928 L 531.32093,153.61933 L 534.29302,156.59143 L 537.72237,156.59143 L 539.55135,159.79215 L 542.98068,160.24939 L 546.86727,165.96496 L 553.95457,170.08017 L 556.01217,172.82364 L 556.92667,180.25388 L 557.61253,183.5689 L 559.89876,185.16926 L 560.12738,186.541 L 558.06978,189.97033 L 558.2984,193.17106 L 560.81325,197.05764 L 563.3281,198.20075 L 566.30019,198.65799 L 567.64253,200.03811 L 576.81603,200.03809 L 602.88316,198.55122 z",
        MI: "M 581.61931,82.059006 L 583.4483,80.001402 L 585.62022,79.201221 L 590.99286,75.314624 L 593.27908,74.743065 L 593.73634,75.200319 L 588.59232,80.344339 L 585.27728,82.287628 L 583.21967,83.202124 z M 667.79369,114.18719 L 668.44033,116.69293 L 671.67355,116.85459 L 672.96684,115.64213 C 672.96684,115.64213 672.88601,114.18719 672.56269,114.02552 C 672.23936,113.86386 670.94608,112.16642 670.94608,112.16642 L 668.76366,112.40891 L 667.14704,112.57057 L 666.82372,113.7022 z M 697.86007,177.23689 L 694.62686,168.9922 L 692.36361,159.93922 L 689.93871,156.70601 L 687.35214,154.92774 L 685.73554,156.05937 L 681.85568,157.83763 L 679.91576,162.84911 L 677.16753,166.5673 L 676.03591,167.21394 L 674.58096,166.5673 C 674.58096,166.5673 671.9944,165.11235 672.15606,164.46571 C 672.31772,163.81907 672.64104,159.45424 672.64104,159.45424 L 676.03591,158.16095 L 676.84421,154.76608 L 677.49085,152.17952 L 679.91576,150.56291 L 679.59244,140.53996 L 677.97583,138.27672 L 676.68255,137.46841 L 675.87425,135.36683 L 676.68255,134.55853 L 678.29915,134.88185 L 678.46081,133.26524 L 676.03591,131.00199 L 674.74262,128.41543 L 672.15606,128.41543 L 667.62956,126.96048 L 662.13311,123.56561 L 659.38488,123.56561 L 658.73824,124.21226 L 657.76827,123.72727 L 654.69673,121.46403 L 651.78684,123.24229 L 648.87695,125.50554 L 649.20027,129.06207 L 650.17023,129.38539 L 652.27182,129.87037 L 652.7568,130.67867 L 650.17023,131.48698 L 647.58367,131.8103 L 646.12872,133.58856 L 645.8054,135.69015 L 646.12872,137.30675 L 646.45204,142.80321 L 642.89551,144.9048 L 642.24887,144.74313 L 642.24887,140.53996 L 643.54215,138.11506 L 644.1888,135.69015 L 643.38049,134.88185 L 641.44057,135.69015 L 640.4706,139.89332 L 637.72238,141.02494 L 635.94411,142.96487 L 635.78245,143.93483 L 636.42909,144.74313 L 635.78245,147.3297 L 633.5192,147.81468 L 633.5192,148.94631 L 634.32751,151.37121 L 633.19588,157.51431 L 631.57928,161.55582 L 632.22592,166.24398 L 632.7109,167.3756 L 631.9026,169.80051 L 631.57928,170.60881 L 631.25596,173.35704 L 634.81249,179.33847 L 637.72238,185.80489 L 639.17732,190.65471 L 638.36902,195.34286 L 637.39906,201.3243 L 634.97415,206.49743 L 634.65083,209.24566 L 631.39196,212.33081 L 635.80057,212.16876 L 657.21906,209.90551 L 664.4969,208.91845 L 664.59327,210.5848 L 671.44521,209.37234 L 681.74329,207.86921 L 685.59749,207.4083 L 685.73554,206.82075 L 685.8972,205.36581 L 687.99878,201.64762 L 689.99934,199.90977 L 689.77705,194.85788 L 691.37404,193.26089 L 692.46466,192.91795 L 692.68694,189.36142 L 694.22271,186.3303 L 695.2735,186.93652 L 695.43516,187.58316 L 696.24347,187.74482 L 698.18339,186.77486 z M 567.49209,111.21318 L 568.20837,110.63278 L 570.9566,109.82447 L 574.51313,107.56123 L 574.51313,106.59126 L 575.15978,105.94462 L 581.14121,104.97466 L 583.56612,103.03473 L 587.93095,100.93315 L 588.09261,99.639864 L 590.03254,96.729975 L 591.8108,95.921673 L 593.10409,94.143408 L 595.36733,91.880161 L 599.73217,89.455254 L 604.42032,88.970273 L 605.55194,90.101896 L 605.22862,91.071859 L 601.51043,92.041822 L 600.05549,95.113371 L 597.79224,95.921673 L 597.30726,98.34658 L 594.88235,101.57979 L 594.55903,104.16636 L 595.36733,104.65134 L 596.3373,103.51972 L 599.89383,100.60983 L 601.18711,101.90311 L 603.45036,101.90311 L 606.68357,102.87307 L 608.13851,104.0047 L 609.59345,107.07625 L 612.34168,109.82447 L 616.22153,109.66281 L 617.67648,108.69285 L 619.29308,109.98613 L 620.90969,110.47112 L 622.20297,109.66281 L 623.33459,109.66281 L 624.9512,108.69285 L 628.99271,105.13632 L 632.38758,104.0047 L 639.01566,103.68138 L 643.54215,101.74145 L 646.12872,100.44817 L 647.58367,100.60983 L 647.58367,106.26794 L 648.06865,106.59126 L 650.97853,107.39957 L 652.91846,106.91458 L 659.06156,105.29798 L 660.19318,104.16636 L 661.64813,104.65134 L 661.64813,111.60274 L 664.88134,114.67429 L 666.17462,115.32093 L 667.4679,116.29089 L 666.17462,116.61421 L 665.36632,116.29089 L 661.64813,115.80591 L 659.54654,116.45255 L 657.28329,116.29089 L 654.05008,117.74584 L 652.27182,117.74584 L 646.45204,116.45255 L 641.27891,116.61421 L 639.33898,119.20078 L 632.38758,119.84742 L 629.96267,120.65572 L 628.83105,123.72727 L 627.53777,124.8589 L 627.05279,124.69724 L 625.59784,123.08063 L 621.07135,125.50554 L 620.42471,125.50554 L 619.29308,123.88893 L 618.48478,124.05059 L 616.54486,128.41543 L 615.57489,132.45694 L 612.39377,139.45774 L 611.21701,138.42347 L 609.84527,137.39215 L 607.90449,127.10413 L 604.36001,125.73408 L 602.30743,123.44785 L 590.18707,120.70437 L 587.3318,119.67473 L 579.10138,117.50199 L 571.21139,116.35887 z",
        IN: "M 618.42049,300.8552 L 618.48577,297.99662 L 618.97076,293.47011 L 621.234,290.56023 L 623.01228,286.68036 L 625.59884,282.47719 L 625.11386,276.6574 L 623.3356,273.90917 L 623.01228,270.67596 L 623.82058,265.17949 L 623.3356,258.22808 L 622.0423,242.22367 L 620.74902,226.86591 L 619.77855,215.14589 L 622.84961,216.0354 L 624.30456,217.00536 L 625.43618,216.68204 L 627.53777,214.74212 L 630.36734,213.12513 L 635.46014,212.96309 L 657.44601,210.69983 L 663.02174,210.16667 L 664.52488,226.12288 L 668.77623,262.96443 L 669.37469,268.73603 L 669.00319,270.99928 L 670.23117,272.79465 L 670.32756,274.1672 L 667.80627,275.76671 L 664.26684,277.31802 L 661.06471,277.8683 L 660.46625,282.73523 L 655.89156,286.0477 L 653.09514,290.05814 L 653.41846,292.43487 L 652.83712,293.96907 L 649.51065,293.96907 L 647.92512,292.35247 L 645.43181,293.61467 L 642.74885,295.11781 L 642.91052,298.17226 L 641.71673,298.43029 L 641.24885,297.41215 L 639.08197,295.90901 L 635.83165,297.25049 L 634.28034,300.25674 L 632.8425,299.44844 L 631.38755,297.84893 L 626.92321,298.33392 L 621.33038,299.30388 z",
        OH: "M 731.43589,195.0077 L 725.34235,199.06105 L 721.4625,201.3243 L 718.06763,205.04249 L 714.02612,208.92234 L 710.79291,209.73064 L 707.88302,210.21562 L 702.38656,212.80219 L 700.28498,212.96385 L 696.89011,209.8923 L 691.71697,210.53895 L 689.13041,209.084 L 686.74934,207.73317 L 681.85677,208.43658 L 671.67215,210.05319 L 663.91243,211.26565 L 665.20572,225.89593 L 666.98399,239.6371 L 669.57055,263.0779 L 670.13637,267.90907 L 674.25872,267.78005 L 676.68363,266.97174 L 680.04743,268.47488 L 682.11792,272.83971 L 687.25686,272.82261 L 689.1486,274.94131 L 690.90977,274.87601 L 693.44816,273.53455 L 695.95233,273.90605 L 697.92646,275.361 L 699.65343,273.22832 L 701.99908,271.93504 L 704.06957,271.25419 L 704.71621,274.00243 L 706.49449,274.97239 L 709.97018,277.31646 L 712.1526,277.23564 L 713.29822,276.08691 L 713.23293,274.70038 L 714.84954,273.24542 L 715.0112,268.23395 C 715.0112,268.23395 715.98116,264.35409 715.98116,264.35409 L 717.5014,262.91312 L 719.02163,263.8178 L 719.84704,265.02868 L 721.05794,264.85305 L 720.63513,262.44212 L 720.07087,261.7986 L 720.07087,259.37368 L 721.04084,258.0804 L 723.30408,254.68553 L 724.59737,253.23058 L 726.69896,253.71556 L 728.96221,252.09895 L 732.03376,248.70408 L 734.29702,244.82422 L 734.50686,239.39306 L 734.99184,234.38157 L 734.99184,229.69341 L 733.86022,226.62186 L 734.83018,225.16691 L 735.75069,224.2123 L 734.34578,214.36947 z",
        MN: "M 471.87905,128.47084 L 471.4218,120.0118 L 469.59282,112.69588 L 467.76384,99.207152 L 467.30659,89.376374 L 465.47761,85.947031 L 463.87725,80.917336 L 463.87725,70.629316 L 464.56311,66.742729 L 462.74218,61.291062 L 492.8746,61.326333 L 493.19792,53.081649 L 493.84456,52.919988 L 496.10781,53.40497 L 498.04773,54.213272 L 498.85603,59.709728 L 500.31098,65.852826 L 501.92758,67.469431 L 506.7774,67.469431 L 507.10072,68.924375 L 513.40548,69.247696 L 513.40548,71.349282 L 518.25529,71.349282 L 518.57861,70.055998 L 519.71023,68.924375 L 521.97348,68.277733 L 523.26676,69.247696 L 526.17665,69.247696 L 530.0565,71.834263 L 535.3913,74.25917 L 537.81621,74.744152 L 538.30119,73.774189 L 539.75613,73.289207 L 540.24111,76.199096 L 542.82768,77.49238 L 543.31266,77.007398 L 544.60595,77.169059 L 544.60595,79.270645 L 547.19251,80.240608 L 550.26406,80.240608 L 551.88067,79.432305 L 555.11388,76.199096 L 557.70044,75.714115 L 558.50875,77.49238 L 558.99373,78.785663 L 559.96369,78.785663 L 560.93365,77.977361 L 569.82498,77.65404 L 571.60324,80.725589 L 572.24989,80.725589 L 572.9635,79.64131 L 577.40341,79.270645 L 576.79131,81.550104 L 572.85259,83.387229 L 563.60681,87.448357 L 558.83207,89.455254 L 555.76052,92.041822 L 553.33561,95.598352 L 551.07237,99.478203 L 549.2941,100.28651 L 544.76761,105.29798 L 543.47432,105.45964 L 539.63268,108.39354 L 536.81624,111.55445 L 536.58762,114.52487 L 536.81457,122.30306 L 535.21755,123.90342 L 529.95924,128.01694 L 528.12691,133.73419 L 530.6451,137.38211 L 531.10402,139.90198 L 529.95589,142.87575 L 529.72893,146.53538 L 530.18618,153.61933 L 533.61218,157.72618 L 536.58762,157.72618 L 539.09745,160.01909 L 542.29984,161.38414 L 545.95948,166.41886 L 553.04677,171.44186 L 554.87742,173.50448 L 555.11107,179.00649 L 534.52332,179.69236 L 474.27457,180.15128 L 473.93665,144.47443 L 473.47941,141.50234 L 469.3642,138.073 L 468.22108,136.24402 L 468.22108,134.64365 L 470.27868,133.0433 L 471.65042,131.67156 z",
        IA: "M 566.59351,201.62843 L 566.76414,203.57088 L 569.05036,204.71064 L 570.1918,205.96722 L 570.53556,207.22883 L 574.42215,210.43123 L 575.10802,212.60398 L 574.30868,215.46595 L 572.82012,219.01043 L 572.02078,221.75222 L 569.84803,223.35426 L 568.13252,223.92666 L 562.64725,225.41186 L 561.96138,227.69475 L 561.16204,229.9793 L 561.73443,231.35104 L 563.44994,233.06488 L 563.44826,236.72617 L 561.27886,238.32653 L 560.81995,239.81342 L 560.81995,242.32994 L 559.33139,242.78718 L 557.61755,244.15725 L 557.16198,245.64246 L 557.61755,247.35964 L 556.24331,248.56409 L 553.94955,245.87276 L 552.46601,243.24611 L 544.12548,244.04544 L 533.95428,244.61617 L 508.91758,245.30372 L 495.88274,245.53234 L 486.50922,245.76096 L 485.19344,245.88221 L 483.53879,241.41044 L 483.31017,234.78037 L 481.70981,230.66516 L 481.02395,225.40685 L 478.73772,221.74888 L 477.82324,216.94781 L 475.07976,209.40326 L 473.93665,204.03062 L 472.56491,201.85871 L 470.96455,199.11525 L 472.79353,194.77142 L 474.16527,189.05585 L 471.4218,186.99824 L 470.96455,184.25477 L 471.87905,181.73992 L 473.59372,181.73992 L 485.13916,181.73992 L 534.75027,181.05405 L 554.62705,180.36819 L 556.47778,183.115 L 558.31012,185.73663 L 558.76569,186.541 L 556.93503,189.28949 L 557.3906,193.51148 L 559.90546,197.39807 L 562.8742,199.22202 L 565.27892,199.45232 z",
        MO: "M 555.78857,249.52738 L 553.2687,246.44013 L 552.12558,244.1539 L 544.35242,244.83977 L 534.52164,245.29701 L 509.14453,246.21151 L 495.6558,246.44013 L 487.76835,246.55444 L 485.48209,246.66875 L 486.73952,249.1836 L 486.5109,251.46982 L 489.02574,255.35641 L 492.11214,259.47162 L 495.19855,262.21509 L 497.48478,262.44371 L 498.85651,263.35821 L 498.85651,266.3303 L 497.02754,267.93066 L 496.57028,270.21688 L 498.62789,273.64623 L 501.14275,276.61832 L 503.65759,278.4473 L 505.02932,290.10705 L 504.34346,325.42926 L 504.57208,330.11601 L 505.02932,335.49952 L 528.46231,335.3827 L 551.66834,334.69683 L 572.473,333.89582 L 584.12774,333.66552 L 586.29714,337.09152 L 585.61295,340.39902 L 582.5257,342.80206 L 581.95331,344.6394 L 587.3318,345.09666 L 591.22676,344.41078 L 592.94394,338.91715 L 593.59536,333.06036 L 595.91436,331.03553 L 597.62651,329.54864 L 599.68412,328.519 L 599.79926,325.65871 L 600.37334,323.9432 L 599.34202,322.19493 L 596.59688,322.3395 L 594.42748,319.71451 L 593.05406,315.48584 L 593.85507,312.96764 L 591.91094,309.53998 L 590.0803,304.96418 L 585.28089,304.16484 L 578.31209,298.56609 L 576.59323,294.45256 L 577.39258,291.25184 L 579.45185,285.19417 L 579.91077,282.33054 L 577.96163,281.29923 L 571.10629,280.50156 L 570.07832,278.7894 L 569.96652,274.55904 L 564.47958,271.12803 L 557.50407,263.35653 L 555.21785,256.0406 L 554.98756,251.81528 z",
        ND: "M 471.30528,127.66846 L 470.94037,120.17229 L 468.95092,112.85637 L 467.12193,99.207152 L 466.66469,89.376374 L 464.67523,86.267982 L 463.07487,80.917336 L 463.07487,70.629316 L 463.76073,66.742729 L 461.64538,61.243718 L 433.22188,60.679691 L 414.63093,60.033049 L 388.11861,58.739765 L 363.17227,56.855896 L 361.91155,71.086559 L 360.53981,86.175663 L 358.28133,111.12326 L 357.79515,122.14348 L 414.61127,125.90763 z",
        SD: "M 472.79706,203.1809 L 471.84336,202.10003 L 470.32265,198.47334 L 472.15163,194.77142 L 473.20241,189.21633 L 470.61942,187.15872 L 470.32265,184.41526 L 470.91618,181.41897 L 473.06612,180.61658 L 473.36289,174.88124 L 473.29475,144.79538 L 472.67702,141.82329 L 468.56181,138.23348 L 467.57918,136.24402 L 467.57918,134.3227 L 469.4763,133.0433 L 471.00852,131.19013 L 471.19098,128.47084 L 413.80889,126.87049 L 357.63468,122.9839 L 356.86798,128.26326 L 355.25497,144.1315 L 353.90976,162.07837 L 352.30941,186.67509 L 368.33718,187.70389 L 387.97453,188.847 L 405.96758,190.15059 L 429.74434,191.45417 L 440.4896,190.67598 L 443.34959,192.96221 L 447.66923,195.93431 L 448.65187,196.68831 L 452.19331,195.798 L 456.24038,195.50124 L 458.98385,195.43309 L 462.09665,196.64436 L 466.64491,198.08424 L 469.77747,199.84507 L 470.3952,201.76638 L 471.30969,203.66351 L 472.01534,203.18207 z",
        NE: "M 484.24444,246.9897 L 485.61618,249.66503 L 485.70851,251.79078 L 488.06288,255.51689 L 490.78217,258.66923 L 485.73269,258.66923 L 442.25013,257.73055 L 401.46327,256.84025 L 380.27171,255.8796 L 381.34448,234.55175 L 347.96558,231.80828 L 352.30941,187.79842 L 367.85574,188.82723 L 387.97453,189.97033 L 405.8071,191.11345 L 429.58386,192.25656 L 440.32912,191.79932 L 442.38672,194.08554 L 447.1878,197.05764 L 448.33091,197.97213 L 452.67474,196.60039 L 456.56133,196.14315 L 459.3048,195.91452 L 461.13378,197.28626 L 466.16348,198.88662 L 469.13557,200.48698 L 469.59282,202.08734 L 470.50731,204.14494 L 472.33629,204.14494 L 473.13427,204.19111 L 474.11689,209.40326 L 476.86037,217.42924 L 478.09582,222.06983 L 480.22156,225.88828 L 480.74695,230.82564 L 482.18684,235.10132 L 482.73641,241.57092",
        KS: "M 503.38059,325.13028 L 490.76233,325.33471 L 444.67324,324.87748 L 400.11576,322.81985 L 375.48602,321.56244 L 379.62981,256.84247 L 401.46327,257.64264 L 441.92918,259.01437 L 486.05364,259.47162 L 491.14927,259.47162 L 494.39617,262.69652 L 497.16383,262.92514 L 498.05413,264.00011 L 498.05413,266.00934 L 496.22515,267.60971 L 495.7679,270.21688 L 497.98598,273.80671 L 500.50084,276.93927 L 503.01569,278.92873 L 504.06646,290.10705 z",
      }
      
      // Create the actual objects
      var stateAttr = {};
      for(var state in paths) {
        stateAttr = {};
        if(this.options.stateSpecificStyles[state]) {
          $.extend(stateAttr, attr, this.options.stateSpecificStyles[state]);
        } else {
          stateAttr = attr;
        }
        this.stateShapes[state] = R.path(paths[state]).attr(stateAttr);
        this.topShape = this.stateShapes[state];
        
        this.stateHitAreas[state] = R.path(paths[state]).attr({fill: "#000",
      "stroke-width": 0, "opacity" : 0.0, 'cursor': 'pointer'});
        this.stateHitAreas[state].node.dataState = state;
      }
      
      // Bind events
      this._onClickProxy = $.proxy(this, '_onClick');
      this._onMouseOverProxy = $.proxy(this, '_onMouseOver'),
      this._onMouseOutProxy = $.proxy(this, '_onMouseOut');
        
      for(var state in this.stateHitAreas) {
        this.stateHitAreas[state].toFront();
        $(this.stateHitAreas[state].node).bind('mouseout', this._onMouseOutProxy);
        $(this.stateHitAreas[state].node).bind('click', this._onClickProxy);
        $(this.stateHitAreas[state].node).bind('mouseover', this._onMouseOverProxy);
        
      }
    },
    
    
    
    /**
     * Create the labels
     */

    
    
    /**
     * Get the state Raphael object
     */
    _getStateFromEvent: function(event) {
      // first get the state name
      var stateName = (event.target && event.target.dataState) || (event.dataState);
      return this._getState(stateName);
    },
    
    
    /**
     *
     */
    _getState: function(stateName) {
      var stateShape = this.stateShapes[stateName];
      var stateHitArea = this.stateHitAreas[stateName];
      var labelBacking = this.labelShapes[stateName];
      var labelText = this.labelTexts[stateName];
      var labelHitArea = this.labelHitAreas[stateName]
      
      return {
        shape: stateShape, 
        hitArea: stateHitArea, 
        name: stateName, 
        labelBacking: labelBacking, 
        labelText: labelText, 
        labelHitArea: labelHitArea
      };
    },
    
    
    
    /**
     * The mouseout handler
     */
    _onMouseOut: function(event) {
      var stateData = this._getStateFromEvent(event);
      
      // Stop if no state was found
      if(!stateData.hitArea) {
        return;
      }
      
      return !this._triggerEvent('mouseout', event, stateData);

    },
    
    
    /**
     *
     */
    _defaultMouseOutAction: function(stateData) {
      // hover effect
      // ... state shape
      var attrs = {};
      if(this.options.stateSpecificStyles[stateData.name]) {
        $.extend(attrs, this.options.stateStyles, this.options.stateSpecificStyles[stateData.name]);
      } else {
        attrs = this.options.stateStyles;
      }
      
      stateData.shape.animate(attrs, this.options.stateHoverAnimation);
      
      
      // ... for the label backing
      if(stateData.labelBacking) {
        var attrs = {};
        
        if(this.options.stateSpecificLabelBackingStyles[stateData.name]) {
          $.extend(attrs, this.options.labelBackingStyles, this.options.stateSpecificLabelBackingStyles[stateData.name]);
        } else {
          attrs = this.options.labelBackingStyles;
        }
        
        stateData.labelBacking.animate(attrs, this.options.stateHoverAnimation);
      }
    },
    
    
    /**
     * The click handler
     */
    _onClick: function(event) {
      var stateData = this._getStateFromEvent(event);
      
      // Stop if no state was found
      if(!stateData.hitArea) {
        return;
      }
      
      return !this._triggerEvent('click', event, stateData);
    },
    
    
    
    /**
     * The mouseover handler
     */
    _onMouseOver: function(event) {
      var stateData = this._getStateFromEvent(event);
      
      // Stop if no state was found
      if(!stateData.hitArea) {
        return;
      }
      
      return !this._triggerEvent('mouseover', event, stateData);
    },
    
    
    
    /**
     * The default on hover action for a state
     */
    _defaultMouseOverAction: function(stateData) {
      // hover effect
      this.bringShapeToFront(stateData.shape);
      this.paper.safari();
      
      // ... for the state
      var attrs = {};
      if(this.options.stateSpecificHoverStyles[stateData.name]) {
        $.extend(attrs, this.options.stateHoverStyles, this.options.stateSpecificHoverStyles[stateData.name]);
      } else {
        attrs = this.options.stateHoverStyles;
      }
      
      stateData.shape.animate(attrs, this.options.stateHoverAnimation);
      
      // ... for the label backing
      if(stateData.labelBacking) {
        var attrs = {};
        
        if(this.options.stateSpecificLabelBackingHoverStyles[stateData.name]) {
          $.extend(attrs, this.options.labelBackingHoverStyles, this.options.stateSpecificLabelBackingHoverStyles[stateData.name]);
        } else {
          attrs = this.options.labelBackingHoverStyles;
        }
        
        stateData.labelBacking.animate(attrs, this.options.stateHoverAnimation);
      }
    },
    
    
    
    
    
    
    /**
     * Trigger events
     *
     * @param type string - the type of event
     * @param event Event object - the original event object
     * @param stateData object - information about the state
     *
     * return boolean - true to continue to default action, false to prevent the default action
     */
    _triggerEvent: function(type, event, stateData) {
      var name = stateData.name;
      var defaultPrevented = false;
      
      // State specific
      var sEvent = $.Event('usmap'+type+name);
      sEvent.originalEvent = event;
      
      // Do the one in options first
      if(this.options[type+'State'][name]) {
        defaultPrevented = this.options[type+'State'][name](sEvent, stateData) === false;
      }
      
      // Then do the bounded ones
      if(sEvent.isPropagationStopped()) {
        this.element.trigger(sEvent, [stateData]);
        defaultPrevented = defaultPrevented || sEvent.isDefaultPrevented();
      }
      
      
      // General
      if(!sEvent.isPropagationStopped()) {
        var gEvent = $.Event('usmap'+type);
        gEvent.originalEvent = event;
        
        // Options handler first
        if(this.options[type]) {
          defaultPrevented = this.options[type](gEvent, stateData) === false || defaultPrevented;
        }
        
        // Bounded options next
        if(!gEvent.isPropagationStopped()) {
          this.element.trigger(gEvent, [stateData]);
          defaultPrevented = defaultPrevented || gEvent.isDefaultPrevented();
        }
      }
      
      // Do the default action
      if(!defaultPrevented) {
        switch(type) {
          case 'mouseover':
            this._defaultMouseOverAction(stateData);
            break;
          
          case 'mouseout': 
            this._defaultMouseOutAction(stateData);
            break;
        }
      }
      
      return !defaultPrevented;
    },
    
    
    /**
     *
      @param string state - The two letter state abbr
     */
    trigger: function(state, type, event) {
      type = type.replace('usmap', ''); // remove the usmap if they added it
      state = state.toUpperCase(); // ensure state is uppercase to match
      
      var stateData = this._getState(state);
      
      this._triggerEvent(type, event, stateData);
    },
    
    
    /**
     * Bring a state shape to the top of the state shapes, but not above the hit areas
     */
    bringShapeToFront: function(shape) {
      if(this.topShape) {
        shape.insertAfter(this.topShape);
      }
      this.topShape = shape;
    }
  };
  
  
  // Getters
  var getters = [];
  
  
  // Create the plugin
  jQueryPluginFactory($, 'usmap', methods, getters);

})(jQuery, document, window, Raphael);