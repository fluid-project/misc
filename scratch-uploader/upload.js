
/* TODO:
 * - abstract the swfobj to handle multiple instances
 * - handle duplicate file error
 * - make fields configurable
 * - size table
 * - scroll table
 * - add scroll to bottom
 * - fix resume
 */

/* ABOUT RUNNING IN LOCAL TEST MODE
 * To run locally using a fake upload, set fileupload_settings.baseURL to ''
 */

var swfObj;	// our handle to the swfupload on this page

var definedFileTypes = {
	allFiles:"*.*",
	imageFiles:"*.gif;*.jpeg;*.jpg;*.png;*.tiff"
};

var fileupload_settings = {
	//baseURL:'http://upload.elicochran.com/' // need to have some kind of server side script to accept files
	baseURL:'', // local doesn't work for testing upload
	tbodyHeight: 200
};

var status ={
	totalBytes:0,
	totalCount:0,
	currCount:0,
	currTotalBytes:0,
	currError:'',
	stop: false
};

var swf_settings = {
	
	// File Upload Settings
	upload_url : fileupload_settings.baseURL + "php/upload.php",
	flash_url : fileupload_settings.baseURL + "swfupload/swfupload_f9.swf",
	post_params: {"PHPSESSID" : "<?php echo $_REQUEST['PHPSESSID']; ?>"},
	
	// File Upload Settings
	file_size_limit : "20480",
	file_types : definedFileTypes.imageFiles, 
	file_types_description : "Image Files",
	file_upload_limit : 0,
	file_queue_limit : 0,

	// Event Handler Settings
	file_dialog_start_handler : fileDialogStart,
	file_queued_handler : fileQueued,
	file_queue_error_handler : fileQueueError,
	file_dialog_complete_handler : fileDialogComplete,
	upload_start_handler : uploadStart,
	upload_progress_handler : uploadProgress,
	upload_complete_handler : uploadComplete,
	upload_error_handler : uploadError, 

	/*
	upload_success_handler : FeaturesDemoHandlers.uploadSuccess,
	*/			
	
	// Debug setting
	debug : true
};

jQuery(document).ready(function() {
	initUploader();
	jQuery('.progress_mask').css('opacity',0.80)
	jQuery('.progress_mask_btm').height(jQuery('.progress').height() - 14);
 });
 
 function initUploader() {
	// initialize the UI
	
	// set the text difference for the instructions based on Mac or Windows
	if (whichOS() == 'MacOS') jQuery('#os_modifier').text('Command');
	
	jQuery('#browseBtn').click(function(){
		if (swf_settings.file_queue_limit === 1) swfObj.selectFile();
		else swfObj.selectFiles();
	});
	jQuery('#uploadBtn').click(function(){
		if (status.totalCount > 0) swfObj.startUpload();
	});
	
	jQuery('#pauseBtn').click(function(){
		swfObj.stopUpload();
	});
	
	// Initialize the uploader SWF component
 	// Check to see if SWFUpload is available
	if (typeof(SWFUpload) === "undefined") return;
	swfObj = new SWFUpload(swf_settings);
	
	// this is a local override to do a fake upload
	if (fileupload_settings.baseURL == '') {
		swfObj.startUpload = function() {
			fakeUpload();
		};
		swfObj.stopUpload = function() {
			status.stop = true;
		};
	}
};

/* DOM Manipulation */

function removeRow(row) {
	row.fadeOut('normal',function(){
		var fileId = row.attr('id');
		var file = swfObj.getFile(fileId);
		status.totalBytes -= file.size;
		status.totalCount--;
		swfObj.cancelUpload(fileId);
		row.remove();
		updateNumFiles();
		updateTotalBytes();
		updateStatusClass();
		updateBrowseBtnText();
	});
}

function updateNumFiles() {
	jQuery('#numFiles').text(numFilesToUpload());
}

function updateTotalBytes() {
	jQuery('#totalBytes').text(filesize(status.totalBytes - status.currTotalBytes));
};

