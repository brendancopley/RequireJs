describe('The KSM Toolbar Library', function()
{	var theLib = _KSM.Toolbar.toolbarDiv,
		theLanguageLib = _KSM.Language,
		buttons =
        [   {   type: 'save',       title: 'Save record (test)'      },
            {   type: 'search',     title: 'Search (test)'           },
            {   type: 'publish',    title: 'Publish as final (test)' }
		],
		translateButtons =
		[	{ 	type: 'save', 		title: '=5:French Save' }
		],
		translateLanguage = 'fr',
		translatedSave = 'Enregistrez l’enregistrement en cours';

	it('should exist within the _KSM namespace', function()
	{	expect(theLib).toBeDefined();
	});
    it('should be a function', function()
    {   expect(typeof theLib).toEqual('function');
    });	
	it('should return an empty toolbar when called with no options', function()
	{	var toolbar = theLib(),
			emptyToolbar = '<div style="clear: both;" id="" class="toolbar line noprint"></div>';
        expect(toolbar).toEqual(emptyToolbar);
	});
	
	describe('when called with button parameters will', function()
	{	var toolbar = $(theLib(
		    {	buttons: buttons
		    })),
			$toolbarDiv = $(toolbar),
			createIts = function()
			{   var button = buttons[k].type,
					title = buttons[k].title,
					string = 'create the ' + button + ' button with the proper default title';
				it(string, function()
				{   expect($toolbarDiv.find('.' + button).length).toEqual(1);
					expect($toolbarDiv.find('.' + button).attr('title')).toEqual(title);
				});
			},
			k = -1,
            length = buttons.length;
        
		for(; ++k < length;)
        {   createIts();
        }

        it('NOT create a fake button', function()
        {   expect($toolbarDiv.find('.fakeButton').length).not.toEqual(1);
        });
	});

    describe('when called with button parameters and alternate titles will', function()
    {   var newTitle = 'New Title!',
            newButtons = buttons,
            k = -1,
            length = buttons.length;

        for(; ++k < length;)
        {   newButtons[k].title = newTitle;
        }

        var toolbar = $(theLib(
            {   buttons: newButtons
            })),
            $toolbarDiv = $(toolbar),
            createIts = function()
            {   var button = newButtons[k].type,
                    title = newButtons[k].title,
                    string = 'create the ' + button + ' button with a DIFFERENT title';
                it(string, function()
                {   expect($toolbarDiv.find('.' + button).length).toEqual(1);
                    expect($toolbarDiv.find('.' + button).attr('title')).toEqual(title);
                });
            };

        k = -1;
        for(; ++k < length;)
        {   createIts();
        }

        it('NOT create a fake button with a DIFFERENT title', function()
        {   expect($toolbarDiv.find('.fakeButton').length).not.toEqual(1);
            expect($toolbarDiv.find('.fakeButton').attr('title')).not.toEqual('Fake Title');
        });
    });
	
	describe('when coupled with the translation library will', function()
	{	it('be able to find the language library', function()
		{	expect(theLanguageLib).toBeDefined();
		});
		it('have a translated title when requested', function()
		{
			$.when(theLanguageLib.load(translateLanguage))
			.then(function()
			{	var toolbar = $(theLib({buttons: translateButtons})),
					$toolbarDiv = $(toolbar);
				expect($toolbarDiv.find('.tbbutton').attr('title')).toEqual(translatedSave);
			});			
		})
	});
});
