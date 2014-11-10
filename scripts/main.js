/* global vortexApp */
/* global Event: false */

(function(thisApp) {
    "use strict";
    var
    // references
    viewIndex, dragImgSrc, pos,
    // state variables
    isDragging, startX, startY, isInVortex,
    // individual elements
    carousel, textEntryBox,
    sendButton, sendTextForm, expandable,
    dragImage, dragWrapper, currentItem,
    // events
    swipeLeft, swipeRight;
    
    function init() {
        var swipeObj = {};

        function showText() {
            var vText = textEntryBox.value;
            if (!vText) {
                expandable.style.textAlign = "center";
                vText = "Put something in the text box below.<br>" +
                "<span style='font-size:30px; line-height:1'>&</span><br>" +
                "then press send.<br>";
            } else {
                expandable.style.textAlign = "left";
            }
            textEntryBox.value = "";
            textEntryBox.blur();
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
            document.body.addEventListener(thisApp.utils.touchmove, function(e){
                e.preventDefault();
            });
        }

        function swipeTest(e) {
            swipeObj.x2 = e.pageX;
            swipeObj.y2 = e.pageY;
            
            carousel.removeEventListener("mouseup");
            var event = (swipeDirection(swipeObj.x1, swipeObj.x2, swipeObj.y1, swipeObj.y2) === "Left")
                ? swipeLeft : swipeRight;
            carousel.dispatchEvent(event);
        }

        function startSwipe(e) {
            e.preventDefault();
            swipeObj.x1 = e.pageX;
            swipeObj.y1 = e.pageY;
            carousel.addEventListener("mouseup", swipeTest);
        }
        
        function swipeDirection(x1, x2, y1, y2) {
            var yDelta = Math.abs(y1 - y2);
            if (yDelta < 50) {
                return (x1 - x2 > 0 ? "Left" : "Right");
            }
        }

        function getPosObject(element) {
            var clientRect = element.getBoundingClientRect();
            return {
                left: clientRect.left + document.body.scrollLeft,
                top: clientRect.top + document.body.scrollTop
            };
        }

        pos = getPosObject(document.querySelector("header .carousel div:nth-child(3)"));
        textEntryBox = document.getElementById("message");
        sendButton = document.getElementById("send");
        sendTextForm = document.getElementById("sendTextForm");
        expandable = document.getElementById("expandable");
        sendButton.addEventListener("click", function(){
            showText();
        });
        //event listeners
        sendTextForm.addEventListener("submit", function(e){
            e.preventDefault();
            showText();
        });

        carousel = document.getElementById("carousel");

        swipeLeft = new Event("swipeLeft");

        swipeRight = new Event("swipeRight");
        carousel.addEventListener("swipeLeft", function(e){
            removeImageDrag(e);
            switchImage(true);
        });
        carousel.addEventListener("swipeRight", function(e){
            removeImageDrag(e);
            switchImage(false);
        });

        
        if (!thisApp.utils.isMobile) {
            // my own hacky mouse based swipings
            carousel.addEventListener("mousedown", startSwipe);
        }
        
        currentItem = document.querySelector("header .carousel div:nth-child(3)");
        currentItem.addEventListener(thisApp.utils.touchstart, dragStart);
        
        preventScroll();
    }
    
    function endSendPicture() {
        dragWrapper.removeEventListener("webkitTransitionEnd", endSendPicture);
        dragWrapper.style.webkitTransitionDuration = "100ms";
        dragWrapper.style.webkitTransform = "translateX(" + pos.left + "px)"
            + " translateY(" + pos.top + "px)";
        setTimeout(function() {
            dragWrapper.remove();
            thisApp.canvas.wane();
        }, 0);
    }
    
    function resetPicture() {
        dragWrapper.removeEventListener("webkitTransitionEnd", resetPicture);
        dragWrapper.style.webkitTransitionDuration = "100ms";
        dragWrapper.style.webkitTransform = "translateX(" + pos.left + "px)"
            + " translateY(" + pos.top + "px)";
        setTimeout(function() {
            dragWrapper.remove();
        }, 0);
    }
    
    
    function removeImageDrag(e) {
        e.preventDefault();
        currentItem.removeEventListener(thisApp.utils.touchstart, dragStart);
    }
    
    function addImageDrag() {
        currentItem = document.querySelector("header .carousel div:nth-child(3)");
        currentItem.addEventListener(thisApp.utils.touchstart, dragStart);
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

        // get the coordinates of the touch here
        startX = touchObj.pageX;
        startY = touchObj.pageY;
        dragImgSrc = touchObj.target.src;
        currentItem.addEventListener(thisApp.utils.touchmove, dragMove);
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
                dragWrapper = document.createElement("div");
                dragImage = document.createElement("img");
                dragWrapper.classList.add("dragWrapper");
                dragImage.classList.add("dragImage");
                dragImage.setAttribute("src", dragImgSrc);
                dragWrapper.appendChild(dragImage);
            } else {
                dragImage.setAttribute("src", dragImgSrc);
            }
            document.body.appendChild(dragWrapper);
            if (!thisApp.utils.isMobile) {
                //remove the original eventmove handler
                currentItem.removeEventListener(thisApp.utils.touchmove, dragMove);
                // add a handler for the mousemove
                dragWrapper.addEventListener(thisApp.utils.touchmove, dragMove);
                dragWrapper.addEventListener(thisApp.utils.touchend, dragEnd);
            } else {
                // seems that you cannot add the touchend event to the generated element
                // hence adding it to the original element
                // unlike mouse events touch events are broadcast to all subscribed elements
                // subscribed elements don't even need to be the target of the event
                currentItem.addEventListener(thisApp.utils.touchend, dragEnd);
            }
        }
        
        dX = touchObj.pageX - startX;
        dY = touchObj.pageY - startY;
        dragWrapper.style.webkitTransform = "translate(" + (pos.left + dX) +
            "px," + (pos.top + dY) + "px)";
        if (touchObj.pageY > 300) {
            // it's in the vortex
            if (!isInVortex) {
                isInVortex = true;
                // add vortex styling
                dragImage.classList.add("inVortex");
            }
        } else {
            if (isInVortex) {
                isInVortex = false;
                // remove vortex styling
                dragImage.classList.remove("inVortex");
            }
        }
    }
    
    function dragEnd() {
        if (thisApp.utils.isMobile) {
            currentItem.removeEventListener(thisApp.utils.touchmove, dragMove);
            currentItem.removeEventListener(thisApp.utils.touchend, dragEnd);
        } else {
            dragWrapper.removeEventListener(thisApp.utils.touchmove, dragMove);
            dragWrapper.removeEventListener(thisApp.utils.touchend, dragEnd);
        }
        

        isDragging = false;
        // if the touch has crossed into the vortex
        // apply the animation and send the image data down the pipe
        // else
        // snap the image back to where it was and then destroy it.
    
        if (isInVortex) {
            dragImage.classList.remove("inVortex");
            dragWrapper.addEventListener("webkitTransitionEnd", endSendPicture);
            vortexApp.canvas.warp();
            setTimeout(function() {
                dragWrapper.style.webkitTransitionDuration = "500ms";
                dragWrapper.style.webkitTransform = "translate(160px, 360px) scale(0.01)";
            }, 0);
            // send image down pipe here
        } else {
            dragWrapper.addEventListener("webkitTransitionEnd", resetPicture);
            setTimeout(function() {
                dragWrapper.style.webkitTransitionDuration = "100ms";
                dragWrapper.style.webkitTransform = "translateX(" + pos.left + "px)"
                    + " translateY(" + pos.top + "px)";
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
        var refView = document.querySelector(".carousel div"), targetImage;
        if (aIsNext) {
            incViewIndex(true);
            refView.parentNode.appendChild(refView);
        } else {
            incViewIndex(false);
            targetImage = document.querySelector(".carousel div:last-child");
            refView.parentNode.insertBefore(targetImage, refView);
        }
        addImageDrag();
    }
    
    function addUtils(obj) {
        obj.isMobile = (vortexApp.platform.os.ios ||
            vortexApp.platform.os.android) ? true : false;
        obj.touchstart = obj.isMobile ? "touchstart" : "mousedown";
        obj.touchmove = obj.isMobile ? "touchmove" : "mousemove";
        obj.touchend = obj.isMobile ? "touchend" : "mouseup";
        
    }
    
    thisApp.init = function() {
        addUtils(thisApp.utils);
        init();
        thisApp.canvas.initCanvas();
    };

})(vortexApp);

vortexApp.init();