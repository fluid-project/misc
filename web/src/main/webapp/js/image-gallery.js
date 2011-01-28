/*
Copyright 2007-2009 University of California, Berkeley
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery,fluid,gallery,myUpload*/

var gallery = gallery || {};
var myUpload;

(function ($) {
    
    /**
     * Initializes the Infusion Uploader for the AddImages page.
     */
    gallery.initUploader = function () {
        $("#uploader").load("../../components/uploader/html/Uploader.html .flc-uploader", null, function () {
        
            // Show the Uploader's markup immediately, since we're not using progressive enhancement.
            $(".fl-progEnhance-basic").hide();
            $(".fl-progEnhance-enhanced").show();
                    
            // Add the form action.
            $(".flc-uploader").attr("action", "site/AddInformationToImages");
            
            // Initialize the Uploader.
            myUpload = fluid.uploader(".flc-uploader", {
                queueSettings: {
                    // FLUID-2464: For some reason, we seem to have to use an absolute-ish path
                    // in order for uploads to work in both browsers. Seems to have something to do with
                    // the way Flash handles relative paths.
                    uploadURL: "/sakai-imagegallery2-web/site/multiFileUpload",
                    fileTypes: "*.gif;*.jpeg;*.jpg;*.png;*.tiff;*.tif"
                },
                
                components: {
                    strategy: {
                        options: {
                            flashMovieSettings: {
                                flashURL: "../../lib/swfupload/flash/swfupload.swf",
                                flashButtonImageURL: "../../components/uploader/images/browse.png",
                                debug: true
                            }
                        }
                    }
                },

                listeners: {
                    afterUploadComplete: function () {
                        if (myUpload.queue.getReadyFiles().length === 0 && 
                            myUpload.queue.getErroredFiles().length === 0) { 
                            // we're really really done
                            // display the meta data editing page after a brief delay so that the user 
                            // can see that the upload is complete
                            var delay = setTimeout(function(){
                                 myUpload.container.submit();
                            },2000);
                        }
                    }
                }
            });

            // Keep track of what's been added in this go-round so that those
            // images can be shown on the next page. (Alternatively, you
            // might set up another panel on this page to accumulate thumbnails
            // as each file is successfully consumed.           
            myUpload.events.afterFileComplete.addListener(function (file){
                myUpload.container.append('<input type="hidden" name="imageIds" value="' + 
                                            myUpload.queue.getUploadedFiles().length + '"/>');
            });
            customizeUploaderForImageGallery();
        });
    };
    
    var customizeUploaderForImageGallery = function () {
        var formElement = myUpload.container;
        formElement.attr("action", "../AddInformationToImages");
        formElement.attr("enctype", "multipart/form-data");
    };
    
    // Initialize the Uploader as soon as the DOM is ready.
    $(gallery.initUploader);
})(jQuery);
