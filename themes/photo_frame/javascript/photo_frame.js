var PhotoFrame = function() {};

(function($) {
	
	PhotoFrame.Class = Base.extend({
		
		/**
		 * Build Date
		 */
		buildDate: '2013-04-10',
		
		/**
		 * Version
		 */
		version: '.950',
		
		/**
		 * Sets the default options
		 *
		 * @param	object 	The default options
		 * @param	object 	The override options
		 */
		constructor: function(_default, options) {
			if(typeof _default != "object") {
				var _default = {};
			}
			if(typeof options != "object") {
				var options = {};
			}
			this.setOptions($.extend(true, _default, options));
		},
		
		/**
		 * Get an single option value. Returns false if option does not exist
		 *
		 * @param 	string 	The name of the option
		 * @return	mixed
		 */		
		 
		getOption: function(index) {
			if(this[index]) {
				return this[index];
			}
			return false;
		},
		
		/**
		 * Get all options
		 *
		 * @return	bool
		 */		
		 
		getOptions: function() {
			return this;
		},
		
		/**
		 * Set a single option value
		 *
		 * @param 	string 	The name of the option
		 * @param 	mixed 	The value of the option
		 */		
		 
		setOption: function(index, value) {
			this[index] = value;
		},
		
		/**
		 * Set a multiple options by passing a JSON object
		 *
		 * @param 	object 	The object with the options
		 * @param 	mixed 	The value of the option
		 */		
		
		setOptions: function(options) {
  			for(key in options) {
	  			this.setOption(key, options[key]);
  			}
		}
	});
	
	PhotoFrame.Factory = PhotoFrame.Class.extend({
		
		/**
		 * The default CSS classes
		 */		
		
		classes: {
			actionBar: 'photo-frame-action-bar',
			activity: 'photo-frame-activity',
			aspect: 'aspect',
			barButton: 'photo-frame-bar-button',
			browse: 'photo-frame-browse',
			button: 'photo-frame-button',
			cancel: 'photo-frame-cancel',
			close: 'photo-frame-close',
			crop: 'photo-frame-crop',
			cropPhoto: 'photo-frame-crop-photo',
			editPhoto: 'photo-frame-edit',
			deletePhoto: 'photo-frame-delete',
			dimmer: 'photo-frame-dimmer',
			dragging: 'photo-frame-dragging',
			dropCover: 'photo-frame-drop-cover',
			dropText: 'photo-frame-drop-text',
			dropZone: 'photo-frame-drop-zone',
			errors: 'photo-frame-errors',
			form: 'photo-frame-form',
			floatLeft: 'photo-frame-float-left',
			floatRight: 'photo-frame-float-right',
			helper: 'photo-frame-helper',
			icons: 'photo-frame-icons',
			invalid: 'photo-frame-invalid',
			id: 'photo-frame-ie',
			indicator: 'photo-frame-indicator',
			instructions: 'photo-frame-instructions',
			infoPanel: 'photo-frame-info-panel',
			jcropTracker: 'jcrop-tracker',
			jcropHolder: 'jcrop-holder',
			message: 'photo-frame-message',
			meta: 'photo-frame-meta',
			metaToggle: 'photo-frame-meta-toggle',
			metaClose: 'photo-frame-close-meta',
			panel: 'photo-frame-panel',
			photo: 'photo-frame-photo',
			progress: 'photo-frame-progress',
			preview: 'photo-frame-preview',
			save: 'photo-frame-save',
			saving: 'photo-frame-saving',
			size: 'size',
			sortable: 'photo-frame-sortable',
			sortablePlaceholder: 'photo-frame-sortable-placeholder',
			toolbar: 'photo-frame-toolbar',
			upload: 'photo-frame-upload',
			wrapper: 'photo-frame-wrapper'
		},	
		/**
		 * The object of the photo being cropped
		 */		
		 
		cropPhoto: false,
				 
		/**
		 * Force users to crop new photos?
		 */		
		 
		forceCrop: true,
		 
		/**
		 * Disable users from cropping photos?
		 */		
		 
		disableCrop: false,
		
		/**
		 * Icon Classes
		 */		
		 
		icons: {
			cancel: 'icon-cancel',
			editPhoto: 'icon-edit',
			deletePhoto: 'icon-trash',
			info: 'icon-info',
			save: 'icon-save',
			warningSign: 'icon-warning-sign'
		},	
		 
		/**
		 * The wrapping DOM object
		 */		
		 
		$wrapper: false,
				
		/**
		 * Photos Array.
		 */		
		 
		photos: [],
		
		/**
		 * Crop Settings.
		 */		
		 
		settings: {},
				
		/**
		 * An object of UI elements.
		 */		
		 
		ui: {},
		
		/**
		 * Constructor to set the options and UI events.
		 *
		 * @param object  The wrapper object
		 * @param object  An array of options to be set
		 */		
		 
		constructor: function(obj, options) {
			
			var t      = this;
			var photos = options.photos;
			
			delete options.photos;
			
			t.$wrapper = $(obj);
			t.sortable();	
			t.base(options);	
			t.photos = [];
			
			t.ui = {
				body: $('body'),
				browse: t.$wrapper.find('.'+t.classes.browse),
				upload: t.$wrapper.find('.'+t.classes.upload),
				form: $('#'+t.classes.upload),
				dimmer: $('.'+t.classes.dimmer),
				activity: $('.'+t.classes.activity),
				preview: t.$wrapper.find('.'+t.classes.preview),
				//del: t.$wrapper.find('.photo-frame-delete'),
				//edit: t.$wrapper.find('.photo-frame-edit'),
				helper: t.$wrapper.find('.'+t.classes.helper)
			}
			
			var html = [
				'<form id="'+t.classes.upload+'" class="'+t.classes.form+' '+t.classes.wrapper+' '+t.classes.icons+'" action="'+t.url+(t.IE() ? '&ie=true' : '')+'" method="POST" enctype="multipart/form-data" id="'+t.classes.upload+'-'+t.index+'" '+(t.IE() ? 'target="photo-frame-iframe-'+t.index+'"' : '')+'>',
					'<h3>Select a file to upload...</h3>',
					'<input type="file" name="files[]" multiple>',
					'<button type="submit" class="'+t.classes.button+'"><span class="icon-upload"></span>'+t.buttonText+'</button>',
				'</form>'
			].join('');
			
			t.ui.form = $(html);
			
			t.ui.form.submit(function() {
				if(t.IE()) {
					t.startUpload();
				}
			});
			
			t.ui.body.append(t.ui.form);
			t.ui.window = $(window);
			
			var html = [
				'<div class="'+t.classes.dimmer+' '+t.classes.icons+'">',
					'<a href="#" class="'+t.classes.metaToggle+'"><span class="'+t.icons.info+'"></span></a>',
					'<div class="'+t.classes.infoPanel+'">',
						'<a href="#" class="'+t.classes.close+'"><span class="'+t.icons.cancel+'"></span></a>',
						'<p class="'+t.classes.size+'">W: <span class="width"></span> H: <span class="height"></span></p>',
						'<div class="coords">',
							'<p>',
								'<label><b>X</b>: <span class="x"></span></label>',
								'<label><b>Y</b>: <span class="y"></span></label>',
							'</p>',
							'<p>',
								'<label><b>X2</b>: <span class="x2"></span></label>',
								'<label><b>Y2</b>: <span class="y2"></span></label>',
							'</p>',
						'</div>',
						'<p class="'+t.classes.aspect+'"></p>',
					'</div>',
					'<div class="'+t.classes.activity+'">',
						'<span class="'+t.classes.indicator+'"></span> <p>Uploading...</p>',
						'<a class="'+t.classes.button+' '+t.classes.cancel+'"><span class="'+t.icons.cancel+'"></span> Cancel</a>',
					'</div>',
					'<div class="'+t.classes.progress+'"></div>',
					'<div class="'+t.classes.errors+'">',
						'<h3>Errors</h3>',
						'<ul></ul>',
						'<a class="'+t.classes.button+' '+t.classes.cancel+'"><span class="'+t.icons.cancel+'"></span> Close</a>',
					'</div>',
					'<div class="'+t.classes.crop+'">',
						'<div class="'+t.classes.cropPhoto+'"></div>',
						'<div class="'+t.classes.meta+'">',
							'<a href="#" class="'+t.classes.metaClose+' '+t.classes.floatRight+'"><span class="'+t.icons.cancel+'"></span></a>',
							'<h3>Photo Details</h3>',
							'<ul>',
								'<li>',
									'<label for="title">Title</label>',
									'<input type="text" name="title" value="" id="title" />',
								'</li>',
								'<!-- <li>',
									'<label for="keywords">Keywords</label>',
									'<input type="text" name="keywords" value="" id="keywords" />',
								'</li> -->',
								'<li>',
									'<label for="title">Description</label>',
									'<textarea name="description" id="description"></textarea>',
								'</li>',
							'</ul>',
						'</div>',
						'<div class="'+t.classes.toolbar+'">',
							'<a class="'+t.classes.barButton+' '+t.classes.cancel+' '+t.classes.floatLeft+'"><span class="'+t.icons.cancel+'"></span> Cancel</a>',
							'<a class="'+t.classes.barButton+' '+t.classes.save+' '+t.classes.floatRight+'"><span class="'+t.icons.save+'"></span> Save</a>',
						'</div>',
					'</div>',
				'</div>'
			].join('');
			
			t.ui.dimmer  = $(html);
			t.ui.toolbar = t.ui.dimmer.find('.'+t.classes.toolbar);
			t.ui.toolbar.hide();
			t.ui.body.append(t.ui.dimmer);
		
			if(t.infoPanel) {
				t.ui.info = t.ui.dimmer.find('.'+t.classes.infoPanel);
				t.ui.info.draggable();
				t.ui.info.find('.'+t.classes.close).click(function(e) {			
					t.ui.info.fadeOut();
					e.preventDefault();
				});
			}
					
			//t.ui.activity = t.ui.dimmer.find('.'+t.classes.activity);
			//t.ui.activity.find('.photo-frame-indicator').activity({color: '#fff'});
			
			t.ui.progress        = t.ui.dimmer.find('.'+t.classes.progress);
			t.ui.save            = t.ui.dimmer.find('.'+t.classes.save);
			t.ui.cancel          = t.ui.dimmer.find('.'+t.classes.cancel);
			t.ui.errors          = t.ui.dimmer.find('.'+t.classes.errors);
			t.ui.errorCancel     = t.ui.dimmer.find('.'+t.classes.errors+' .'+t.classes.cancel);
			t.ui.crop            = t.ui.dimmer.find('.'+t.classes.crop);
			t.ui.cropPhoto       = t.ui.dimmer.find('.'+t.classes.cropPhoto);
			t.ui.meta            = t.ui.dimmer.find('.'+t.classes.meta);
			t.ui.metaToggle      = t.ui.dimmer.find('.'+t.classes.metaToggle);
			t.ui.metaClose       = t.ui.dimmer.find('.'+t.classes.metaClose);
			t.ui.metaTitle       = t.ui.meta.find('#title');
			t.ui.metaDescription = t.ui.meta.find('#description');
			t.ui.metaKeywords    = t.ui.meta.find('#keywords');
			t.ui.dropZone        = t.$wrapper.find('.'+t.classes.dropZone);
			
			$(window).keyup(function(e) {
				if (e.keyCode == 27) { 
					t.ui.cancel.click();
				} 
			});
				
			t.progressBar   = new PhotoFrame.ProgressBar(t.ui.progress, {
				callbacks: {
					cancel: function() {
						if(t.jqXHR) {
							t.jqXHR.abort();
						}
						
						t.ui.dimmer.fadeOut();
						t.resetProgress();
					}
				}
			});
			
			t.ui.errorCancel.click(function(e) {			
				t.clearNotices();			
				t.ui.dimmer.fadeOut('fast');	
				t.hideMeta();
				t.hideProgress();
				e.preventDefault();
			});
			
			if(!t.IE()) {
				
				t.ui.form.fileupload({
					//url: '/live/home/index',
					started: function() {
						//t.ui.dropZone.hide();
						t.showProgress(0);
					},
					progress: function(e, data) {
						t.showProgress(parseInt(data.loaded / data.total * 100));
					},
					singleFileUploads: false,
					dropZone: t.ui.dropZone,
					url: t.url,
					add: function (e, data) {
						t.ui.dropZone.hide();
						t.initialized = false;
						t.showProgress(0);
						t.startUpload(data.files, function() {
							t.jqXHR = data.submit();
						});
					},
					fail: function (e, data) {
						t.showErrors(['An unexpected error has occurred. Please try again.']);	
					},
					done: function (e, data) {
						var errors = [];
										
						if(typeof data.result[0] == "undefined") {							
							errors = ['An unexpected error has occurred. Please try again.'];
						}	
						
						if(typeof data.result == "object" && data.result.length == 1) {
							t.hideProgress(function() {
								t._uploadResponseHandler(data.result[0]);
							});
						}
						else {
							var count = 1;
							if(typeof data.result[0].success != "undefined") {
								$.each(data.result, function(i, result) {
									t._uploadResponseHandler(result, true, true, function() {
										if(count == data.result.length) {
											t.hideProgress();
											t.hideDimmer();
										}
										count++;
									});
								});
							}
							else {
								t.hideProgress();
								t.showErrors(errors);
							}
						}
					}
		    	});
	    	}
	    	else {
		    	t.ui.iframe = $('<iframe name="photo-frame-iframe-'+t.index+'" id="photo-frame-iframe-'+t.index+'" src="#" style="display:none;width:0;height:0"></iframe>');
		    	t.ui.body.append(t.ui.iframe);
	    	}
	    	
	    	for(x in photos) {
		    	var photo = photos[x];
		    	
		    	new PhotoFrame.Photo(t, photo, {
		    		id: photo.id,
		    		index: x,
		    		settings: {
			    		setSelect: [photo.x, photo.y, photo.x2, photo.y2]	
		    		},
			    	$wrapper: t.$wrapper.find('#'+t.classes.photo+'-'+t.fieldId+'-'+x)
		    	});
	    	}
	    	
	    	if(t.isAssetsInstalled()) {
				t.assetSheet = new Assets.Sheet({
				    multiSelect: true,
				    filedirs: [t.dirId],
				    kinds: ['image'],
				    onSelect: function(files) {
				    	t.edit = false;
				    	
				    	if(files.length == 1) {
				    		t.showProgress(0, function() {
					    		t._fileBrowserResponseHandler(files[0].url, function(response) {
					    			t.showProgress(100, function() {
						    			t._uploadResponseHandler(response);
					    			});	
					    		});
					    	});
				    	}
				    	else {
			    			t.showProgress(0, function() {
					    		var count = 1;
					    		
						    	$.each(files, function(i, file) {
							    	t._fileBrowserResponseHandler(file.url, function(response) {
							    		var progress = parseInt(count / files.length * 100);
							    		t._assetResponseHandler(response, progress);
							    		count++;
							    	});
						    	});
			    			});
				    	}
				    }
				});
			}
			
			$(window).resize(function() {
				if(t.ui.crop.css('display') != 'none') {
					t.ui.crop.center();
				}				
				if(t.ui.meta.css('display') != 'none') {
					t.ui.meta.center();
				}				
				if(t.ui.saving) {
					t.ui.saving.center();
				}				
				if(t.ui.errors.css('display') != 'none') {
					t.ui.errors.center();
				}
			});
			
	    	t.ui.metaToggle.click(function(e) {
		    	t.toggleMeta();	    		    	
		    	e.preventDefault();
	    	});
	    	
	    	t.ui.metaClose.click(function(e) {
	    		t.hideMeta();
		    	e.preventDefault();
	    	});
	    	
			t.ui.browse.click(function() {
				if(t.isAssetsInstalled()) {
					t.assetSheet.show();
				}
			});
			
			t.ui.browse.click(function() {
				if(t.isAssetsInstalled()) {
					t.assetSheet.show();
				}
			});
			
			if(!t.isAssetsInstalled()) {
				if(!t.safecracker) {
					$.ee_filebrowser.add_trigger(t.ui.browse, t.directory.id, {
						content_type: 'images',
						directory:    t.directory.id,
					}, function(file, field){
						t.showProgress(0, function() {
				    		t._fileBrowserResponseHandler(file.rel_path, function(response) {
				    			t.showProgress(100, function() {
					    			t._uploadResponseHandler(response);
				    			});				    			
				    		});
				    	});
					});
				}
			}
			
			t.$wrapper.bind('dragover', function(e) {
				var obj 	= t.$wrapper.find('.'+t.classes.dropText);
				var parent  = obj.parent();
				
				console.log('over');
				
				t.ui.dropZone.show();
				
				obj.position({
					of: parent,
					my: 'center',
					at: 'center'
				});
				
				t.$wrapper.addClass(t.classes.dragging);
												
				e.preventDefault();
			});
			
			t.$wrapper.find('.'+t.classes.dropCover).bind('drop dragleave', function(e) {
				
				if(!$(e.target).hasClass(t.classes.dropTag)) {				
					t.$wrapper.removeClass(t.classes.dragging);
				}
				
				e.preventDefault();
			});
				
			t.ui.upload.click(function(e) {
				t.isNewPhoto = true;
				
				if(!t.IE()) {
					// All this extra code is there to support older versions of Chrome and 
					// Safari. File inputs cannot be triggered if the form or field is hidden.
					// This is best hack I could find at the time. - 1/9/2013
					t.ui.form.css({
						position: 'absolute',
						left: -1000	
					}).show();
					
					t.ui.form.find('input').show().click();
				}
				else {
					t.ui.dimmer.show();
					t.ui.crop.hide();
					
					if(t.ui.instructions) {
						t.ui.instructions.hide();
					}
					
					//t.ui.cropPhoto.hide();
					t.ui.form.show().center();
				}
						
				e.preventDefault();
			});
		},
		
		showError: function(error) {
			var t = this;
			t.hideProgress(function() {
				t.ui.errors.find('ul').append('<li>'+error+'</li>');
				t.ui.errors.show();
				t.ui.errors.center();
				t.ui.dimmer.fadeIn();
				t.progressBar.reset();
			});
		},
		
		showErrors: function(errors) {
			var t = this;
			t.ui.errors.find('ul').html('');
			t.ui.errors.hide();
			t.ui.activity.hide();
			t.ui.crop.hide();
			
			$.each(errors, function(i, error) {
				t.showError(error);
			});
		},
		
		hideDimmer: function(callback) {
			this.hideInstructions();
			this.ui.dimmer.hide(callback);
			this.progressBar.reset();
		},
		
		sortable: function() {    	
			if(this.sortable) {
			    this.ui.list = this.$wrapper.find('.'+this.classes.sortable);
			    this.ui.list.sortable({placeholder:this.classes.sortablePlaceholder});
	            this.ui.list.disableSelection();
			}
		},
		
		clearNotices: function(callback) {
			for(x in this.notices) {
				this.notices[x].clear(callback);
			}			
		},
		
		notify: function(notifications, delay, animation) {
			var t = this;
			var $panel   = $('.'+t.classes.panel);
			var messages = [];
				
			if(!delay) {
				delay = 190;	
			}
			
			if(!animation) {
				animation = 300;
			}
			
			function show() {
				var html = $('<div class="'+t.classes.panel+' '+t.classes.icons+'" />');
				
				$.each(notifications, function(i, message) {
					message = $([
						'<div class="'+t.classes.message+'">',
							'<p><span class="'+t.icons.warningSign+'"></span>'+message+'</p>',
							'<a href="#" class="'+t.classes.close+'"><span class="'+t.icons.cancel+'"></span></a>',
						'</div>'
					].join(''));
					
					messages.push(message);
					html.append(message);
				});
				
				$('body').append(html);
			}
			
			if($panel.length == 1) {
				$panel.fadeOut(function() {
					$panel.remove();
					t.notify(notifications, delay, animation);
				});
			}
			else {
				show();
			}
			
			var loopDelay  = 0;
			var closeDelay = 0;
			
			$.each(messages, function(i, message) {
			
				setTimeout(function() {
					
					$(message).animate({
						right: 50
					}, animation, function() {
						
						setTimeout(function() { 
							$(message).animate({right: -$(message).width()-75}, animation);
						}, 5000 + closeDelay);
						
						closeDelay = (delay*(i+1));
					});
					
				}, loopDelay);
				
				loopDelay = (delay*(i+1));
			});
			
			$('.photo-frame-message .photo-frame-close').click(function() {
				$(this).parent().fadeOut('fast');
			});
			
			return notifications;
		},
		
		getTotalPhotos: function() {
			var count = 0;
			
			$.each(this.photos, function(i, photo) {
				if(photo) {
					count++;
				}	
			});
			
			return count;	
		},
		
		_assetResponseHandler: function(response, progress, callback) {
			var t = this;
			
			if(typeof progress == "function") {
    			callback = progress;
    			progress = 100;
			}
			
			if(typeof progress == "undefined" || progress === false) {
				var progress = 100;
			}
			
			t.showProgress(progress, function() {
				t._uploadResponseHandler(response, true, true, function(response) {
					
	    			t.hideDimmer();
	    			t.resetProgress();
	    			t.hideProgress();
	    			
	    			if(typeof callback == "function") {
		    			callback(response);
	    			}
    			
				});
			});
		},
		
		_uploadResponseHandler: function(response, existingAsset, noCrop, callback) {
			
			if(typeof existingAssets == "function") {
				callback = existingAsset;
				existingAssets = false;
			}
			if(typeof noCrop == "function") {
				callback = existingAsset;
				noCrop   = false;
			}
			
			this.response = response;			
			this.ui.toolbar.hide();
			
			if(this.response.success) {
				if(!existingAsset) {
					this.$wrapper.append('<textarea name="'+this.fieldName+'[][uploaded]" style="display:none">{"field_id": "'+this.fieldId+'", "col_id": "'+this.colId+'", "row_id": "'+this.rowId+'", "path": "'+this.response.file_path+'", "original_path": "'+this.response.original_path+'", "file": "'+this.response.file_name+'"}</textarea>');
				}
				
				var props = $.extend(true, {}, {
					settings: this.settings,
					compression: this.compression,
					size: this.size,
					forceCrop: this.forceCrop,
					disableCrop: this.disableCrop,
					//resize: this.resize,
					//resizeMax: this.resizeMax,
					index: this.photos.length,
					
				});
				
				var photo = new PhotoFrame.Photo(this, response, props);
				
				if(!noCrop && photo.forceCrop && !photo.disableCrop) {
					this.hideProgress(function() {
						photo.startCrop();
					});
				}
				else {
					photo._loadFromResponse(response, function() {
						photo.factory.hideProgress(function() {
							photo.factory.hideDimmer();
							if(typeof callback == "function") {
								callback();
							}
						});
					});
				}
			}
			else {
				this.showErrors(this.response.errors);	
			}
		},
		
		/**
		 * Returns TRUE if the user is using InternetExplorer, otherwise
		 * returns FALSE.
		 *
		 * @return	bool
		 */		
		 
		IE: function() {
			return this.$wrapper.children().hasClass(this.classes.ie);
		},
		
		hideInstructions: function() {
			if(this.ui.instructions) {
				this.ui.instructions.hide();
				this.ui.instructions.remove();
			}	
		},
		
		_fileBrowserResponseHandler: function(file, callback) {
			var t = this;
			
			$.get(t.responseUrl, 
				{
					field_id: t.fieldId, 
					col_id: t.colId,
					file: file
				}, function(response) {
					if(typeof callback == "function") {
						callback(response);
					}
				}
			);
		},
		
		isAssetsInstalled: function() {
			if(typeof Assets == "object" && this.useAssets) {
				return true;
			}
			return false;
		},
		
		hideMeta: function() {	
			this.ui.metaToggle.removeClass('active');	
			this.ui.meta.fadeOut('fast');
		},
		
		hideUpload: function() {
			this.ui.upload.hide();
			this.ui.browse.hide();
			this.ui.helper.hide();	
		},
		
		/**
		 * Show the progress bar.
		 */	
		 	
		hideProgress: function(callback) {
			this.progressBar.hide(callback);
		},
		
		resetMeta: function() {	
			this.ui.metaTitle.val('');
			this.ui.metaKeywords.val('');
			this.ui.metaDescription.val('');
		},
		
		/**
		 * Resets the progress bar.
		 */		
		 
		resetProgress: function() {
			if(typeof show == "undefined") {
				var show = true;	
			};
			
			this.ui.crop.hide();
			this.ui.activity.hide();
			this.progressBar.reset();
		},
						
		showMeta: function() {
			this.ui.metaToggle.addClass('active');	
			this.ui.meta.fadeIn('fast');
			this.ui.meta.center();
			this.ui.metaTitle.focus();
		},
		
		showUpload: function() {
			this.ui.upload.show();
			this.ui.browse.show();
			this.ui.helper.show();	
		},
		
		startUpload: function(files, callback) {
			var t = this;
			
			if(typeof files == "function") {
				callback = files;
				files    = [];	
			}
			
			if(t.IE()) {
				t.ui.form.hide();
			}
			
			if(files.length == 1) {
				t.ui.errors.hide();
				t.ui.crop.hide();
			}
			
			t.ui.crop.hide();
			t.ui.dimmer.fadeIn(function() {
				if(typeof callback == "function") {
					callback();	
				}
			});
		},
		
		/**
		 * Show the progress bar.
		 */		
		showProgress: function(progress, callback) {
			this.ui.dimmer.fadeIn();
			this.ui.errors.hide();
			this.progressBar.show();
			this.progressBar.set(progress, callback);
			this.hideMeta();
			this.hideInfo();
		},
				
		toggleMeta: function() {
			if(this.ui.meta.css('display') == 'none') {
				this.showMeta();
			}
			else {
				this.hideMeta();
			}
		},
		
		hideInfo: function(callback) {
			if(this.ui.info) {
				this.ui.info.hide(callback);
			}
		},
		
		showInfo: function(callback) {
			if(this.ui.info) {
				this.ui.info.fadeIn
				(callback);
			}
		}
		
	});
	
	
	PhotoFrame.Photo = PhotoFrame.Class.extend({
			
		/**
		 * Image Compression (1-100)
		 */	
		 
		compression: 100,
		
		/**
		 * Photo Description
		 */	
		 
		description: '',
		 	
		/**
		 * Disable users from cropping photos?
		 */		
		 
		disableCrop: false,
		
		/**
		 * Is this photo being edit? If false, then a new photo
		 */	
		 
		edit: false,
		 
		/**
		 * The Photo Frame Factory object
		 */	
		
		factory: false,
			 
		/**
		 * Force users to crop new photos?
		 */		
		 
		forceCrop: true,
		 
		/**
		 * Photo Index
		 */	
		 
		index: false,
		
		/**
		 * Photo ID
		 */	
		 
		id: false,
			
		/**
		 * jCrop object
		 */	
		 
		jcrop: false,
		
		/**
		 * Photo Keywords
		 */	
		 
		keywords: '',
		
		/**
		 * Resize (expiremental)
		 */	
		 
		resize: false,
		 
		/**
		 * Resize Max (expiremental)
		 */	
		 
		resizeMax: false,
		 
		/**
		 * Rotate Degrees
		 */	
		 
		rotate: false,
		 
		/**
		 * Default Crop Size
		 */
		 
		scale: false,
		 
		/**
		 * Default Crop Size
		 */
		 
		size: false,
		 
		/**
		 * Crop Settings
		 */
		 
		settings: {},
		
		/**
		 * Photo Title
		 */	
		 
		title: '',
		 		
		/**
		 * An object of UI elements
		 */	
		 
		ui: {
			actionBar: false,
			edit: false,
			del: false,
			image: false,
			photo: false,
			saving: false
		},
					
		/**
		 * The photo URL
		 */
		 
		url: false,
					
		/**
		 * Has the crop utility been released?
		 */
		 
		released: false,
				
		/**
		 * The wrapping DOM object
		 */
		 
		$wrapper: false,
		
		/**
		 * Constructor to set the options and UI events.
		 *
		 * @param object  The wrapper object
		 * @param object  An array of options to be set
		 */	
		 	
		constructor: function(factory, response, options) {	
			var t = this;
			
			t.ui = $.extend(true, {}, t.ui);
			
			//t.settings    = factory.settings;
			
			t.base(options);
			
			t.factory     = factory;
			t.response    = response;
			t.originalUrl = response.original_url;
			t.url         = response.file_url;
						
			if(!t.index) {
				t.index = t.factory.getTotalPhotos();
			}
			
			if(t.$wrapper) {
				t._loadFromObj(t.$wrapper);
			}
			else {
				t._bindClickEvents();
			}
			
			factory.photos.push(t);
		},
		
		_loadFromResponse: function(response, callback) {
			var t    = this;
			var html = $([
			    '<li>',
    				'<div class="'+t.factory.classes.photo+'" id="'+t.factory.classes.photo+'-'+t.factory.fieldId+'-'+t.index+'">',			
    					'<div class="'+t.factory.classes.actionBar+'">',
    						(!t.factory.disableCrop ? '<a href="#'+t.index+'" class="'+t.factory.classes.editPhoto+'"><span class="'+t.factory.icons.editPhoto+'"></span></a>' : ''),
    						'<a href="#'+t.index+'" class="'+t.factory.classes.deletePhoto+'"><span class="'+t.factory.icons.deletePhoto+'"></span></a>',
    					'</div>',
    				'</div>',
				'</li>'
			].join(''));
			
			t.load(function(img) {
				var obj = html.find('.'+t.factory.classes.photo);
				
				t._sendCropRequest(function(cropResponse) {
					obj.prepend(img).append(t._generateNewDataField(cropResponse.save_data));
					t.factory.ui.preview.find('ul').append(html);
					t._loadFromObj(obj, callback);
				});				
			});
		},
		
		_loadFromObj: function(obj, callback) {
			var t    = this;
			
			t.edit 		   = t;	
			t.ui.photo 	   = $(obj);
			t.ui.parent    = t.ui.photo.parent();
			t.ui.actionBar = t.ui.parent.find('.'+t.factory.classes.actionBar);
			t.ui.edit	   = t.ui.actionBar.find('.'+t.factory.classes.editPhoto);
			t.ui.del	   = t.ui.actionBar.find('.'+t.factory.classes.deletePhoto);
			t.ui.field     = t.ui.photo.find('textarea');
			
			t._bindClickEvents();
			
			if(typeof callback == "function") {
				callback();
			}
		},
		
		_bindClickEvents: function() {
			var t = this;
			
			if(t.ui.edit) {
				t.ui.edit.unbind('click').click(function(e) {
					t.startCrop();					
					e.preventDefault();
				});
			}
			
			if(t.ui.del) {
				t.ui.del.unbind('click').click(function(e) {
					t.remove();									
					e.preventDefault();
				});
			}
		},
		
		remove: function() {
			var t = this;
			
			t.ui.field.remove();
			
			if(t.id !== false) {
				t.factory.$wrapper.append('<input type="hidden" name="photo_frame_delete_photos['+t.factory.fieldId+'][]" value="'+t.id+'" />');
			}
					
			t.ui.parent.fadeOut(function() {
				t.ui.parent.remove();
				
				if((t.factory.maxPhotos > 0 && t.factory.maxPhotos > t.factory.getTotalPhotos() - 1) || (t.factory.minPhotos == 0 && t.factory.maxPhotos == 0)) {
					t.factory.showUpload();
				}
				else {
					t.factory.hideUpload();
				}
				
				t.factory.photos[t.index] = false;								
			});
		},
		
		showMeta: function() {
			this.factory.showMeta();	
		},
		
		hideMeta: function() {
			this.factory.hideMeta();	
		},
		
		hideInstructions: function() {
			this.factory.hideInstructions();
		},
		
		initJcrop: function(callback) {
			var t = this;
			
			t.factory.ui.toolbar.show();
			
			if(t.initialized) {
				t.destroyJcrop();
			}
			
            t.settings.onChange = function() {
            	t.hideInstructions();
	          	t.updateInfo();
            };
            
            t.settings.onRelease = function() {
	            this.released = true;
            	
            };
            
            t.settings.onSelect = function() {
	            this.released = false;
            }
            
			if(t.settings.setSelect) {
				var size = 0;
				
				for(x in t.settings.setSelect) {
					size += t.settings.setSelect[x];
				}
				
				if(size == 0) {
					delete t.settings.setSelect;
				}
			}
			
			t.ui.cropPhoto.Jcrop(t.settings, function() {
				t.jcrop = this;
	            if(typeof callback == "function") {
		            callback(this);
	            }
	        });
        
			t.initialized = true;
		},
		
		destroyJcrop: function() {
			if(this.jcrop) {
				this.jcrop.destroy();
			};
			
			this.jcrop 	     = false;
			this.initialized = false;
		},
			
		hideProgress: function() {
			this.factory.hideProgress();
		},
		
		showProgress: function() {
			this.factory.showProgress();
		},
		
		clearNotices: function(callback) {
			this.factory.clearNotices(callback);
		}, 
		
		tellScaled: function() {
			if(this.jcrop) {
				return this.jcrop.tellScaled();
			}
			return [0,0,0,0];
		},
		
		/*
		setScale: function(scale) {
			if(scale) {
				t.scale = scale;
			}	
				
			if(t.scale != 1) {
		        var img = t.ui.cropPhoto.find('img');
		        var w = parseInt(img.css('width').replace('px', ''));
		        var h = parseInt(img.css('height').replace('px', ''));
		        
		        w = w * t.scale;
		        h = h * t.scale;
		        	            
		        img.css({
		           width: w,
		           height: h 
		        });
		        
		        $(window).resize();
	        }
		},
		*/
		
		updateInfo: function() {
			var t = this;
			
			if(t.factory.ui.info) {		
				var crop = t.cropDimensions();		
				var aspect = crop.a;
				
				t.factory.ui.info.fadeIn();
				t.factory.ui.info.find('.size .width').html(Math.ceil(crop.w)+'px');
				t.factory.ui.info.find('.size .height').html(Math.ceil(crop.h)+'px');
				t.factory.ui.info.find('.aspect').html('('+aspect[0]+':'+aspect[1]+')');
				t.factory.ui.info.find('.x').html(Math.ceil(crop.x)+'px');
				t.factory.ui.info.find('.x2').html(Math.ceil(crop.x2)+'px');
				t.factory.ui.info.find('.y').html(Math.ceil(crop.y)+'px');
				t.factory.ui.info.find('.y2').html(Math.ceil(crop.y2)+'px');
				
				var errors = t.validate(true);
				
				t.factory.ui.info.find('.width').removeClass(t.factory.classes.invalid);
				t.factory.ui.info.find('.height').removeClass(t.factory.classes.invalid);
				t.factory.ui.info.find('.aspect').removeClass(t.factory.classes.invalid);
				
				if(!errors.validWidth) {
					t.factory.ui.info.find('.width').addClass(t.factory.classes.invalid);
				}
				
				if(!errors.validHeight) {
					t.factory.ui.info.find('.height').addClass(t.factory.classes.invalid);
				}
				
				if(!errors.validRatio) {
					t.factory.ui.info.find('.aspect').addClass(t.factory.classes.invalid);
				}
			}	
			
            if(t.factory.ui.instructions && t.factory.ui.instructions.css('display') != 'none') {	            
	            if(t.factory.initialized) {
	            	t.factory.ui.instructions.fadeOut();
	            }            
            }
            
		},
		
		load: function(file, callback) {
			if(typeof file == "function") {
				callback = file;
				file = this.url;
			}
			window.loadImage(file, function(img) {
				if(typeof callback == "function") {
					callback(img);
				}
			});	
		},
		
		startCrop: function(callback) {
			var t = this;
			
			t.factory.cropPhoto = t;
			t.factory.ui.dimmer.fadeIn('fast');
			
			if(!t.initialized) {
				t.factory.ui.cropPhoto.remove();
			}
			
			t.factory.resetMeta();
			
			t.load(t.originalUrl, function(img) {
			
				t.factory.hideProgress();
				
				t.ui.cropPhoto = $('<div class="'+t.factory.classes.cropPhoto+'"></div>');
				t.factory.ui.cropPhoto = t.ui.cropPhoto;
	        	t.ui.instructions = $('<div class="" />').html(PhotoFrame.Lang.instructions);	
	        	
	        	if(t.factory.instructions && t.edit === false) {
	        		t.factory.ui.instructions = $('<div class="'+t.factory.classes.instructions+'" />').html(t.factory.instructions);
	        		t.factory.ui.dimmer.append(t.factory.ui.instructions);
	        	}
	        	else {
	        		if(t.factory.ui.instructions) {
		        		t.factory.ui.instructions.hide();
		        	}
	        	}
	        	
	            t.ui.cropPhoto.html(img);	            
		        t.factory.ui.crop.prepend(t.ui.cropPhoto);         	
	            t.factory.ui.crop.center();
	            t.factory.ui.crop.show();
	        	 
	        	t.updateInfo();  	
	            t.hideMeta();
	            
	            if(t.edit === false && t.size !== false) {
	            	var size = t.size.split('x');
	            	
	            	size[0] = parseInt(size[0]);
	            	size[1] = parseInt(size[1]);
	            	
	           		var x  = (t.ui.cropPhoto.width()  / 2) - (size[0] / 2);
	           		var x2 = x + size[0];
	           		var y  = (t.ui.cropPhoto.height() / 2) - (size[1] / 2);
	           		var y2 = y + size[1];
	           		
	           		t.settings.setSelect = [x, y, x2, y2];
	            }
	            
            	if(t.title) {
	        		t.factory.ui.metaTitle.val(t.title);
	        	}
		        	
	        	if(t.keywords) {
	        		t.factory.ui.metaKeywords.val(t.keywords);
	        	}
	        	
	        	if(t.description) {
	        		t.factory.ui.metaDescription.val(t.description);
	        	}
	        	
	            t.initJcrop(callback);
	            
	            $(window).resize();	
			});
			
			t.factory.ui.save.unbind('click').bind('click', function(e) {
				
				if(t.factory.showMetaOnSave && t.factory.ui.meta.css('display') == 'none') {
	    			var errors = t.validate();
	    		
	    			if(errors.length == 0) {
			    		t.showMeta();
			    	}
			    	else {
				    	t.factory.notify(errors);
			    	}
		    	}
		    	else {
		    		t.hideMeta();		    		
			    	t.saveCrop();
		    	}
			});
			
			t.factory.ui.cancel.unbind('click').bind('click', function(e) {
				t.clearNotices();				
				t.hideMeta();
				t.hideProgress();
				
				t.factory.hideDimmer();
				t.factory.resetProgress();
				
				if(t.factory.cropPhoto) {
					t.factory.cropPhoto.destroyJcrop();	
				}	
				
				if(t.ui.saving) {
					t.ui.saving.fadeOut(function() {
						$(this).remove();
					});
				}
				
				e.preventDefault();
			});
		},
		
		save: function(saveData) {
			var t 	 = this;			
			var date = new Date();
			var edit = t.edit;
			
			
			if(!edit) {			
				t._createPhoto(saveData);
			}
			else {				
				t._updatePhoto(saveData);	
			}
				
			t.load(function(img) {
				if(t.factory.maxPhotos > 0 && (t.factory.maxPhotos <= t.factory.getTotalPhotos())) {
					t.factory.hideUpload();
				}	
				
				if(!edit) {					    
					t.factory.ui.preview.find('ul').append(t.ui.parent);
				}
	       		
	       		t.ui.photo.find('img').remove();
	       		t.ui.photo.append(img);
	       		
				if(t.ui.saving) {			
					t.ui.saving.remove();
				}
				
				t.hideProgress();
				t.hideDimmer();
			});
		},
		
		hideDimmer: function() {
			this.factory.hideDimmer();
		},
		
		_createPhoto: function(saveData) {	
			var t    = this;	
			var html = $([
			    '<li>',
    				'<div class="'+t.factory.classes.photo+'" id="'+t.factory.classes.photo+'-'+t.factory.fieldId+'-'+t.index+'">',			
    					'<div class="'+t.factory.classes.actionBar+'">',
    						'<a href="#'+t.index+'" class="'+t.factory.classes.editPhoto+'"><span class="'+t.factory.icons.editPhoto+'"></span></a>',
    						'<a href="#'+t.index+'" class="'+t.factory.classes.deletePhoto+'"><span class="'+t.factory.icons.deletePhoto+'"></span></a>',
    					'</div>',
    				'</div>',
				'</li>'
			].join(''));
			
			t.edit 		   = t;	
			t.ui.parent    = $(html);
			t.ui.photo 	   = t.ui.parent.find('.'+t.factory.classes.photo);
			t.ui.actionBar = t.ui.parent.find('.'+t.factory.classes.actionBar);
			t.ui.edit	   = t.ui.actionBar.find('.'+t.factory.classes.editPhoto);
			t.ui.del	   = t.ui.actionBar.find('.'+t.factory.classes.deletePhoto);
			t.ui.field     = t._generateNewDataField(saveData);
			
			t.ui.photo.append(t.ui.field);	
			
			t._bindClickEvents();
		},
		
		_generateNewDataField: function(saveData) {
			return $('<textarea name="'+this.factory.fieldName+'[][new]" id="'+this.factory.classes.editPhoto+'-'+this.factory.fieldId+'-'+this.index+'" style="display:none">'+saveData+'</textarea>');
		},
		
		_updatePhoto: function(saveData) {
			this.ui.field.val(saveData).html(saveData);
		},
		
		saveCrop: function() {
			var t    = this;
			
			var errors = t.validate();
			  
			if(errors.length > 0) {
				t.factory.notify(errors);
			}
			else {
				t.clearNotices();
				
				t.ui.saving = $('<div class="'+t.factory.classes.saving+'"><span></span> Saving...</div>');
				
				t.factory.ui.dimmer.append(t.ui.saving);			
				t.factory.ui.dimmer.find('.'+t.factory.classes.saving+' span').activity();			
				t.factory.ui.crop.fadeOut();
				
				if(t.ui.info) {
					t.ui.info.fadeOut();
				}
				
				t.hideMeta();
				t.ui.saving.center();
				
				t.title       = t.factory.ui.metaTitle.val();
				t.description = t.factory.ui.metaDescription.val();
				t.keywords    = t.factory.ui.metaKeywords.val();
				
				t._sendCropRequest(function(cropResponse) {
					t.factory.cropPhoto = false;
					t.destroyJcrop();		
					t.save(cropResponse.save_data);	
				});
			}
		},
		
		_sendCropRequest: function(response, callback) {
			if(typeof response == "function") {
				callback = response;
				response = false;
			}
			if(!url) {
				var url = this.factory.cropUrl;
			}
			if(!response) {
				var response = this.response;
			}
			
			var t = this;
					
			var _defaultSize = {
    			 x: 0,
    			 y: 0,
    			x2: 0,
    			y2: 0,
    			 w: 0,
    			 h: 0
    		};
    		
    		var size = t.released ? _defaultSize : t.tellScaled();
    		
    		if(!size.w || !size.h) {
    			size = _defaultSize;
	    		delete t.settings.setSelect;
    		}
    		else {
    			t.settings.setSelect = [size.x, size.y, size.x2, size.y2];
    		}
    		
			$.get(t.factory.cropUrl, {
				id: t.factory.directory.id,
				photo_id: t.id,
				image: response.file_path,
				name: response.file_name,
				directory: t.factory.directory.server_path,
				original: response.original_path,
				original_file: response.original_file,
				url: response.file_url,
				edit: t.edit !== false ? true : false,
				height: size.h,
				width: size.w,
				scale: t.scale,
				rotate: t.rotate,
				resize: t.resize,
				resizeMax: t.resizeMax,
				x: size.x,
				x2: size.x2,
				y: size.y,
				y2: size.y2,
				title: t.title,
				description: t.description,
				keywords: t.keywords,
				compression: t.compression,
			}, function(cropResponse) {
				if(typeof callback == "function") {
					callback(cropResponse);					
				}
			});
		},
		
		isCropped: function(cropSize) {
			
			if(!cropSize) {
				var cropSize = this.cropDimensions();
			}
			
			if(!cropSize && this.jcrop.tellSelect) {
				var cropSize = this.jcrop.tellScalled();
			}
			
			if(this.factory.ui.dimmer.find('.jcrop-tracker').width() == 0) {
				return false;
			}
			
			return typeof cropSize == "undefined" || cropSize.x || cropSize.y || cropSize.x2 || cropSize.y2 ? true : false;	
		},
		
		reduce: function(numerator, denominator) {
			var gcd = function gcd (a, b) {
	            return (b == 0) ? a : gcd (b, a%b);
	        }
			
			gcd = gcd(numerator,denominator);
			
			return [numerator/gcd, denominator/gcd];
		},
		
		cropDimensions: function(cropSize) {
			var defaultCropSize = {
				w: 0,
				h: 0,
				x: 0,
				x2: 0,
				y: 0,
				y2: 0
			}
				
			if(!cropSize && this.jcrop.tellSelect) {
				var cropSize = this.jcrop.tellSelect();
			}
			else {
				var cropSize = defaultCropSize;
			}
			
			var image = {
				w: this.ui.cropPhoto.find('img').width(),
				h: this.ui.cropPhoto.find('img').height()
			};
			
			cropSize.w = cropSize.w == 0 ? image.w : cropSize.w;
			cropSize.h = cropSize.h == 0 ? image.h : cropSize.h;
			
			if(!this.settings.aspectRatio) {
				var aspect = this.reduce(Math.ceil(cropSize.w), Math.ceil(cropSize.h));
			}
			else {
				var aspect = this.settings.aspectRatioString.split(':');
				
				if(typeof aspect[0] == "undefined") {
					aspect[0] = 0;
				}	
				
				if(typeof aspect[1] == "undefined") {
					aspect[1] = 0;
				}	
				
				if(!this.isCropped(cropSize)) {
					aspect = [cropSize.w, cropSize.h];	
				}
				
				aspect = this.reduce(aspect[0], aspect[1]);
			}
			
			if(!this.isCropped(cropSize)) {
				cropSize   = defaultCropSize;
				cropSize.w = image.w;
				cropSize.h = image.h;
				
				aspect = this.reduce(image.w, image.h);
			};
			
			cropSize.a = aspect;		
			
			return cropSize;
		},
		
		round: function(number, place) {
			if(!place) {
				var place = 100;
			}
			return Math.round(number * place) / place;
		},
		
		aspectRatio: function(d) {
		    var df = 1, top = 1, bot = 1;
		    var limit = 1e5; //Increase the limit to get more precision.
		 
		    while (df != d && limit-- > 0) {
		        if (df < d) {
		            top += 1;
		        }
		        else {
		            bot += 1;
		            top = parseInt(d * bot, 10);
		        }
		        df = top / bot;
		    }
		  
		    return top + '/' + bot;
		},
		
		validate: function(json) {
			var t = this;
			
			if(!json) {
				var json = false;	
			}
			
			var ratio       = t.settings.aspectRatio ? t.settings.aspectRatio : false;
			var cropSize    = t.cropDimensions();
			
			var cropWidth   = cropSize.w;
			var cropHeight  = cropSize.h;
			var minWidth    = t.settings.minSize ? t.settings.minSize[0] : 0;
			var minHeight   = t.settings.minSize ? t.settings.minSize[1] : 0;
			var maxWidth    = t.settings.maxSize ? t.settings.maxSize[0] : 0;
			var maxHeight   = t.settings.maxSize ? t.settings.maxSize[1] : 0;
			var isCropped   = t.isCropped(cropSize);
			
			var height      = cropSize.h;
			var width       = cropSize.w;
			var errors      = [];
			var imgWidth    = Math.ceil(t.ui.cropPhoto.find('img').width());
			var imgHeight   = Math.ceil(t.ui.cropPhoto.find('img').height());
			
			var response    = {
				validWidth: true,
				validHeight: true,
				validRatio: true,
				minWidth: minWidth,
				minHeight: minHeight,
				maxWidth: maxWidth,
				maxHeight: maxHeight,
				width: cropSize.w,
				height: cropSize.h,
				x: cropSize.x,
				x2: cropSize.x2,
				y: cropSize.y,
				y2: cropSize.y2,
				ratio: ratio,
				ratioString: t.settings.aspectRatioString
			};
			
			if(minWidth > 0 && minWidth > width) {
				response.validWidth = false;
				errors.push('The image must have a minimum width of '+minWidth+'px');
			}
			
			if(minHeight > 0 && minHeight > height) {
				response.validHeight = false;
				errors.push('The image must have a minimum height of '+minHeight+'px');
			}
			
			if(maxWidth > 0 && maxWidth < width) {
				response.validWidth = false;
				errors.push('The image must have a maximum width of '+maxWidth+'px');
			}
			
			if(maxHeight > 0 && maxHeight < height) {
				response.validHeight = false;
				errors.push('The image must have a maximum height of '+maxHeight+'px');
			}
			
			if(!isCropped && ratio) {
				if(t.round(ratio, 100) != t.round(cropWidth / cropHeight, 100)) {
					response.validRatio = false;
					errors.push('The image must have an apect ratio of '+t.settings.aspectRatioString);
				}
			}
			
			response.errors = errors;
				
			if(json) {
				return response;
			}
			
			return errors;
		}	
	});
	
	PhotoFrame.ProgressBar = PhotoFrame.Class.extend({
		
		/**
		 * The wrapping DOM object.
		 */		
		 
		$wrapper: false,
				
		/**
		 * An object of UI elements.
		 */		
		 
		ui: {},
				
		/**
		 * The progress percentage.
		 */		
		 
		progress: 0,				
		
		/**
		 * Constructor to set the options and UI events.
		 *
		 * @param object  The wrapper object
		 * @param object  An array of options to be set
		 */	
		 
		constructor: function(obj, progress, options) {	
			var t = this;
					
			t.$wrapper = $(obj);
						
			if(typeof progress == "object") {
				options  = progress;
				progress = 0;
			}
			
			if(typeof progress == "undefined") {
				var progress = 0;
			}
			
			if(typeof options == "undefined") {
				var options = {};
			}

			var _default = {
				callbacks: {
					init: function() {},
					cancel: function() {},
					onProgress: function() {},	
					hide: function() {},	
					show: function() {},	
					reset: function() {},	
				},
				duration: 333,
				classes: {
					progress: 'photo-frame-progress-fill',
					cancel: 'photo-frame-progress-cancel',
					wrapper: 'photo-frame-progress-wrapper'
				}	
			};
			
			t.ui = {
				obj: t.$wrapper,
				parent: t.$wrapper.parent(),
				fill: t.$wrapper.find	
			};
			
			t.base(_default, options);
			
			if(!t.ui.obj.data('init')) {
				t.ui.fill    = $('<div class="'+t.classes.progress+'" />');
				t.ui.cancel  = $('<a href="#" class="'+t.classes.cancel+'"><span class="icon-cancel"></span></a>');
				
				t.ui.obj.wrap('<div class="'+t.classes.wrapper+' '+t.classes.icons+'" />');
				t.ui.cancel.insertBefore(t.ui.obj);
				t.ui.obj.append(t.ui.fill);
				t.ui.obj.data('init', 'true');
				
				t.ui.wrapper = t.ui.obj.parent('.'+t.classes.wrapper);
				
				t.ui.cancel.click(function(e) {	
					
					t.callbacks.cancel(t, e);
					
					t.hide(function() {
						t.reset(0);
					});
					
					e.preventDefault();
				});
				
				t.callbacks.init(t);
					
				t.set(t.progress);
			}
			
			$(window).resize(function() {
				t.center();				
			});
		},
		
		/**
		 * Reset the progress bar back to zero
		 */	
		 
		reset: function(callback) {
			var t = this;
			
			t.set(0, function() {				
				t.callbacks.reset(t);
				
				if(typeof callback == "function") {
					callback();
				}
			});
		}, 
		
		/**
		 * Set the progress bar to a defined value.
		 *
		 * @param object    The progress value
		 * @param callback  A function to be used for a callback
		 */	
		 
		set: function(value, callback) {
			var t      = this;
			var outer  = t.ui.obj.outerWidth();
			var width  = outer && !isNaN(outer) && outer > 0 ? outer : t.ui.obj.width();

			t.progress = parseInt(value) > 100 ? 100 : parseInt(value);
			t.progress = parseInt(width * (value / 100));
			
			t.ui.fill.css('width', t.progress);
			
			t.callbacks.onProgress(t, t.progress);
			
			setTimeout(function() {
				if(typeof callback == "function") {
					callback(t);
				}
			}, t.duration);
		},
		
		/**
		 * Get the progress bar value.
		 *
		 * @return int The amount of progress in the bar
		 */	
		 
		get: function() {
			return this.progress;
		},
		
		/**
		 * Center the progress bar within the parent.
		 */	
		 
		center: function() {		
			this.ui.wrapper.position({
				of: this.ui.parent,
				my: 'center',
				at: 'center'
			});	
		},
		
		/**
		 * Show the progress bar.
		 *
		 * @param mixed  The animation duration.
		 * @param mixed  The callback function.
		 */	
		 
		show: function(duration, callback) {
			var t = this;
			
			if(typeof duration == "function") {
				callback = duration;
				duration = undefined;
			}
			
			if(typeof duration == "undefined") {
				var duration = t.duration;
			}
			
			t.ui.wrapper.fadeIn(duration, function() {
				t.callbacks.show(t);
			
				if(typeof callback == "function") {
					callback(t);
				}				
			});
			
			t.center();
		},
		
		/**
		 * Hide the progress bar.
		 *
		 * @param mixed  The animation duration.
		 * @param mixed  The callback function.
		 */	
		 
		hide: function(duration, callback) {
			var t = this;
			
			if(typeof duration == "function") {
				callback = duration;
				duration = undefined;
			}
			
			if(typeof duration == "undefined") {
				var duration = t.duration;
			}
			
			t.ui.wrapper.fadeOut(duration, function() {	
				t.callbacks.hide(t);
				
				if(typeof callback == "function") {
					callback(t);
				}				
			});
		}
	});
	
	PhotoFrame.instances = [];
	PhotoFrame.matrix = [];
	
}(jQuery));

