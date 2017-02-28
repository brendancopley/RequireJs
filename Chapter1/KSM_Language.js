/*  KSM_Language.js
*/
;
(function()
{   $.extend(true, _KSM,
    {   Language:
        {   textValues: {},
            load: function(languageAbbr)
            {   var defer = $.Deferred();
				if (localStorage &&
                    localStorage.Language )
                {   try
                    {   var lang = JSON.parse(localStorage.Language);
                        localStorage.LanguageAbbr = languageAbbr;
						if (lang.textValues &&
                            lang.textValues[languageAbbr])
                        {   _KSM.Language.textValues = $.extend(true, {}, lang.textValues);
                            return defer.resolve();
                        }
                    }
                    catch (e)
                    { console.log ('error during language load', e); }
                }
				$.when(_KSM.Language.getValues(languageAbbr))
                .done(function(data)
                {   _KSM.Language.textValues[languageAbbr] = {};
					$.each(data.d, function()
                    {   _KSM.Language.textValues[languageAbbr][this.RecordId] = this.TextValue;
                    });
					if (localStorage)
                    {   var lang = $.extend(true, {}, _KSM.Language.textValues);
                        localStorage.Language = JSON.stringify({ textValues: lang });
                    }
                    defer.resolve();
                });
                return defer.promise();
            },
              
			getValues: function(languageAbbr)
			{	var defer = $.Deferred(),
					retVal = { d: [] };
				switch(languageAbbr)
				{	case 'fr':
						retVal.d.push
						(	{ RecordId: 5, TextValue: 'Enregistrez l’enregistrement en cours' },
							{ RecordId: 10, TextValue: 'Recherche de valeur' },
							{ RecordId: 15, TextValue: 'Publication finale' }
						);
						break;
					
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