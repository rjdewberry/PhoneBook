function ActiveBar( text )
{
    this._text = text;
    // Retrieve the body node
    var o = document.getElementsByTagName( "body" );
    this._bodyNode = o[0];

    // Create the Activebar div area
    var activebar = document.createElement( "div" );
    this._activebarNode = activebar;
    activebar.style.display = "none";
    activebar.className = "activebar";
    activebar.style.height = this._barHeight + "px";
    activebar.style.top = "0px";
    activebar.style.left = "0px";
    activebar.style.width = "100%";
    this._bodyNode.appendChild( activebar );

    // Create the text area inside the Activebar
    var textArea = document.createElement( "div" );
    this._textAreaNode = textArea;
    textArea.className = "messageText";
    this._activebarNode.appendChild( textArea );

    // Set the appropriate text.
    // InnerHTML is used to support html tags in the text.
    this._textAreaNode.innerHTML = text;

    //Create the close node
    var close = document.createElement( "div" );
    this._closeNode = close;
    close.className = "closeButton";
    this._activebarNode.appendChild( close );
    
    var self = this;
    this._registerEvent( window, "scroll", function(event) { self._onScroll(event, self) } );
    this._registerEvent( this._closeNode, "click", function(event) { self.hide(); } );
}

ActiveBar.prototype = {

    //
    // Private attributes
    //
    _text:                  false,
    _bodyNode:              false,
    _activebarNode:         false,
    _textAreaNode:          false,
    _textNode:              false,
    _closeNode:             false,
    _slideIn:               false,
    _slideDelay:            30,
    _currentTop:            0,
    _barHeight:             24,
    _topBorder:             0,
    _animation_in_progress: false,
    _animationTimer:        false,
    
    
    //
    // Private functions
    //
    _getScrollOffsetY: function() 
    {
        if( typeof( window.pageYOffset ) == "number" ) 
        {
            //Netscape compliant
            return window.pageYOffset;
        }
        else if( document.body != undefined && ( document.body.scrollLeft != undefined || document.body.scrollTop != undefined ) ) 
        {
            //DOM compliant
            return document.body.scrollTop;
        }
        else if( document.documentElement != undefined && ( document.documentElement.scrollLeft != undefinded || document.documentElement.scrollTop !=	undefined ) ) 
        {
            //IE6 standards compliant mode
            return document.documentElement.scrollTop;
        }
    },

	_registerEvent: function(element, event, handler) 
	{
		if (typeof element.addEventListener != "undefined") {   //Dom2
			element.addEventListener(event, handler, false);
		} else if (typeof element.attachEvent != "undefined") { //IE 5+
			element.attachEvent("on" + event, handler);
		} else {
			if (element["on" + event] != null) {
				var oldHandler = element["on" + event];
				element["on" + event] = function(e) {
					oldHander(e);
					handler(e);
				};
			} else {
				element["on" + event] = handler;
			}
		}
	},

    _slideAnimate: function() 
    {
        if ( this._slideIn  == true ) 
        {
            this._activebarNode.style.top = this._currentTop-- + "px";
            if ( this._currentTop ==  this._topBorder - this._barHeight - 1 ) 
            {
                this._activebarNode.style.display = "none";
                this._animation_in_progress = false;   
                return;
            }
        }
        else 
        {
            this._activebarNode.style.top = this._currentTop++ + "px";
            if ( this._currentTop == this._topBorder + 1 )
            {
                this._animation_in_progress = false;   
                return;
            }
        }
        // Animate the next step
        var self = this;
        this._animationTimer = window.setTimeout( function() { self._slideAnimate() }, this._slideDelay );
    },

    _slide: function( direction_in ) 
    {
        this._animation_in_progress = true;
		var self = this;
        this._onScroll(null, self);
        if ( direction_in == true ) 
        {
            this._slideIn = true;
            this._currentTop = this._topBorder;
        } else 
        {
            this._slideIn = false;
            this._currentTop = this._topBorder - this._barHeight;
            this._activebarNode.style.top = this._currentTop + "px";
            this._activebarNode.style.display = "block";
        }
        this._slideAnimate();
    },

    //
    // Action Callbacks
    //
    _onScroll: function(event, o)
    {
        o._topBorder = o._getScrollOffsetY();
        if ( o._animation_in_progress ) 
        {
            // Stop the animation
            window.clearTimeout( o._animationTimer );
            o._activebarNode.style.display = o._slideIn ? "none" : "block";
        }

        o._activebarNode.style.top = o._topBorder + "px";		
    },

    //
    // Public functions
    //
    show: function() 
    {
        this._slide( false );
    },

    hide: function()
    {
        this._slide( true );
    }

}