/**
 * Get the current jQuery version and test is similar to version_compare();
 *
 * @param	string 	First version to compare
 * @param	string 	Comparison operator
 * @param	string 	Second version to compare (optional)
 *
 * @return	mixed;
 */

jQuery.isVersion = function(left, oper, right) {
    if (left) {
        var pre = /pre/i,
            replace = /[^\d]+/g,
            oper = oper || "==",
            right = right || jQuery.fn.jquery,
            l = left.replace(replace, ''),
            r = right.replace(replace, ''),
            l_len = l.length, r_len = r.length,
            l_pre = pre.test(left), r_pre = pre.test(right);

        l = (r_len > l_len ? parseInt(l) * ((r_len - l_len) * 10) : parseInt(l));
        r = (l_len > r_len ? parseInt(r) * ((l_len - r_len) * 10) : parseInt(r));

        switch(oper) {
            case "==": {
                return (true === (l == r && (l_pre == r_pre)));
            }
            case ">=": {
                return (true === (l >= r && (!l_pre || l_pre == r_pre)));
            }
            case "<=": {
                return (true === (l <= r && (!r_pre || r_pre == l_pre)));
            }
            case ">": {
                return (true === (l > r || (l == r && r_pre)));
            }
            case "<": {
                return (true === (l < r || (l == r && l_pre)));
            }
        }
    }

    return false;
}

/**
 * Center a specific element on the screen. Works with various versions of jQuery
 *
 * @return object;
 */

jQuery.fn.center = function () {
    var w = $(window);
    this.css("position","fixed");
    
    if($.isVersion('1.7.0', '<=') && w.outerHeight() != null && w.outerWidth() != null && 
       !isNaN(w.outerHeight()) && !isNaN(w.outerWidth())) {
	    var outerHeight = w.outerHeight();
	    var outerWidth  = w.outerWidth();
    } else {
    	var outerHeight = w.height();
	    var outerWidth  = w.width();
    }
    
    this.css("top",outerHeight/2-this.height()/2 + "px");
    this.css("left",outerWidth/2-this.width()/2  + "px");
    
    return this;
}