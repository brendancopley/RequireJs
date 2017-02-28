/*  KSM_Language.js

    This library is loaded into the _KSM namespace. 

    This library serves as an example of many JavaScript
	libraries in existence.
   
    Notice that it depends on jQuery
	It also assumes that some other script has already defined the 
	_KSM namespace. These are both potential breaking points.
*/
;
(function()
{   $.extend(true, _KSM,
    {   //	Create a language object within the _KSM namespace
		Language:
        {   textValues: {},
            //	This function will load the translations into memory
			//	It uses a deffered object to allow asynchronous processing
			//	The data gets loaded into the Language object under the
			//	_KSM namespace. The deffered object does not contain the
			//	translation values, but it could. Resolving the deferred 
			//	object acts as a trigger to let the calling program know the
			//	translations are loaded.
			load: function(languageAbbr)
            {   var defer = $.Deferred();
				//	Try to get the translations from local storage. Since
				//	the translations rarely change, once they are loaded 
				//	into local storage, we don't need to load them
				//	from an external source
                if (localStorage &&
                    localStorage.Language )
                {   try
                    {   var lang = JSON.parse(localStorage.Language);
                        localStorage.LanguageAbbr = languageAbbr;
						if (lang.textValues &&
                            lang.textValues[language])
                        {   _KSM.Language.textValues = $.extend(true, {}, lang.textValues);
                            return defer.resolve();
                        }
                    }
                    catch (e)
                    { console.log ('error during language load', e); }
                }
				//	In my production system, I have a library that calls a web
				//	service for data access. I commented this out to avoid the
				//	complexity of yet another library.
				//$.when(_KSM.callWebService('KSM_UITEXT_GET',
				//{   Language: language,
				//    Active: 1
				//}))
				// 	Load a small subset of translations as an example
				$.when(_KSM.Language.getValues(languageAbbr))
                .done(function(data)
                {   _KSM.Language.textValues[languageAbbr] = {};
					//	Update the local textValues array with key/value pairs
					$.each(data.d, function()
                    {   _KSM.Language.textValues[languageAbbr][this.RecordId] = this.TextValue;
                    });
					//	Once we've loaded the values, save them to local storage if possible
                    if (localStorage)
                    {   var lang = $.extend(true, {}, _KSM.Language.textValues);
                        localStorage.Language = JSON.stringify({ textValues: lang });
                    }
                    defer.resolve();
                });
                return defer.promise();
            },
              
			//	For example purposes, this function only sets three translation
			//	values for English and French. When using a webservice instead of
			//	hard-coded values, the server returns an object with a key of "d"
			//	that contains all the values. We'll mimic that behaviour
			getValues: function(languageAbbr)
			{	var defer = $.Deferred(),
					retVal = { d: [] };
				switch(languageAbbr)
				{	//	French translations
					case 'fr':
						retVal.d.push
						(	{ RecordId: 5, TextValue: 'Enregistrez l’enregistrement en cours' },
							{ RecordId: 10, TextValue: 'Recherche de valeur' },
							{ RecordId: 15, TextValue: 'Publication finale' }
						);
						break;
					
					//	Any language other than French will return English translations 
					default:
						retVal.d.push
						(	{ RecordId: 5, TextValue: 'Save current record' },
							{ RecordId: 10, TextValue: 'Search for value' },
							{ RecordId: 15, TextValue: 'Final publication' }
						);
						break;					
				}
				return defer.resolve(retVal);
			},
		
			//	The calling program can call this function to have controls
			//	listen for changes in the language. If the language is 
			//	changed through code or user interaction, visible text
			//	values can be updated without exiting. This function is not
			//	used in the course but remains here as a sample.
            listenForLanguage: function(selector)
            {   $(selector).listen('click', 'img', function()
                {   var $this = $(this),
                        optsDlg = $('#options-dlg'),
                        languageAbbr = $this.attr('data-language') || 'en';
                    _KSM.Language.setLanguageTexts(languageAbbr);
                    optsDlg.hide();
                    localStorage.LanguageAbbr = languageAbbr;
                    _KSM.Language.LanguageAbbr = languageAbbr;
                });
            },
               
			//	Text to be translated should be in the pattern:
			//	=nnn:default text
			//	nnn is the id of the text string
			//	default text is used if no record can be found
			//	The string will be parsed and the values will be
			//	passed to the getLanguageText function
            translate: function(text)
            {   var keyLanguageFields;
                if (typeof text !== 'undefined' &&
                    text.substr(0,1) === '=' &&
                    text.indexOf(':') > -1)
                {   keyLanguageFields = text.split(':');
                    text = _KSM.Language
						.getLanguageText(keyLanguageFields[0].substr(1), keyLanguageFields[1]);   
                }
                return text;
            },

			//	This function looks up the text to translate by record id
			//	It will return the default text if any errors are encountered
            getLanguageText: function(id, defaultText, languageAbbr)
            {   if (typeof id === 'undefined')
                    return defaultText;
                if (typeof languageAbbr === 'undefined')
                    if (typeof localStorage !== 'undefined' &&
                        typeof localStorage.LanguageAbbr !== 'undefined')
                        languageAbbr = localStorage.LanguageAbbr;
 
                languageAbbr = languageAbbr || 'en';
                _KSM.Language.LanguageAbbr = languageAbbr;

				if ($.isEmptyObject(_KSM.Language.textValues))
					_KSM.Language.textValues = JSON.parse(localStorage.Language).textValues;

                if (typeof _KSM.Language === 'undefined' ||
                    typeof _KSM.Language.textValues[languageAbbr] === 'undefined' ||
                    typeof _KSM.Language.textValues[languageAbbr][id] === 'undefined')
                    return defaultText;

                return _KSM.Language.textValues[languageAbbr][id];
            }
        }
    });
})();