function updateStatusClass(status) {
	if (status === undefined) {
		status = (numFilesInQueue() > 0) ? "loaded" : "empty";
	}
	jQuery('#fFileUp').attr('className',status);
}

function updateBrowseBtnText() {
	var ellipsis = unescape('%u2026');
	if (status.totalCount > 0) jQuery('#browseBtn').text('Add More Files' + ellipsis);
	else jQuery('#browseBtn').html('Browse' + ellipsis);
};

// SWF Upload Actions

function fileQueued(file) {
	try {
		// make a new jQuery object
		// add the size of the file to the variable maintaining the total size
		totalSizeOfQueue(file.size);

		var queue_row = jQuery('<tr id="'+ file.id +'">'
			+ '<td class="fileName">' + file.name + '</td>' 
			+ '<td class="fileSize">' + filesize(file.size) + '</td>'
			+ '<td class="fileStatus">Ready to Upload</td>' 
			+ '<td class="fileRemove"><button type="button" class="removeFileBtn" /></td></tr>');
		// add a hover to the row
		jQuery(queue_row).css('display','none').hover(function(){
			if (!jQuery(this).hasClass('dim')) jQuery(this).addClass('hover');
		},
		function(){
			jQuery(this).removeClass('hover');
		});	
		// add the queue to the list right before the placeholder
		jQuery(queue_row).insertBefore('#file_queue #placeholder');
		// add remove action to the button
		jQuery('#'+ file.id + ' .removeFileBtn').click(function(){
			removeRow(jQuery(this).parents('tr'));
		});
		updateStatusClass();
		updateNumFiles();
		
		// show the row
		jQuery('#'+ file.id).fadeIn('slow');
		
		// set the height but only if it's over the maximum
		// this because max-height doesn't seem to work for tbody
		if (jQuery('#file_queue tbody').height() > fileupload_settings.tbodyHeight) jQuery('#file_queue tbody').height(fileupload_settings.tbodyHeight);
	} catch (ex) {
		this.debug(ex);
	}
}

function fileDialogStart() {
	try {
		// do nothing
	} catch (ex) {
		this.debug(ex);
	}
}

function fileDialogComplete(numSelected, numQueued) {
	try {
		status.currCount = 0;
		status.currTotalBytes = 0;
		status.totalCount = numFilesToUpload();
		updateBrowseBtnText();
		debugStatus();
		// do nothing for now
		
	} catch (ex) {
		this.debug(ex);
	}
}

function fileQueueError(file, error_code, message) {
	try {
		var error_name = "";
		switch (error_code) {
		case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
			error_name = "QUEUE LIMIT EXCEEDED";
			break;
		case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
			error_name = "FILE EXCEEDS SIZE LIMIT";
			break;
		case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
			error_name = "ZERO BYTE FILE";
			break;
		case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
			error_name = "INVALID FILE TYPE";
			break;
		default:
			error_name = "UNKNOWN";
			break;
		}
		var error_string = error_name + ":File ID: " + (typeof(file) === "object" && file !== null ? file.id : "na") + ":" + message;
		debug('error_string = ' + error_string);
	} catch (ex) {
		this.debug(ex);
	}
}	

function uploadStart(fileObj) {
	status.currError = ''; // zero out the error so we can check it later
	status.currCount++;
	setProgress(0,fileObj.name,null,status.currCount,status.totalCount);
	debug(
		"Starting Upload: " + status.currCount + ' (' + fileObj.id + ')' + ' [' + fileObj.size + ']' + ' ' + fileObj.name + ''
	);
};

