/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery, fluid*/

fluid = fluid || {};

(function ($) {
    
    fluid.engage = fluid.engage || {};
    
    var noTitle = "No Title";
    
    var tryFunc = function (func, value, defaultValue) {
        try {
            return func(value);
        } catch (e) {
            return defaultValue;
        }
    };
    
    var isString = function (value) {
        return typeof value === "string";
    };
    
    var wrap = function (value, tag) {
		return "<" + tag + ">" + value + "</" + tag + ">";
	};
//	var removeMeta = function (object) {
//		return JSON.stringify(object).contains("XStandard") ? {} : object;
//	};
	var buildHTML = function (value) {
		var node = value.strong ? (value.strong.em ? wrap(wrap(value.strong.em, "em"), "strong") : value.strong) : "";
		var nodetext = value.nodetext ? value.nodetext : "";
		for (var key in value) {
			if (value.hasOwnProperty(key)) {
				if (!(key === "nodetext" || key === "br" || key === "strong")) {
					node = node + wrap(value[key] instanceof Object ? buildHTML(value[key]) : value[key], key);
				}
			}
		}
		return node + nodetext;
	};
    
    fluid.engage.specs = {
        mmi: {
            dataSpec: {
                "category": "Collection category",
                "linkTarget": "Accession number",
                "linkImage": {
                    "path": "Media file",
                    "func": "getImageFromMarkupWithDefaultImage"
                },
                "linkTitle": "Object Title",
                "linkDescription": "Creation date",
                "artifactTitle": "Object Title",
                "artifactImage": {
                    "path": "Media file",
                    "func": "getImageFromMarkup"
                },
                "artifactDate": "Creation date",
                "artifactAccessionNumber": "Accession number",
                "artifactTags": "Tags",
                "artifactDescription": {
                    "path": "Description",
                    "func": "getDescription"
                }
            },
            mappers: {
                getDescription: function (value) {
                    var getDescr = function (value) {
                        if (isString(value)) {
                            return value;
                        }
                        else {
                            return value[0];
                        }
                    };
                    return tryFunc(getDescr, value);
                },
	            getImageFromMarkup: function (value) {
                    var getImage = function (value) {
                        var img = $(value).each(function (index) {
                            if ($(value).eq(index).is("img")) {
                                return $(value).eq(index);
                            }
                        });
                        var imgSRC = img.eq(0).attr("src");
                        return imgSRC ? String(imgSRC) : undefined;
                    };
                    return tryFunc(getImage, value);
                },
                getImageFromMarkupWithDefaultImage: function (value) {
                    var getImage = function (value) {
                        var img = $(value).each(function (index) {
                            if ($(value).eq(index).is("img")) {
                                return $(value).eq(index);
                            }
                        });
                        var imgSRC = img.eq(0).attr("src");
                        return imgSRC ? String(imgSRC) : undefined;
                    };
                    
                    return tryFunc(getImage, value);
                }
            }
        },
        mccord: {
	        dataSpec: {
                "category": {
                    "path": "artefacts.artefact.links.type.category",
                    "func": "getArtifactCategory"
                },
                "linkTarget": "artefacts.artefact.accessnumber",
                "linkImage": {
                    "path": "artefacts.artefact.images.image",
                    "func": "getThumbImageFromObjectArray"
                },
                "linkTitle": {
                    "path": "artefacts.artefact.title",
                    "func": "getTitleFromObject"
                },
                "linkDescription": "artefacts.artefact.dated",
                "artifactTitle": {
                    "path": "artefacts.artefact.title",
                    "func": "getTitleFromObject"
                },
                "artifactImage": {
                    "path": "artefacts.artefact.images.image",
                    "func": "getImageFromObjectArray"
                }, 
                "artifactAuthor": {
                    "path": "artefacts.artefact.artist",
                    "func": "getArtifactArtist"
                },
                "artifactDate": "artefacts.artefact.dated",
                "artifactAccessionNumber": "artefacts.artefact.accessnumber",
                "artifactTags": {
                    "path": "artefacts.artefact.tags.tag",
                    "func": "getArtifactTags"
                },
                "artifactDescription": {
                    "path": "artefacts.artefact.descriptions.description_museum",
                    "func": "getArtifactDescription"
                }
	        },
            mappers: {
                getArtifactDescription: function (value) {
                    var getDescription = function (value) {
                        if (isString(value)) {
                            return value;
                        }
                    };
                    return tryFunc(getDescription, value);
                },
                getArtifactCategory: function (value) {
                    var getCategory = function (value) {
                        return fluid.transform($.makeArray(value), function (val) {
                            return val.label;
                        });
                    };
                    return tryFunc(getCategory, value);
                },
	            getArtifactTags: function (value) {
					var getTags = function (value) {
						if (!isString(value)) {
                            return fluid.transform($.makeArray(value), function (val) {
								return val.label;
							});
						}
					};
					return tryFunc(getTags, value);
				},
                getTitleFromObject: function (value) {
                    var getTitle = function (value) {
                        if (isString(value)) {
                            return value || noTitle;
                        }
                        else {
                            return $.makeArray(value)[0].nodetext || noTitle;
                        }
                    };				
                    return tryFunc(getTitle, value, noTitle);
                },
                getThumbImageFromObjectArray: function (value) {
                    var getImage = function (value) {
                        if (isString(value)) {
                            return value || undefined;
                        }
                        else {
                            value = $.makeArray(value)[0].imagesfiles.imagefile;
                            return value[0].nodetext || undefined;
                        }
                    };
                    return tryFunc(getImage, value);
                },
                getImageFromObjectArray: function (value) {
                    var getImage = function (value) {
                        if (isString(value)) {
                            return value;
                        }
                        else {
                            value = $.makeArray(value)[0].imagesfiles.imagefile;
                            var link;
                            $.each($.makeArray(value).reverse(), function (index, val) {
                                if (val.sizeunit !== "") {
                                    link = val.nodetext;
                                    return false;
                                }
                            });
                            return link;
                        }
                    };
                    return tryFunc(getImage, value);
                },
                getArtifactArtist: function (value) {
                    var getArtist = function (value) {
                        if (isString(value)) {
                            return value;
                        }
                        else {
                            return $.makeArray(value)[0].nodetext;
                        }
                    };
                    return tryFunc(getArtist, value);
                }
            }
        },
        mccord_exhibitions: {
        	dataSpec: {
        		"isCurrent": "value.isCurrent",
        		"title": "key",
        		"displayDate": "value.displayDate",
        		"endDate": "value.endDate",
        		"image": {
                    "path": "value.image",
                    "func": "getExhibitionImage"
                }
        	},
        	mappers: {
        		getExhibitionImage: function (value) {
        			var getImage = function () {
        				return "http://www.mccord-museum.qc.ca" + $.makeArray(value.small)[0].nodetext;
        			};
        			return tryFunc(getImage, value);
        		}
        	}
        },
        mccord_exhibitions_view: {
        	dataSpec: {
        		"isCurrent": "value.isCurrent",
        		"title": "key",
        		"displayDate": "value.displayDate",
        		"endDate": "value.endDate",
        		"image": {
                    "path": "value.image",
                    "func": "getExhibitionImage"
                },
                "introduction": {
                	"path": "value.introduction",
                	"func": "getIntroduction"
                },
                "content": {
                	"path": "value.content",
                	"func": "getContent"
                },
                "catalogueSize": "value.catalogueSize"
        	},
        	mappers: {
        		getContent: function (value) {
	        		var buildContent = function (value) {
	        			var content = value.h2 ? value.h2 : "";
        				if (value.p) {
        					if (typeof(value.p) === "string") {
        						content = content + wrap(value.p, "p")
        					}
        					else {
	        					for (var i in value.p) {
	        						content = content + wrap(buildHTML(value.p[i]), "p")
	        					}
        					}
        				}
        				return content ? content : undefined; 
	        		};
	        		return tryFunc(buildContent, value, "");
	        	},
        		getIntroduction: function (value) {
        			var buildIntro = function (value) {
        				var intro = "";        				
        				if (value.p) {
        					if (typeof(value.p) === "string") {
        						intro = intro + wrap(value.p, "p")
        					}
        					else {
	        					for (var i in value.p) {
	        						intro = intro + wrap(buildHTML(value.p[i]), "p")
	        					}
        					}
        					return intro;
        				}
        				return intro ? intro : undefined;
        			};
        			return tryFunc(buildIntro, value, "");
        		},
        		getExhibitionImage: function (value) {
        			var getImage = function () {
        				if ($.makeArray(value.large)[0].height) {
        					return "http://www.mccord-museum.qc.ca" + $.makeArray(value.large)[0].nodetext;
        				}
        				else if ($.makeArray(value.medium)[0].height) {
        					return "http://www.mccord-museum.qc.ca" + $.makeArray(value.medium)[0].nodetext;
        				}
        				return "http://www.mccord-museum.qc.ca" + $.makeArray(value.small)[0].nodetext;
        			};
        			return tryFunc(getImage, value);
        		}
        	}
        },
        mccord_exhibitions_catalogue: {
        	dataSpec: {
        		"title": "key",
	    		"viewAll": "value.viewAll",
	            "sections": {
	            	"path": "value.sections",
	            	"func": "formatSections"
	            }
	    	},
	    	mappers: {
	    		formatSections: function (value) {
	    			var getSectionImage = function (value) {
	    				value = $.makeArray(value)[0];
	    				if ($.makeArray(value.small)[0].height) {
        					return "http://www.mccord-museum.qc.ca" + $.makeArray(value.small)[0].nodetext;
        				}
        				else if ($.makeArray(value.medium)[0].height) {
        					return "http://www.mccord-museum.qc.ca" + $.makeArray(value.medium)[0].nodetext;
        				}
        				return "http://www.mccord-museum.qc.ca" + $.makeArray(value.large)[0].nodetext;
	    			};
	    			var getSectionIntroduction = function (value) {
        				var intro = "";
        				var p = value.p;
        				if (p) {
        					if (typeof(p) === "string") {
        						intro = intro + wrap(p, "p")
        					}
        					else {
	        					for (var i in value.p) {
	        						intro = intro + wrap(buildHTML(p[i]), "p")
	        					}
        					}
        					return intro;
        				}
        				return intro;
	        		};
		    		var format = function (value) {
		    			var sections = [];
		    			fluid.transform(value, function (val) {
		    				sections.push({
	    						sectionTitle: val.sectionTitle,
	    						sectionSize: val.sectionSize,
	    						sectionImage: getSectionImage(val.sectionImage),
	    						sectionIntroduction: getSectionIntroduction(val.sectionIntroduction)
	    					});
	    				});
		    			return sections;
	    			};
	    			return tryFunc(format, value);
	    		}
	    	}
        },
        mccord_exhibitions_catalogueArtifacts: {
        	dataSpec: {
        		"exhibitionTitle": "key.exhibitTitle",
        		"sectionTitle": "key.sectionTitle",
        		"sectionIntroduction": {
        			"path": "value.sectionIntroduction",
        			"func": "getSectionIntroduction"
        		},
        		"sectionArtifacts": {
	            	"path": "value.sectionArtifacts",
	            	"func": "formatSectionArtifacts"
	            }
	    	},
	    	mappers: {
	    		getSectionIntroduction: function (value) {
		    		var getIntroduction = function (value) {
	    				var intro = "";
	    				var p = value.p;
	    				if (p) {
	    					if (typeof(p) === "string") {
	    						intro = intro + wrap(p, "p")
	    					}
	    					else {
	        					for (var i in value.p) {
	        						intro = intro + wrap(buildHTML(p[i]), "p")
	        					}
	    					}
	    					return intro;
	    				}
	    				return intro;
	        		};
	        		return tryFunc(getIntroduction, value);
		    	},
	    		formatSectionArtifacts: function (value) {
	    			var getImage = function (thumbnail) {
	    				return $.makeArray(thumbnail)[0].nodetext;
	    			};
	    			var format = function (data) {
	    				var t = $.map(data, function (value) {
	    					return {
	    						target: "../artifacts/view.html?db=mccord&q=" + value.accessnumber,
	    						image: getImage(value.thumbnail),
	    						title: value.title.substring(value.title.indexOf(':') + 2),
	    						description: "Descr"
	    					};
	    				});
	    				return t;
	    			};
	    			return tryFunc(format, value);
	    		}
	    	}
        }
    };
    
    fluid.engage.mapModel = function (model, dbName, spec) {
        
        spec = spec || fluid.engage.specs;
        
        var normalizedModel = {};
        
        var validatePathFunc = function (path, func) {
            return path && func;
        };
        
        var invokeSpecValueFunction = function (func, value, mappers) {
            if (isString(func)) {
                return mappers ? fluid.model.getBeanValue(mappers, func)(value) : fluid.invokeGlobalFunction(func, [value]);
            } else {
                return func(value);
            }
        };
                
        var dbSpec = spec[dbName].dataSpec;
        for (var key in dbSpec) {
            if (dbSpec.hasOwnProperty(key)) {
                var specValue = dbSpec[key];
                if (isString(specValue)) {
                    normalizedModel[key] = fluid.model.getBeanValue(model, specValue);
                }
                else {
                    var specValueFunc = specValue.func;
                    var specValuePath = specValue.path;
                    if (!validatePathFunc(specValuePath, specValueFunc) || !isString(specValuePath)) {
                        fluid.log("Model Spec Function or Path not found in: " + specValue);
                    } else {
                        normalizedModel[key] = invokeSpecValueFunction(specValueFunc, fluid.model.getBeanValue(model, specValuePath), spec[dbName].mappers);
                    }
                }
            }
        }
        
        return normalizedModel;
    };
    
})(jQuery);