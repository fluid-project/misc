/*
 * Written by Nicolaas Matthijs (nicolaas.matthijs@caret.cam.ac.uk)
 *
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global jQuery */

/*
 * jQuery plugin that will load JavaScript and CSS files into the document at runtime.
 */
(function($){
	
	$.Load = {};
	
	/**
	 * Generic function that will insert an HTML tag into the head of the document. This
	 * will be used to both insert CSS and JS files
	 * @param {Object} tagname
	 *  Name of the tag we want to insert. This is supposed to be "link" or "script".
	 * @param {Object} attributes
	 *  A JSON object that contains all of the attributes we want to attach to the tag we're
	 *  inserting. The keys in this object are the attribute names, the values in the object
	 *  are the attribute values 
	 */
	var insertTag = function(tagname, attributes){
		var tag = document.createElement(tagname);
		var head = document.getElementsByTagName('head').item(0);
		for (var a in attributes){
			tag[a] = attributes[a];
		}
		head.appendChild(tag);
	};
		
	/**
	 * Load a JavaScript file into the document
	 * @param {String} URL of the JavaScript file relative to the parent dom.
	 */
	$.Load.requireJS = function(url) {
		insertTag("script", {"src" : url, "type" : "text/javascript", "language" : "JavaScript"});
	};
	
	/**
	 * Load a CSS file into the document
	 * @param {String} URL of the CSS file relative to the parent dom.
	 */
	$.Load.requireCSS = function(url) {
		insertTag("link", {"href" : url, "type" : "text/css", "rel" : "stylesheet"});
	};
	
})(jQuery);