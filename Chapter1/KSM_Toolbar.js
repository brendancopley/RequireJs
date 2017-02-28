/*  KSM_Toolbar.js
*/
;
(function()
{   if (typeof _KSM === 'undefined')
        _KSM = { defaultContext: 'body' };
	if (typeof _KSM.Language === 'undefined')
        _KSM.Language =
        {   translate: function(text) { return text; } 
        }
    $.extend(true, _KSM,
    {   Toolbar:
        {   version: '1.0',
            minorVersion: '2',
            toolbarTypes:
            [
				{   type: 'save', title: 'Save record' },
				{   type: 'search', title: 'Search' },
				{   type: 'publish', title: 'Publish as final' }
            ],

			commonAttrs: ['id', 'lang_id', 'name'],
                        
            toolbarDiv: function(options)
            {   var opts = $.extend(true, {}, _KSM.Toolbar.defaultOptions, options),
					mapped = $.map(_KSM.Toolbar.toolbarTypes, function(val, idx)
                        {   return val.type;
                        }),
                    commonAttrs = _KSM.Toolbar.commonAttrs,
                    attrsLength = commonAttrs.length,
                    clickFunctions = [];

                if (typeof opts.context === 'undefined' )
                    opts.context = 
						$(this).closest( _KSM.defaultContext );

				if (typeof opts.context === 'string')
                    opts.context = $(opts.context);

				if ($.isEmptyObject(opts.context))
                    opts.context = $('<div>');

                var div = $('<div>')
                    .addClass('toolbar line noprint ' + opts.toolbarLineClass )
                    .attr('id', opts.toolbarLineId);
                
                var btnDiv = $('<div>')
                    .addClass('toolbarButtonHolder ' + opts.toolbarHolderClass )
                    .attr('id', opts.toolbarHolderId);

				if (!opts.useToolbarHolder)
                    btnDiv = div;
                
                $.each(opts.buttons, function(idx, val)
                {   if (typeof val === 'undefined') return false;
                    
                    var tmpToolItem = 
						$('<div>')
							.addClass('tbbutton ' + (opts.toolbarButtonClass || '') ),
                        tmp, theButton;
            
                    var tmpClass = val.type + 
						(!!val.state ? ' ' + val.state : '') + 
						(!!val.class ? ' ' + val.class : '');
                    tmpToolItem.addClass(tmpClass);
                    
					if(typeof val.visible !== 'undefined' && !val.visible)
                        tmpToolItem.addClass('hidden');

                    if (typeof val.title === 'undefined')
                    {   var index = mapped.indexOf(val.type);
                        if (index > -1)
                            tmpToolItem.attr('title', _KSM.Toolbar.toolbarTypes[index].title);
                    }
                         
                    if (val.title)
                        tmpToolItem.attr('title', _KSM.Language.translate(val.title));

					for (var x=0;x<attrsLength;x++)
                    {   if (typeof val[commonAttrs[x]] !== 'undefined')
                            tmpToolItem.attr(commonAttrs[x], val[commonAttrs[x]]);
                    }

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
                    
                    tmpToolItem.appendTo(btnDiv);

                    if (opts.useToolbarHolder)
					{	div.append(btnDiv);
                    }
                });

                if (opts.clearFloat)
                {   div.css({clear: 'both'});
				}
				
                if (opts.autoAttach)
                {   var listenPoint;

                    if (!opts.container)
                    {   var tmp = opts.context.find('.titlebar').next();
                        
						if (tmp.length === 0)
                            tmp = opts.context.closest('.ui-dialog-titlebar').next();
                        if (tmp.length === 0)
                            tmp = opts.context.parent().find('.ui-dialog-titlebar').next();
                        if (tmp.length === 0)
                            tmp = opts.context.closest(_KSM.defaultContext).find('.titlebar').next();
                        if (tmp.length === 0)
                            tmp = opts.context;

                        listenPoint = opts.listenPoint || tmp.parent();

                        listenPoint.find('.toolbar').remove();
                        div.insertBefore(tmp);

						if (opts.hideInDialog)
                        {   if (div.closest('.ui-dialog').length > 0)
                                div.addClass('hidden');
                        }
                    }
                    else 
                    {   opts.container.prepend('<div class="floatClear">');
                        if (opts.useToolbarHolder)
                            opts.container.prepend(div);
                        else
                            opts.container.prepend(div.html());
                        listenPoint = opts.listenPoint || opts.container;
                    }
					listenPoint.addClass('listener');

					if (clickFunctions.length)
                    {   for (var x=0; x<clickFunctions.length; x++)
                        {   if (typeof _KSM.EventHandler !== 'undefined')
                            {   listenPoint.listen('click.toolbar', '#' + 
                                clickFunctions[x].id + ':not(.disabled)', 
                                clickFunctions[x].theFunction);
                            }
                        }
                    }
                }
				var content = div.wrap('<div/>').parent().html();
                return content;
            },

			setUniqueId: function(options)
            {   var tId = options.id || (options.type + '_' + Math.floor(Math.random()*150000).toString());
                if (options.item)
                    $(options.item).attr('id', tId);
                return tId;
            },
			
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
                
				if (listener.length === 0)
                    listener = $(document);
                listener.off(eventName, selector);  
                listener.on(eventName, selector, eventFunction);
            }
        }
    });
	
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
