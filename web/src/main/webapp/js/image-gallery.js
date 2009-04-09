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
        $("#uploader").load("../../components/uploader/html/Uploader.html #uploader-contents", null, function () {
        
            // Show the Uploader's markup immediately, since we're not using progressive enhancement.
            $(".fl-ProgEnhance-basic").hide();
            $(".fl-ProgEnhance-enhanced").show();
                    
            // Add the form action.
            $(".flc-uploader").attr("action", "site/AddInformationToImages");
            
            // Initialize the Uploader.
            myUpload = fluid.uploader(".flc-uploader", {
                uploadManager: {
                    type: "fluid.swfUploadManager",
                        
                    options: {
                        flashURL: "../../lib/swfupload/flash/swfupload.swf",
                        
                        // FLUID-2464: For some reason, we seem to have to use an absolute-ish path
                        // in order for uploads to work in both browsers. Seems to have something to do with
                        // the way Flash handles relative paths.
                        uploadURL: "/sakai-imagegallery2-web/site/multiFileUpload",
                        fileTypes: "*.gif;*.jpeg;*.jpg;*.png;*.tiff",
                        debug: true
                    }
                },
                
                listeners: {
                    afterUploadComplete: function () {
                        if (myUpload.uploadManager.queue.getReadyFiles().length === 0 && myUpload.uploadManager.queue.getErroredFiles().length === 0) { // we're really really done
                            window.location.href = "../BrowseImages/";
                        }
                    }
                },
                
                decorators: {
                    type: "fluid.swfUploadSetupDecorator",
                    options: {
                        flashButtonImageURL: "../../components/uploader/images/browse.png"
                    }
                }
            });
        });
    };
    
    // Initialize the Uploader as soon as the DOM is ready.
    $(gallery.initUploader);
})(jQuery);