function uploadError(file, error_code, message) {
	status.currError = '';
	try {
		switch (error_code) {
		case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
			status.currError = "Error Code: HTTP Error, File name: " + file.name + ", Message: " + message;
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
			status.currError = "Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message;
			break;
		case SWFUpload.UPLOAD_ERROR.IO_ERROR:
			status.currError = "Error Code: IO Error, File name: " + file.name + ", Message: " + message;
			break;
		case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
			status.currError = "Error Code: Security Error, File name: " + file.name + ", Message: " + message;
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
			status.currError = "Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message;
			break;
		case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
			status.currError = "Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message;
			break;
		case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
			// If there aren't any files left (they were all cancelled) disable the cancel button
			if (this.getStats().files_queued === 0) {
				document.getElementById(this.customSettings.cancelButtonId).disabled = true;
			}
			progress.SetStatus("Cancelled");
			progress.SetCancelled();
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
			status.currError = "Upload Stopped by user input";
			progress.SetStatus("Stopped");
			hideProgress(true);
			break;
		default:
			progress.SetStatus("Unhandled Error: " + error_code);
			status.currError = "Error Code: " + error_code + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message;
			break;
		}
		debug(status.currError);
	} catch (ex) {
        this.debug(ex);
    }
}

function uploadProgress(fileObj,bytes,totalBytes) {
	debug('File Status :: bytes = ' + bytes + ' :: totalBytes = ' + totalBytes);
	debug('Total Status :: currBytes = ' + (status.currTotalBytes + bytes)  + ' :: totalBytes = ' + status.totalBytes);
	setProgress(derivePercent(bytes,totalBytes),'',derivePercent(status.currTotalBytes + bytes,status.totalBytes));
};

function uploadComplete(file) {
	if (status.currError == '') {
		
		if ((file.index + 1) == status.totalCount) { // we're at the end
			setProgress(100,null,100);
			hideProgress();
		} else {
			status.currTotalBytes += file.size; // now update currTotalByts with the actual file size
			setProgress(100);
			swfObj.startUpload(); // if there hasn't been an error then start up the next upload
			// dim the line
		}
		jQuery('tr#' + file.id).addClass('dim');
		jQuery('tr#' + file.id + ' .fileStatus').text('File Uploaded');
	} else {
		debug(status.currError);
		hideProgress();
	}
};


/* PROGRESS
 * 
*/

var setProgress = function(filePercent,fileName,totalPercent,fileIndex,totalFileNum) {
	// update file information
	if (fileName) jQuery('#file-progress #file_name').text(fileName);
	updateProgress('#file-progress',filePercent);
	// update total info
	if (totalPercent) updateProgress('#total-progress',totalPercent);
	if (totalFileNum) jQuery('#total-progress #total_file_num').text(totalFileNum);
	if (fileIndex) jQuery('#total-progress #file_index').text(fileIndex);
	jQuery('.progress').fadeIn('fast');
};

var updateProgress = function(indicatorId,percent) {
	var percentpercent = percent+'%';
	var progressElm = jQuery(indicatorId + ' .progress-status-indicator');
	var lastPercent = (lastPercent == null || lastPercent == undefined) ? 0 : lastPercent; 
	debug('percent = ' + percent);
	jQuery(indicatorId + ' #percent').text(percent);
	progressElm.queue("fx", []); // deque any left over animations
	if (percent == 0) {
		progressElm.width('0.1%');
	} else if (percent < lastPercent) {
		progressElm.width(percentpercent);
	} else {
		progressElm.animate({ 
    		width: percentpercent,
			queue: false
  		}, 200 );
	}
	lastPercent = percent;
};

var hideProgress = function(justDoIt) {
	var timeOut = 2000;
	if (justDoIt) {
		jQuery('.progress').fadeOut('slow');
	} else {
		var timeOut = setTimeout('hideProgress(true)',3000);
	}
};


/* DATA 
 * 
 */

function totalSizeOfQueue(delta) {
	if (typeof delta == 'number') status.totalBytes += delta;
	updateTotalBytes(status.totalBytes);
	debug("totalBytes = " + status.totalBytes);
	return status.totalBytes;
}

function whichOS() {
	if (navigator.appVersion.indexOf("Win")!=-1) return "Windows";
	if (navigator.appVersion.indexOf("Mac")!=-1) return "MacOS";
	if (navigator.appVersion.indexOf("X11")!=-1) return "UNIX";
	if (navigator.appVersion.indexOf("Linux")!=-1) return "Linux";
	else return "unknown";
}

function numFilesToUpload() {
	return numFilesInQueue() - numFilesUploaded();
};

