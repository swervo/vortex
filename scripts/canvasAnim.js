(function(thisAppCanvas) {
    "use strict";

    var
    // elements
    theCanvas, context, particleImage,
    // containers
    pointArray = [],
    // variables
    fillStyle, animSpeed,
    // constants
    FOV = 180;
    
    function init() {
        
        theCanvas = $("canvas").get(0);
        context = theCanvas.getContext("2d");
        particleImage = new Image();
        particleImage.src = "assets/particle.png";
        // set the fill style to solid black initially;
        fillStyle = "rgb(0,0,0)";
        // set the anim speed to moderate
        animSpeed = 4;
        
        context.translate(160, 60);
        
        for(var i = 0 ; i < 20; i++) {
            // make a random point
            var p1 = new Point3D(randomRange(-100,100),randomRange(-100,100),randomRange(-FOV,FOV));
        
            // and then make 4 points that start at that point and
            // gradually get further away. In other words, the points
            // are in bunches of 4 in a line.
            
            // for(var j = 0; j<1; j++) {
            //  pointArray.push(new Point3D(p1.x, p1.y, p1.z+(j*15)));
            // }
            pointArray.push(p1);
        }
        setInterval(loop, 1000 / 30);
    }
    
    function loop() {
        var i;
        // console.log("calling loop");
        // the composite operation dictates how each draw operation
        // is blended with what is underneath. The default is
        // 'source-over' which means the new stuff obliterates the
        // old stuff.
        
        context.globalCompositeOperation = "source-over";
        
        // clear the canvas
        // context.fillStyle="rgb(0,0,0)";
        context.globalAlpha = 1;


        // context.fillStyle="rgba(0,0,0,0.1)";
        context.fillStyle = fillStyle;
        context.fillRect(-160,-60, 320, 120);
      
        context.globalCompositeOperation = "lighter";
        context.globalAlpha = 0.9;

        // iterate through each point
        for (i = 0; i < pointArray.length; i++) {
            var point = pointArray[i];
            
            // This is moving towards the viewer
            point.z -= animSpeed;

            if (point.z < -FOV) {
                // change the x and y of the point here
                point.x = randomRange(-100,100);
                point.y = randomRange(-100,100);
                point.z = point.z + FOV + FOV;
                // point.update();
            }
            // render it
            draw3Din2D(point, context);
        }
    }
    
    function Point3D(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    Point3D.prototype = {
        update: function() {
            console.log("update");
        }
    };
                
    function draw3Din2D(p3d, c) {
        // first, work out how small it should be
        // using the z pos ( how far away it is :) )
        var scale = FOV/(FOV + p3d.z);
        
        // if the particle is behind the camera, or if it's too big then don't draw it!
        if ( scale < 0 || scale > 12 ) {
            return;
        }
        
        // then multiply the 3D x and y by this scale
        // to get the 2D x and y.
        var x2d = (p3d.x * scale);
        var y2d = (p3d.y * scale);
        
        context.save();
        context.translate(x2d, y2d);
        // adjust the size dependent on the calculated scale factor
        // (1 is just an adjuster to make it a little bigger/smaller if required)
        context.scale(scale*1, scale*1);
        context.translate(particleImage.width * -0.5, particleImage.height * -0.5 );
        context.drawImage(particleImage, 0,0);

        context.restore();
    }
    
    function randomRange(min, max) {
        return ((Math.random()*(max-min)) + min);
    }
    
    thisAppCanvas.initCanvas = function() {
        init();
    };
    
    thisAppCanvas.warp = function() {
        fillStyle = "rgba(0,0,0,0.1)";
        animSpeed = 12;
    };
    
    thisAppCanvas.wane = function() {
        var timerObject, increments = 10, alpha = 0;
        timerObject = setInterval(function() {
            if (increments > 0) {
                increments--;
                if (animSpeed > 4) {
                    animSpeed--;
                }
                fillStyle = "rgba(0,0,0," + alpha++/10 + ")";
            } else {
                fillStyle = "rgb(0,0,0)";
                animSpeed = 4;
                clearInterval(timerObject);
            }
        }, 200);
    };

})(vortexApp.canvas);