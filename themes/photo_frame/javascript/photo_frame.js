var PhotoFrame = function() {};

(function($) {
	
	PhotoFrame.Class = Base.extend({
		
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
			editPhoto: 'photo-frame-edit',
			deletePhoto: 'photo-frame-delete',
			photo: 'photo-frame-photo',
			cropPhoto: 'photo-frame-crop-photo',
			jcropTracker: 'jcrop-tracker',
			jcropHolder: 'jcrop-holder'
		},	
		
		/**
		 * The object of the photo being cropped
		 */		
		 
		cropPhoto: false,
				 
		/**
		 * Icon Classes
		 */		
		 
		icons: {
			editPhoto: 'icon-edit',
			deletePhoto: 'icon-trash',
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
			
			// Use this property to access "this" within jQuery events
			var t = this;
				
			t.base(options);			
			t.$wrapper = $(obj);
			
			t.ui = {
				body: $('body'),
				browse: t.$wrapper.find('.photo-frame-browse'),
				upload: t.$wrapper.find('.photo-frame-upload'),
				form: $('#photo-frame-upload'),
				dimmer: $('.photo-frame-dimmer'),
				activity: $('.photo-frame-activity'),
				preview: t.$wrapper.find('.photo-frame-preview'),
				//del: t.$wrapper.find('.photo-frame-delete'),
				//edit: t.$wrapper.find('.photo-frame-edit'),
				helper: t.$wrapper.find('.photo-frame-helper')
			}
			
			for(x in t.photos) {
				var data  = t.photos[x];
				var photo = t.$wrapper.find('.'+t.classes.photo);
			}
			
			var html = [
				'<form id="photo-frame-upload" class="photo-frame-form photo-frame-wrapper" action="'+t.url+(t.IE() ? '&ie=true' : '')+'" method="POST" enctype="multipart/form-data" id="photo-frame-upload-'+t.index+'" '+(t.IE() ? 'target="photo-frame-iframe-'+t.index+'"' : '')+'>',
					'<h3>Select a file to upload...</h3>',
					'<input type="file" name="files[]" multiple>',
					'<button type="submit" class="photo-frame-button"><span class="icon-upload"></span>'+t.buttonText+'</button>',
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
				'<div class="photo-frame-dimmer">',
					'<a href="#" class="photo-frame-meta-toggle"><span class="icon-info"></span></a>',
					'<div class="photo-frame-info-panel">',
						'<a href="#" class="photo-frame-close"><span class="icon-cancel"></span></a>',
						'<p class="size">W: <span class="width"></span> H: <span class="height"></span></p>',
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
						'<p class="aspect"></p>',
					'</div>',
					'<div class="photo-frame-activity">',
						'<span class="photo-frame-indicator"></span> <p>Uploading...</p>',
						'<a class="photo-frame-button photo-frame-cancel"><span class="icon-cancel"></span> Cancel</a>',
					'</div>',
					'<div class="photo-frame-progress"></div>',
					'<div class="photo-frame-errors">',
						'<h3>Errors</h3>',
						'<ul></ul>',
						'<a class="photo-frame-button photo-frame-cancel"><span class="icon-cancel"></span> Close</a>',
					'</div>',
					'<div class="photo-frame-crop">',
						'<div class="'+t.classes.cropPhoto+'"></div>',
						'<div class="photo-frame-meta">',
							'<a href="#" class="photo-frame-close-meta photo-frame-float-right"><span class="icon-cancel"></span></a>',
							'<h3>Photo Details</h3>',
							'<ul>',
								'<li>',
									'<label for="title">Title</label>',
									'<input type="text" name="title" value="'+t.title+'" id="title" />',
								'</li>',
								'<!-- <li>',
									'<label for="keywords">Keywords</label>',
									'<input type="text" name="keywords" value="'+t.keywords+'" id="keywords" />',
								'</li> -->',
								'<li>',
									'<label for="title">Description</label>',
									'<textarea name="description" id="description">'+t.description+'</textarea>',
								'</li>',
							'</ul>',
						'</div>',
						'<div class="photo-frame-toolbar">',
							'<a class="photo-frame-bar-button photo-frame-cancel photo-frame-float-left"><span class="icon-cancel"></span> Cancel</a>',
							'<a class="photo-frame-bar-button photo-frame-save photo-frame-float-right"><span class="icon-save"></span> Save</a>',
						'</div>',
					'</div>',
				'</div>'
			].join('');
			
			t.ui.dimmer  = $(html);
			t.ui.toolbar = t.ui.dimmer.find('.photo-frame-toolbar');
			t.ui.toolbar.hide();
			
			t.ui.body.append(t.ui.dimmer);
		
			if(t.infoPanel) {
				t.ui.info = t.ui.dimmer.find('.photo-frame-info-panel');
				t.ui.info.draggable();
				t.ui.info.find('.photo-frame-close').click(function(e) {			
					t.ui.info.fadeOut();
					e.preventDefault();
				});
			}
					
			t.ui.activity = t.ui.dimmer.find('.photo-frame-activity');
			t.ui.activity.find('.photo-frame-indicator').activity({color: '#fff'});
			
			t.ui.progress   = t.ui.dimmer.find('.photo-frame-progress');
			t.ui.save       = t.ui.dimmer.find('.photo-frame-save');
			t.ui.cancel     = t.ui.dimmer.find('.photo-frame-cancel');
			t.ui.errors     = t.ui.dimmer.find('.photo-frame-errors');
			t.ui.crop       = t.ui.dimmer.find('.photo-frame-crop');
			t.ui.cropPhoto  = t.ui.dimmer.find('.'+t.classes.cropPhoto);
			t.ui.meta       = t.ui.dimmer.find('.photo-frame-meta');
			t.ui.metaToggle = t.ui.dimmer.find('.photo-frame-meta-toggle');
			t.ui.metaClose  = t.ui.dimmer.find('.photo-frame-close-meta');
			t.ui.dropZone   = t.$wrapper.find('.photo-frame-drop-zone');
			
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

			if(!t.IE()) {
				
				console.log(t.ui.form);
				
				t.ui.form.fileupload({
					//url: '/live/home/index',
					started: function() {
						console.log('started');
						//t.ui.dropZone.hide();
						//t.showProgress(0);
					},
					progress: function(e, data) {
						t.showProgress(parseInt(data.loaded / data.total * 100));
					},
					singleFileUploads: false,
					dropZone: t.ui.dropZone,
					url: t.url,
					add: function (e, data) {
						t.initialized = false;	
						
						t.startUpload(data.files, function() {
							t.showProgress(0);
							t.jqXHR = data.submit();
						});
					},
					fail: function (e, data) {
						console.log('fail');
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
							
							if(typeof data.result[0].success != "undefined") {
								$.each(data.result, function(i, response) {
									//t.saveResponse(response);
								});
							}
							else {
								t.hideProgress();
								console.log(errors);
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
			
			t.ui.browse.click(function(e) {
				console.log('browse');
				
				e.preventDefault();
			});
		},
		
		clearNotices: function(callback) {
			for(x in this.notices) {
				this.notices[x].clear(callback);
			}			
		},
		
		getTotalPhotos: function() {
			return t.photos.length;	
		},
		
		_uploadResponseHandler: function(response, existingAsset) {
			this.response = response;			
			this.ui.toolbar.hide();
			
			if(this.response.success) {
				if(!existingAsset) {
					this.$wrapper.append('<textarea name="'+this.fieldName+'[][uploaded]" style="display:none">{"field_id": "'+this.fieldId+'", "col_id": "'+this.colId+'", "row_id": "'+this.rowId+'", "path": "'+this.response.file_path+'", "original_path": "'+this.response.original_path+'", "file": "'+this.response.file_name+'"}</textarea>');
				}
				
				var photo = new PhotoFrame.Photo(this, response, {
					settings: this.settings,
					compression: this.compression,
					resize: this.resize,
					resizeMax: this.resizeMax,
					index: this.photos.length
				});
				
				photo.startCrop();
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
			return this.$wrapper.children().hasClass('photo-frame-ie');
		},
						
		save: function() { console.log('save'); },
		
		showMeta: function() {
			this.ui.metaToggle.addClass('active');	
			this.ui.meta.fadeIn('fast');
			this.ui.meta.center();
		},
		
		hideMeta: function() {	
			this.ui.metaToggle.removeClass('active');	
			this.ui.meta.fadeOut('fast');
		},
		
		showUpload: function() {
			this.ui.upload.show();
			this.ui.browse.show();
			this.ui.helper.show();	
		},
		
		hideUpload: function() {
			this.ui.upload.hide();
			this.ui.browse.hide();
			this.ui.helper.hide();	
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
			this.progressBar.show();
			this.progressBar.set(progress, callback);
		},
		
		/**
		 * Show the progress bar.
		 */		
		hideProgress: function(callback) {
			this.progressBar.hide(callback);
		},
		
		/**
		 * Resets the progress bar.
		 */		
		 
		resetProgress: function() {
			this.ui.crop.hide();
			this.ui.activity.hide();			
			this.progressBar.show();
			this.progressBar.reset();
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
		 
		description: false,
		 
		/**
		 * Is this photo being edit? If false, then a new photo
		 */	
		 
		edit: false,
		 
		/**
		 * The Photo Frame Factory object
		 */	
		
		factory: false,
		
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
		 
		keywords: false,
		
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
		 
		title: false,
		 		
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
			
			t.factory     = factory;
			t.response    = response;
			t.originalUrl = response.original_url;
			t.url         = response.file_url;
			t.ui          = $.extend(true, factory.ui, t.ui);
			
			t._bindClickEvents();
			t.base(options);
			
			if(!t.index) {
				t.index = t.photos.length;
			}
			
			factory.photos.push(t);
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
					
					var $t = $(this);
					var id = $t.attr('href').replace('#', '');
						
					$t.parents('.photo-frame-photo').parent('li').remove();
						
					if(t.id === false) {
						t.factory.$wrapper.append('<input type="hidden" name="photo_frame_delete_photos['+t.factory.fieldId+'][]" value="'+t.id+'" />');
					}
					
					t.ui.parent.fadeOut(function() {
						t.ui.parent.remove();
						
						if((t.factory.maxPhotos > 0 && t.factory.maxPhotos > t.getTotalPhotos()) || (t.factory.minPhotos == 0 && t.factory.maxPhotos == 0)) {
							t.showUpload();
						}
						else {
							t.hideUpload();
						}									
					});
				
					e.preventDefault();
				});
			}
		},
		
		showMeta: function() {
			this.factory.showMeta();	
		},
		
		hideMeta: function() {
			this.factory.hideMeta();	
		},
		
		showUpload: function() {
			this.factory.showUpload();	
		},
		
		hideUpload: function() {
			this.factory.showUpload();	
		},
		
		toggleMeta: function(image) {
			if(this.ui.meta.css('display') == 'none') {
				this.showMeta();
				/*
				if(image) {
					this.hideImage();
				}
				*/
			}
			else {
				this.hideMeta();
				
				/*
				if(image) {
					this.showImage();
				}
				*/
			}
		},
		
		initJcrop: function(callback) {
			var t = this;
			
			t.ui.toolbar.show();
			
				console.log(t.jcrop);
				
			if(!t.jcrop) {
				console.log('init jcrop');
				
				t.ui.cropPhoto.Jcrop(t.settings, function() {
		        	t.jcrop = this;
		        	t.updateInfo();
		            if(typeof callback == "function") {
			            callback();
		            }
		        });
	        }
	        else {		
				console.log('skip init jcrop');
				        
	            if(typeof callback == "function") {
		            callback();
	            }
	        }
	        
			t.initialized = true;				
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
			console.log('updateInfo()');	
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
			t.ui.dimmer.fadeIn('fast');
			
			t.load(t.originalUrl, function(img) {
	        	
				if(!t.ui.cropPhoto) {
	        		t.ui.cropPhoto = $('<div class="'+t.factory.classes.cropPhoto+'"></div>');
				}
				
	        	t.ui.instructions = $('<div class="photo-frame-instructions" />').html(PhotoFrame.Lang.instructions);	
	        	
	            t.ui.cropPhoto.html(img);	            
		        t.ui.crop.prepend(t.ui.cropPhoto);         	
	            t.ui.crop.center();
	            t.ui.crop.show();
	        		      	
	            t.hideMeta();
	            
	            t.settings.onChange = function() {
		          	t.updateInfo();
	            };
	            
	            t.settings.onRelease = function() {
		            t.released = true;
	            };
	            
	            t.settings.onSelect = function() {
		            t.released = false;
	            }
	            
	            if(t.ui.instructions && t.ui.instructions.css('display') != 'none') {
		            t.settings.onChange = function() {
		          		t.updateInfo();
			            if(t.initialized) {
			            	t.ui.instructions.fadeOut();
			            }
		            }
	            }
	            
	            if(t.edit === false && t.size) {
	            	var size = t.size.split('x');
	            	
	            	size[0] = parseInt(size[0]);
	            	size[1] = parseInt(size[1]);
	            	
	           		var x  = (t.ui.cropPhoto.width()  / 2) - (size[0] / 2);
	           		var x2 = x + size[0];
	           		var y  = (t.ui.cropPhoto.height() / 2) - (size[1] / 2);
	           		var y2 = y + size[1];
	           		
	           		t.settings.setSelect = [x, y, x2, y2];
	            }
	            
            	if(t.edit) {
	            	if(t.title) {
		        		t.ui.meta.find('input[name="title"]').val(t.title);
		        	}
		        	
		        	if(t.keywords) {
		        		t.ui.meta.find('input[name="keywords"]').val(t.keywords);
		        	}
		        	
		        	if(t.description) {
		        		t.ui.meta.find('textarea').val(t.description);
		        	}
	        	}
            	
	            t.initJcrop(callback);	
			});
			
			t.ui.save.unbind('click').bind('click', function(e) {
				if(this.showMeta && this.ui.meta.css('display') == 'none') {
	    			var errors = t.validate();
	    		
	    			if(errors.length == 0) {
			    		t.showMeta();
			    	}
			    	else {
				    	t.notify(errors);
			    	}
		    	}
		    	else {
		    		t.hideMeta();		    		
			    	t.saveCrop();
		    	}
			});
			
			t.ui.cancel.unbind('click').bind('click', function(e) {
				t.clearNotices();			
				t.ui.dimmer.fadeOut('fast');	
				t.hideMeta();
				t.hideProgress();
				
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
			
			console.log(edit);
			
			if(!edit) {			
				t._createPhoto(saveData);
			}
			else {				
				t._updatePhoto(saveData);	
			}
				
			t.load(function(img) {
				if(t.factory.maxPhotos > 0 && (t.factory.maxPhotos <= t.getTotalPhotos())) {
					t.hideUpload();
				}	
				
				if(!edit) {					    
					t.ui.preview.find('ul').append(t.ui.parent);
				}
	       		t.ui.photo.find('img').remove();
	       		t.ui.photo.append(img);
	       		
				if(t.ui.saving) {			
					t.ui.saving.remove();
				}
				
				t.hideProgress();
				t.ui.dimmer.hide();
			});
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
			t.ui.field     = $('<textarea name="'+t.factory.fieldName+'[][new]" id="'+t.factory.classes.editPhoto+'-'+t.factory.fieldId+'-'+t.index+'" style="display:none">'+saveData+'</textarea>');
			t.ui.photo.append(t.ui.field);	
			
			t._bindClickEvents();
		},
		
		_updatePhoto: function(saveData) {
			this.ui.field.val(saveData).html(saveData);
		},
		
		saveCrop: function() {
			var t = this;
			
			console.log(t.jcrop);
			
    		var size = this.released ? {
    			 x: 0,
    			 y: 0,
    			x2: 0,
    			y2: 0,
    			 w: 0,
    			 h: 0
    		} : t.jcrop.tellScaled();
    		  	
			var errors = t.validate();
			  
			if(errors.length > 0) {
				t.notify(errors);
			}
			else {
				t.clearNotices();
				
				t.ui.saving = $('<div class="photo-frame-saving"><span></span> Saving...</div>');
				t.ui.dimmer.append(t.ui.saving);			
				t.ui.dimmer.find('.photo-frame-saving span').activity();			
				//t.ui.crop.fadeOut();
				
				if(t.ui.info) {
					t.ui.info.fadeOut();
				}
				
				t.hideMeta();
				t.ui.saving.center();
				
				t.title       = t.ui.meta.find('input[name="title"]').val();
				t.description = t.ui.meta.find('textarea').val();
				t.keywords    = t.ui.meta.find('input[name="keywords"]').val();
				
				$.get(t.factory.cropUrl, {
					id: t.factory.directory.id,
					photo_id: t.edit_id,
					image: t.response.file_path,
					name: t.response.file_name,
					directory: t.factory.directory.server_path,
					original: t.response.original_path,
					original_file: t.response.original_file,
					url: t.response.file_url,
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
					t.factory.cropPhoto = false;
					t.save(cropResponse.save_data);
				});
			}
		},
		
		isCropped: function(cropSize) {
			
			if(!cropSize) {
				var cropSize = this.cropDimensions();
			}
			
			if(!cropSize && this.jcrop.tellSelect) {
				var cropSize = this.jcrop.tellSelect();
			}
			
			if(this.ui.dimmer.find('.jcrop-tracker').width() == 0) {
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
				
				if(!t.isCropped(cropSize)) {
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
				
				t.ui.obj.wrap('<div class="'+t.classes.wrapper+'" />');
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