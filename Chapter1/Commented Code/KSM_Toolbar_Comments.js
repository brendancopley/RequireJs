/*  KSM_Toolbar.js

    This library is loaded into the _KSM namespace. 
	
	Unlike KSM_Language, this library will create the _KSM 
	namespace if it doesn't exist already.

    Default values are exposed as an externally accessible object so defaults can 
	be changed globally instead of within each call to the library.
	
	This library also depends on jQuery.
*/
;
(function()
{   //  Make sure the _KSM object exists. If not, we'll create an empty object to 
	//	hold this library
    //  Normally, the toolbar library is part of a larger project, so the _KSM 
	//	namespace should already be defined.
    if (typeof _KSM === 'undefined')
        _KSM = { defaultContext: 'body' };
	//	Translation capabilities are assumed, but are provided by another library.
	//	Create a stub function if one doesn't exist already
    if (typeof _KSM.Language === 'undefined')
        _KSM.Language =
        {   //	This stub function does no translation. It just returns the text that
			// 	was passed in as a parameter
			translate: function(text) { return text; } 
        }
    $.extend(true, _KSM,
    {   Toolbar:
        {   version: '1.0',
            minorVersion: '2',
            //	This library only reconizes three toolbar button types.
			toolbarTypes:
            [
				{   type: 'save', title: 'Save record' },
				{   type: 'search', title: 'Search' },
				{   type: 'publish', title: 'Publish as final' }
            ],

			//	Many toolbar buttons share common attributes. Any of the
			//	following attributes will automatically be processed for
			//	each button. This list has been dramatically shortened to
			//	make the discussion much easier.
            commonAttrs: ['id', 'lang_id', 'name'],
                        
            //  The toolbarDiv function will return the HTML required to create a
			//	DIV. By default, it will also place the toolbar on the screen as 
			//	part of the defaultContext if a container is not specified
            toolbarDiv: function(options)
            {   //  Extend the options passed onto the default options
                var opts = $.extend(true, {}, _KSM.Toolbar.defaultOptions, options),
					//	The toolbar button types are mapped to allow faster accessible
					//	later on
                    mapped = $.map(_KSM.Toolbar.toolbarTypes, function(val, idx)
                        {   return val.type;
                        }),
                    commonAttrs = _KSM.Toolbar.commonAttrs,
                    attrsLength = commonAttrs.length,
                    clickFunctions = [];

                //  Find the context if it wasn't passed as an option
				if (typeof opts.context === 'undefined' )
                    opts.context = 
						$(this).closest( _KSM.defaultContext );

				//	Get a jQuery object from the string context
                if (typeof opts.context === 'string')
                    opts.context = $(opts.context);

				//	If no context, work with an in-memory DIV
                if ($.isEmptyObject(opts.context))
                    opts.context = $('<div>');

                //  Start building the toolbar element in memory
                var div = $('<div>')
                    .addClass('toolbar line noprint ' + opts.toolbarLineClass )
                    .attr('id', opts.toolbarLineId);
                
                var btnDiv = $('<div>')
                    .addClass('toolbarButtonHolder ' + opts.toolbarHolderClass )
                    .attr('id', opts.toolbarHolderId);

				//	If a toolbar holder is not requested, promote the holder
				//	to the toolbar itself. This means we'll place buttons 
				//	directly on the toolbar instead of on a holder within the
				//	toobar
                if (!opts.useToolbarHolder)
                    btnDiv = div;
                
                //  Loop through all the buttons and add them 
                $.each(opts.buttons, function(idx, val)
                {   if (typeof val === 'undefined') return false;
                    
                    //  Create the tbbutton shell
                    var tmpToolItem = 
						$('<div>')
							.addClass('tbbutton ' + (opts.toolbarButtonClass || '') ),
                        tmp, theButton;
            
                    //  Add necessary CSS classes as well as the disabled state (if present)
                    var tmpClass = val.type + 
						(!!val.state ? ' ' + val.state : '') + 
						(!!val.class ? ' ' + val.class : '');
                    tmpToolItem.addClass(tmpClass);
                    
					//	If a visible property is present and false, add the "hidden" class
                    if(typeof val.visible !== 'undefined' && !val.visible)
                        tmpToolItem.addClass('hidden');

                    //  Set a default title for the button, if no title has been specified
                    if (typeof val.title === 'undefined')
                    {   var index = mapped.indexOf(val.type);
                        if (index > -1)
                            tmpToolItem.attr('title', _KSM.Toolbar.toolbarTypes[index].title);
                    }
                         
                    //  If a custom title was provided, use that instead of the one 
					//	we determined above - pass it through the translation library
                    if (val.title)
                        tmpToolItem.attr('title', _KSM.Language.translate(val.title));

					//	Apply common attributes 
                    for (var x=0;x<attrsLength;x++)
                    {   if (typeof val[commonAttrs[x]] !== 'undefined')
                            tmpToolItem.attr(commonAttrs[x], val[commonAttrs[x]]);
                    }

                    //  If a click handler is provided, add a unique id to the button and
                    //  add a reference to it on the button. We use an array of click
					//	functions to keep traack of all toolbar button click handlers
                    if (val.onclick)
                    {   var tId = _KSM.Toolbar.setUniqueId(
                        {   id: val.id,
                            type: val.type,
                            item: tmpToolItem 
                        });
                        clickFunctions.push(
                        {   id: tId,
                            theFunction: val.onclick
                        });
                    }
                    
                    //  append the button to the button holder 
                    tmpToolItem.appendTo(btnDiv);

                    if (opts.useToolbarHolder)
					{	// append to toolbar line
						div.append(btnDiv);
                    }
                });

                //  Final thing to do is make sure we have an item that clears the float 
				//	style so nothing is added on the same line as the toolbar.
                if (opts.clearFloat)
                {   div.css({clear: 'both'});
				}
				
				//	If the toolbar is automatically attached to an element in the UI,
				//	we need to do some work to set attributes and a listener
                if (opts.autoAttach)
                {   var listenPoint;

                    //  If a container isn't specified in the options, we need
					//  to insert the toolbar after the panel title
                    if (!opts.container)
                    {   //	First, look for a titlebar
						var tmp = opts.context.find('.titlebar').next();
                        
						//	If no titlebar, look for a dialog box titlebar
                        if (tmp.length === 0)
                            tmp = opts.context.closest('.ui-dialog-titlebar').next();
                        //	If nothing still, find the parent of the context
						//	and look for a titlebar, then grab the next element
						if (tmp.length === 0)
                            tmp = opts.context.parent().find('.ui-dialog-titlebar').next();
                        //	If still nothing, look for a titlebar in the default context
						//	and grab the next element 
						if (tmp.length === 0)
                            tmp = opts.context.closest(_KSM.defaultContext).find('.titlebar').next();
                        //	If all else failed, just use the context passed in, and attach
						//	the titlebar there 
						if (tmp.length === 0)
                            tmp = opts.context;

                        //	We'll promote the listening point one level above 
						//	where the toolbar resides. This lets us take 
						//	advantage of event bubbling and handle all the 
						//	toolbar events with a single function
						listenPoint = opts.listenPoint || tmp.parent();

                        //  Let's make sure there is only one toolbar in the parent
						//	We'll remove any toolbar that's already present and 
						//	replace it with the one we've built
                        listenPoint.find('.toolbar').remove();
                        div.insertBefore(tmp);

						//	Some dialogs have conditional toolbars, so we'll check
						//	the hideInDialog value and hide the toolbar if we are
						//	actually in a dialog
                        if (opts.hideInDialog)
                        {   if (div.closest('.ui-dialog').length > 0)
                                div.addClass('hidden');
                        }
                    }
                    else 
                    {   //	Since we have a container, we don't have to jump through
						//	hoops to figure out where to attach the toolbar. We just
						//	prepend it to the container.
						opts.container.prepend('<div class="floatClear">');
                        if (opts.useToolbarHolder)
                            opts.container.prepend(div);
                        else
                            opts.container.prepend(div.html());
                        listenPoint = opts.listenPoint || opts.container;
                    }
					//	Set a class of listener on the listening point. This allows 
					//	the calling program to use a single event handler to capture
					//	bubbling events 
                    listenPoint.addClass('listener');

					//	If we have click functions, we need to make sure we assign a
					//	unique id to each button, then set a listener 
					//	NOTE: There is NO listen function defined since I'm not
					//	using the EventHandler from the _KSM library. The listen 
					//	function is an abstraction of the jQuery on function that 
					//	was useful in my project but not necessary for this course.
                    if (clickFunctions.length)
                    {   for (var x=0; x<clickFunctions.length; x++)
                        {   if (typeof _KSM.EventHandler !== 'undefined')
                            {   listenPoint.listen('click.toolbar', '#' + 
                                clickFunctions[x].id + ':not(.disabled)', 
                                clickFunctions[x].theFunction);
                            }
                            //  TODO - provide for an alternate listener if 
							//		   _KSM.EventHandler isn't present
							//		   The jQuery "on" function would suffice.
                        }
                    }
                }
				//	By now, the toolbar should be attached to the proper location. All that
				//	is left is to return the HTML of the toolbar div. Since there is no 
				//	"OuterHTML" function in jQuery, I wrap the toolbar in a div, then get the
				//	HTML of the contents of that div (the toolbar);
                var content = div.wrap('<div/>').parent().html();
                return content;
            },

			//	Simple function to generate a somewhat unique id 
            setUniqueId: function(options)
            {   var tId = options.id || (options.type + '_' + Math.floor(Math.random()*150000).toString());
                if (options.item)
                    $(options.item).attr('id', tId);
                return tId;
            },
			
			//	We'll set up jQuery binding at the listener point and get unique ids 
			//	as necessary
            setListener: function(options)
            {   var listener = options.context.closest('.listener'),
                    event = options.event || 'click',
                    namespace = options.namespace || 'toolbar',
                    tId = options.id ||_KSM.Toolbar.setUniqueId(
                    {   type: options.type || 'button',
                        item: options.item || $('<div>')
                    }),
                    selector = options.selector || '#' + tId + ':not(.disabled)',
                    eventFunction = options.eventFunction || function() { },
                    eventName = event + (event.indexOf('.') === -1 ? '.' + namespace : '');
                
				//	Use the document as a listener point if none is specified 
                if (listener.length === 0)
                    listener = $(document);
                //	Clear - then set - the necessary listener 
				listener.off(eventName, selector);  
                listener.on(eventName, selector, eventFunction);
            }
        }
    });	//	End of toolbar object definition 
	
	//	Create default values that can be set from outside the library 
    $.extend(true, _KSM.Toolbar,
    {   defaultOptions: 
        {   buttons: [],
            context: {},
            useToolbarHolder: true,
            height: '32px',
            autoAttach: true,
            scrollAreaClass: '.panel-body',
            toolbarButtonClass: '',
            toolbarButtonId: '',
            toolbarLineClass: '',
            toolbarLineId: '',
            toolbarHolderClass: '',
            toolbarHolderId: '',
            itemHeight: '34px',
            clearFloat: true
        }
    });
})();
