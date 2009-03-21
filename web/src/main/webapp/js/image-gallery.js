/* CSS for the Image-Gallery 2 project */

var myUpload;

var initUploader = function () {  
    jQuery(function () {
        jQuery("#uploader").load("../../fluid-components/html/templates/Uploader.html #uploader-contents", null, function () {
            
            // Add the form actions.
            jQuery(".fl-uploader").attr("action", "site/AddInformationToImages");
            jQuery(".fl-progressive-enhanceable").attr("action", "site/singleFileUpload");
            
            // Initialize the Uploader.
            myUpload = fluid.progressiveEnhanceableUploader(".fl-uploader", ".fl-ProgEnhance-hide", {
                uploadManager: {
                    type: "fluid.swfUploadManager",
                        
                    options: {
                        flashURL: "../../fluid-components/flash/swfupload.swf",
                        uploadURL: "../../site/multiFileUpload",
                        fileTypes: "*.gif;*.jpeg;*.jpg;*.png;*.tiff",
                        debug: true
                    }
                },
                
                listeners: {
                    afterFileUploaded: function (file, serverData){
         				// Keep track of what's been added in this go-round so that those
        				// images can be shown on the next page. (Alternatively, you
        				// might set up another panel on this page to accumulate thumbnails
        				// as each file is successfully consumed.)
        				jQuery('#new-image-form').append('<input type="hidden" name="imageIds" value="' + 
                                                         serverResponse + '"/>');
                    },
                    
          
                    afterUploadComplete: function () {
                        if (myUpload.uploadManager.queue.getReadyFiles().length === 0 && myUpload.uploadManager.queue.getErroredFiles().length === 0) { // we're really really done
                             window.location.href = "/sakai-imagegallery2-web/site/BrowseImages/";
                         }
                    }
                },
                
                decorators: {
                    type: "fluid.swfUploadSetupDecorator",
                    options: {
                        flashButtonImageURL: "../../fluid-components/images/uploader/browse.png"
                    }
                }
            });
        });
    });
};      