function numFilesInQueue() {
	return jQuery('#file_queue tbody tr:not("#placeholder")').length ;
}

function numFilesUploaded() {
	return jQuery('#file_queue tbody tr.dim').length;
}

function derivePercent(bytes,totalBytes) {
	return Math.round((bytes*100)/totalBytes);
};

// simple function for return kbytes
// probably should do something fancy that shows MBs if the number is huge
function filesize(bytes) {
	return Math.round(bytes/1028) + ' KB';
};



/* DEV CODE
 * 
 */

function debug(str) {
	if (swf_settings.debug && window.console) console.log(str);
};

function debugStatus() {
	debug(
		"\n status.totalBytes = " + status.totalBytes + 
		"\n status.totalCount = " + status.totalCount + 
		"\n status.currCount = " + status.currCount + 
		"\n status.currTotalBytes = " + status.currTotalBytes + 
		"\n status.currError = " + status.currError
	);
};

var updateObj = {};

var fakeUpload = function() {
	// setttings
	status.stop = false;
	updateObj.bytes = 0;
	updateObj.byteChunk = 220000; // used to break the fake upload into byte-sized chunks

	// set up data
	updateObj.row = jQuery('#file_queue tbody tr:not("#placeholder"):not(".dim)').eq(0);
	updateObj.fileId = jQuery(updateObj.row).attr('id');
	updateObj.fileObj = swfObj.getFile(updateObj.fileId);
	updateObj.bytes = 0;
	updateObj.totalBytes = updateObj.fileObj.size;
	updateObj.numChunks = Math.ceil(updateObj.totalBytes/updateObj.byteChunk);
	debug(updateObj.fileId + ' :: totalBytes = ' + updateObj.totalBytes + ' numChunks = ' + updateObj.numChunks);
	
	// start the fake upload
	uploadStart(updateObj.fileObj);
	
	// perform fake progress
	fakeProgress();	
};

function fakeProgress() {
	if (status.stop == true) {
		fakeStop();
	} else {
		delay = Math.floor(Math.random() * 4000 + 1) > 1;
		var tmpBytes = (updateObj.bytes + updateObj.byteChunk);
		if (tmpBytes < updateObj.totalBytes) {
			debug('tmpBytes = ' + tmpBytes + ' totalBytes = ' + updateObj.totalBytes);
			uploadProgress(updateObj.fileObj, tmpBytes, updateObj.totalBytes);
			updateObj.bytes = tmpBytes;
			var pause = setTimeout('fakeProgress()', delay);
		}
		else {
			uploadProgress(updateObj.fileObj, updateObj.totalBytes, updateObj.totalBytes);
			fakeComplete()
		}
	}  
};

function fakeComplete() {
		// complete the fake (can't call uploadComplete here... seems to create all kinds of pain
	setProgress(100);
		
	jQuery('tr#'+ updateObj.fileObj.id).addClass('dim');
	jQuery('tr#' + updateObj.fileObj.id + ' .fileStatus').text('File Uploaded');	
	status.currTotalBytes += updateObj.fileObj.size; 
	updateNumFiles();
	updateTotalBytes();
	if (jQuery('#file_queue tbody tr:not("#placeholder"):not(".dim)').length === 0) {
		setProgress(100,null,100);
		hideProgress();
		updateStatusClass('done');
	} else {
		var pause = setTimeout('fakeUpload()',1200); // if there hasn't been an error then start up the next upload
	}

}

function fakeStop() {
	hideProgress(true);
}
/*
function makeProgressIndicator(indicatorId) {
	var progBarElm = jQuery('#'+indicatorId);
	var elmWidth = progBarElm.width();
	var elmHeight = progBarElm.height();
	var newIndicator = jQuery('<div class="indicator-background" id="'+ indicatorId +'-progress"><div class="indicator"></div></div>').appendTo(progBarElm);
	jQuery(newIndicator).width(elmWidth);
	jQuery(newIndicator).height(elmHeight);
	return jQuery(newIndicator);
};

*/