var vortexApp = {
    utils: {},
    canvas: {}
};

(function(thisApp) {
    "use strict";
    var
    // references
    viewIndex, pos, dragImgSrc,
    // state variables
    isDragging, startX, startY, isInVortex,
    // individual elements
    carousel, textEntryBox, sendButton, sendTextForm, expandable,
    dragImage, dragWrapper, currentItem;
    
    function init() {
        var showText, endZoomIn, preventScroll, swipeDirection, swipeObj = {};
        function showText() {
            var vText = textEntryBox[0].value;
            textEntryBox[0].value = "";
            textEntryBox[0].blur();
            expandable.innerHTML = "<span class='" + "editorText" + "' >" + vText + "</span>";
            expandable.addEventListener("webkitAnimationEnd", endZoomIn);
            expandable.style.webkitAnimationName = "warpOne";
            thisApp.canvas.warp();
            
        }
        
        function endZoomIn() {
            expandable.removeEventListener("webkitAnimationEnd", endZoomIn);
            expandable.style.webkitAnimationName =  "";
            thisApp.canvas.wane();
        }

        function preventScroll() {
            $("body").bind(thisApp.utils.touchmove, function(e){
                e.preventDefault();
            });
        }

        function startSwipe(e) {
            e.preventDefault();
            swipeObj.x1 = e.pageX;
            swipeObj.y1 = e.pageY;
            carousel.bind("mouseup", function(e){
                swipeObj.x2 = e.pageX;
                swipeObj.y2 = e.pageY;
                
                carousel.unbind("mouseup");
                carousel.trigger("swipe" + swipeDirection(swipeObj.x1, swipeObj.x2,
                    swipeObj.y1, swipeObj.y2));
                
            });
            // carousel.trigger("swipeLeft");
        }
        
        function swipeDirection(x1, x2, y1, y2) {
            var yDelta = Math.abs(y1 - y2);
            if (yDelta < 50) {
                return (x1 - x2 > 0 ? "Left" : "Right");
            }
        }
        
        
        pos = $("header .carousel div:nth-child(3)").offset();
        textEntryBox = $("#message");
        sendButton = $("#send");
        sendTextForm = $("#sendTextForm");
        expandable = document.getElementById("expandable");
        sendButton.bind("click", function(){
            showText();
        });
        //event listeners
        sendTextForm.bind("submit", function(e){
            e.preventDefault();
            showText();
        });
        
        carousel = $(".carousel").swipeLeft(function(e){
            removeImageDrag(e);
            switchImage(true);
        }).swipeRight(function(e){
            removeImageDrag(e);
            switchImage(false);
        });
        
        if (!thisApp.utils.isMobile) {
            // my own hacky mouse based swipings
            carousel.bind("mousedown", startSwipe);
        }
        
        // console.log(thisApp.utils.touchstart);
        currentItem = $("header .carousel div:nth-child(3)").bind(thisApp.utils.touchstart, dragStart);
        
        preventScroll();
    }
    
    function endSendPicture() {
        dragWrapper.unbind("webkitTransitionEnd", endSendPicture);
        dragWrapper.css({
            "-webkit-transform": "translateX(" + pos.left + "px)" + " translateY(" + pos.top + "px)",
            "-webkit-transition-duration": "100ms"
        });
        setTimeout(function() {
            // dragWrapper = $(dragWrapper.remove());
            dragWrapper.remove();
            thisApp.canvas.wane();
        }, 0);
    }
    
    function resetPicture() {
        console.log("calling resetPicture");
        dragWrapper.unbind("webkitTransitionEnd", resetPicture);
        dragWrapper.css({
            "-webkit-transform": "translateX(" + pos.left + "px)" + " translateY(" + pos.top + "px)",
            "-webkit-transition-duration": "100ms"
        });
        setTimeout(function() {
            // dragWrapper = $(dragWrapper.remove());
            dragWrapper.remove();
        }, 0);
    }
    
    
    function removeImageDrag(e) {
        e.preventDefault();
        currentItem.unbind(thisApp.utils.touchstart, dragStart);
    }
    
    function addImageDrag() {
        currentItem = $("header .carousel div:nth-child(3)").bind(thisApp.utils.touchstart, dragStart);
    }
    
    function dragStart(e) {
        var touchObj;
        
        if (thisApp.utils.isMobile) {
            if (e.targetTouches.length !== 1) {
                return false;
            }
            touchObj = e.targetTouches[0];
        } else {
            touchObj = e;
            e.preventDefault();
        }
        // e.targetTouches[0].stopPropagation();

        // get the coordinates of the touch here
        startX = touchObj.pageX;
        startY = touchObj.pageY;
        dragImgSrc = touchObj.target.src;
        currentItem.bind(thisApp.utils.touchmove, dragMove);
    }
    
    function dragMove(e) {
        // console.log("calling");
        var touchObj, dX, dY;
        if (thisApp.utils.isMobile) {
            touchObj = e.changedTouches[0];
        } else {
            touchObj = e;
        }
        
        //create the duplicate image here
        if (!isDragging) {
            isDragging = true;
            if (!dragImage) {
                dragWrapper = $(document.createElement("div"));
                dragImage = $(document.createElement("img"));
                dragWrapper.addClass("dragWrapper");
                dragImage.addClass("dragImage").attr("src", dragImgSrc);
                dragWrapper.append(dragImage);
            } else {
                dragImage.attr("src", dragImgSrc);
            }
            $("body").append(dragWrapper);
            if (!thisApp.utils.isMobile) {
                //remove the original eventmove handler
                currentItem.unbind(thisApp.utils.touchmove, dragMove);
                // add a handler for the mousemove
                dragWrapper.bind(thisApp.utils.touchmove, dragMove);
                dragWrapper.bind(thisApp.utils.touchend, dragEnd);
            } else {
                // seems that you cannot add the touchend event to the generated element
                // hence adding it to the original element
                // unlike mouse events touch events are broadcast to all subscribed elements
                // subscribed elements don't even need to be the target of the event
                currentItem.bind(thisApp.utils.touchend, dragEnd);
            }
        }
        
        dX = touchObj.pageX - startX;
        dY = touchObj.pageY - startY;
        dragWrapper.css("-webkit-transform", "translate(" + (pos.left + dX) + "px," + (pos.top + dY) + "px)");
        // this.element.style.webkitTransform = 'translate(' + x + 'px, ' + y + 'px)';
        if (touchObj.pageY > 300) {
            // it's in the vortex
            if (!isInVortex) {
                isInVortex = true;
                // add vortex styling
                dragImage.addClass("inVortex");
            }
        } else {
            if (isInVortex) {
                isInVortex = false;
                // remove vortex styling
                dragImage.removeClass("inVortex");
            }
        }
    }
    
    function dragEnd() {
        if (thisApp.utils.isMobile) {
            // $(this).unbind(thisApp.utils.touchmove);
            currentItem.unbind(thisApp.utils.touchmove, dragMove);
            currentItem.unbind(thisApp.utils.touchend, dragEnd);
            // $(this).unbind(thisApp.utils.touchend);
        } else {
            dragWrapper.unbind(thisApp.utils.touchmove, dragMove);
            dragWrapper.unbind(thisApp.utils.touchend, dragEnd);
        }
        

        isDragging = false;
        // if the touch has crossed into the vortex
        // apply the animation and send the image data down the pipe
        // else
        // snap the image back to where it was and then destroy it.
    
        if (isInVortex) {
            dragImage.removeClass("inVortex");
            dragWrapper.bind("webkitTransitionEnd", endSendPicture);
            vortexApp.canvas.warp();
            setTimeout(function() {
                dragWrapper.css({
                    "-webkit-transform": "translate(160px, 360px) scale(0.01)",
                    "-webkit-transition-duration": "500ms"
                });
            }, 0);
            // send image down pipe here
        } else {
            dragWrapper.bind("webkitTransitionEnd", resetPicture);
            setTimeout(function() {
                dragWrapper.css({
                    "-webkit-transform": "translateX(" + pos.left + "px)" + " translateY(" + pos.top + "px)",
                    "-webkit-transition-duration": "100ms"
                });
            }, 0);
        }
    }
    
    function incViewIndex(aUp) {
        if (aUp) {
            if (viewIndex < 4) {
                viewIndex++;
            } else {
                viewIndex = 0;
            }
        } else {
            if (viewIndex > 0) {
                viewIndex--;
            } else {
                viewIndex = 4;
            }
        }
    }
    
    
    function switchImage(aIsNext) {
        var refView = $(".carousel div").get(0), targetImage;
        if (aIsNext) {
            incViewIndex(true);
            refView.parentNode.appendChild(refView);
        } else {
            incViewIndex(false);
            targetImage = $(".carousel div").last().get(0);
            refView.parentNode.insertBefore(targetImage, refView);
        }
        addImageDrag();
    }
    
    function addUtils(obj) {
        obj.isMobile = ($.os.ios || $.os.android || $.os.webos) ? true : false;
        obj.touchstart = obj.isMobile ? "touchstart" : "mousedown";
        obj.touchmove = obj.isMobile ? "touchmove" : "mousemove";
        obj.touchend = obj.isMobile ? "touchend" : "mouseup";
        
    }
    
    thisApp.init = function() {
        addUtils(thisApp.utils);
        init();
        thisApp.canvas.initCanvas();
        // initialise the utils
    };

})(vortexApp);

$("body").ready(vortexApp.init);