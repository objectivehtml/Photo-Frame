var PhotoFrame = {};

(function($) {
	
	/**
	 * An object of PhotoFrame.Database objects
	 */
	 
	PhotoFrame.Model  = {};	
	
	/**
	 * An array of PhotoFrame.Factory objects
	 */
	 
	PhotoFrame.instances = [];
	
	/**
	 * An array of PhotoFrame.Factory matrix objects
	 */
	 
	PhotoFrame.matrix    = [];
	
	/**
	 * An array of PhotoFrame.Button objects
	 */
	 
	PhotoFrame.Buttons   = [];


	PhotoFrame.Class = Base.extend({
		
		/**
		 * Build Date
		 */
		 
		buildDate: '2013-05-30',
		
		/**
		 * Version
		 */
		 
		version: '0.9.515',
		
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
			this.setOptions($.extend(true, {}, _default, options));
		},
		
		/**
		 * Delegates the callback to the defined method
		 *
		 * @param	object 	The default options
		 * @param	object 	The override options
		 */
		 
		callback: function(method) {
		 	if(typeof method === "function") {
				var args = [];
								
				for(var x = 1; x <= arguments.length; x++) {
					if(arguments[x]) {
						args.push(arguments[x]);
					}
				}
				
				method.apply(this, args);
			}
		},
		 
		/**
		 * Log a string into the console if it exists
		 *
		 * @param 	string 	The name of the option
		 * @return	mixed
		 */		
		 
		log: function(str) {
			if(window.console && console.log) {
				console.log(str);
			}
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
		},
		
		/**
		 * Remove an index from an array
		 *
		 * @param 	array 	The subject array
		 * @param 	int 	The index to remove from the array
		 * @return  array
		 */		
		
		removeIndex: function(array, index) {
			 for(var i=0; i<array.length; i++) {
		        if(array[i] == index) {
		            array.splice(i, 1);
		            break;
		        }
		    }
		    
		    return array;
		},

		/**
		 * Parse string into a JSON object (or array)
		 *
		 * @param 	string 	The string to parse
		 * @return  mixed
		 */		
		
		jsonEncode: function(str) {
			return JSON.parse(str);
		},

		/**
		 * Convert a JSON object (or array) to a string
		 *
		 * @param 	mixed 	The value to decode
		 * @return  string
		 */		
		
		jsonDecode: function(obj) {
			return JSON.stringify(obj);
		}

	});
	
	PhotoFrame.BaseElement = PhotoFrame.Class.extend({

		/**
		 * An object of callback methods
		 */	
		 
		callbacks: {},

		/**
		 * The PhotoFrame.Factory object
		 */	

		factory: false,

		/**
		 * The object's unique identifier (optional)
		 */	

		id: false,

		/**
		 * The parent jQuery object
		 */	

		parent: false,

		/**
		 * An object of UI elements
		 */	
		 
		ui: {},

		constructor: function(factory, parent, options) {
			var t 		  = this;
			var callbacks = (typeof options == "object" ? options.callbacks : {});

		 	this.ui 	   = {};
		 	this.factory   = factory;
			this.parent    = parent;
			this.base(options);
			this.callbacks = $.extend(true, {}, this.callbacks, callbacks);
		}
		
	});

	PhotoFrame.Factory = PhotoFrame.Class.extend({
		
		/**
		 * An array of buttons to use to build the buttonBar
		 */
		 
		buttons: [],
		 
		/**
		 * The PhotoFrame.ButtonBar object
		 */	
		 
		buttonBar: false,
		
		/**
		 * Has user cancelled upload?
		 */	
		 
		cancel: false,
		
		/**
		 * An object of global callback methods
		 */	
		 
		callbacks: {},
		
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
			clearfix: 'clearfix',
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
			ie: 'photo-frame-ie',
			indicator: 'photo-frame-indicator',
			infoToggle: 'photo-frame-toggle-info',
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
			rendering: 'photo-frame-rendering',
			renderBg: 'photo-frame-render-bg',
			renderText: 'photo-frame-render-text',
			save: 'photo-frame-save',
			saving: 'photo-frame-saving',
			size: 'size',
			sortable: 'photo-frame-sortable',
			sortablePlaceholder: 'photo-frame-sortable-placeholder',
			toolbar: 'photo-frame-toolbar',
			//toolBarTools: 'photo-frame-toolbar-tools',
			toolBarToggle: 'photo-frame-toolbar-toggle',
			tools: 'photo-frame-tools',
			upload: 'photo-frame-upload',
			wrapper: 'photo-frame-wrapper'
		},	
		
		/**
		 * Force users to crop new photos?
		 */		
		 
		forceCrop: true,
		 
		/**
		 * Disable users from cropping photos?
		 */		
		 
		disableCrop: false,
		
		/**
		 * An object/array events that have been bound to PhotoFrame
		 */		
		 
		events: {},
		
		/**
		 * Icon Classes
		 */		
		 
		icons: {
			cancel: 'icon-cancel',
			editPhoto: 'icon-edit',
			deletePhoto: 'icon-trash',
			info: 'icon-info',
			cog: 'icon-cog',
			rotate: 'icon-rotate',
			save: 'icon-save',
			tools: 'icon-tools',
			warningSign: 'icon-warning-sign'
		},
		
		/**
		 * The Layer window object
		 */		
		 
		// layerWindow: false,
		
		/**
		 * This is the overflow property of the window when crop is started
		 */
		 
		overflow: false,	
		 	
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
		 * An array of PhotoFrame.Window objects.
		 */		
		 
		windows: [],
		
		/**
		 * The wrapping DOM object
		 */		
		 
		$wrapper: false,
				
		/**
		 * Global zIndex count.
		 */		
		 
		zIndexCount: 1,
		
		/**
		 * Constructor to set the options and UI events.
		 *
		 * @param object  The wrapper object
		 * @param object  An array of options to be set
		 */		
		 
		constructor: function(obj, options) {
			
			var t      = this;
			var photos = $.extend(true, {}, options.photos);
					
			t.events  = {};
			t.windows = [];
			t.photos  = [];
			t.index   = PhotoFrame.instances.length;
			
			// Global default callbacks
			
			t.callbacks = $.extend(true, {
				browse: function() {},
				buildUploadUrl: function() { return false; }, // return false by default
				init: function() {},
				responseHandlerSettings: function() { return {}; }	
			}, options.callbacks);
			
			//options.callbacks = $.extend(true, {}, t.callbacks);
			//options.photos    = $.merge(true, [], photos);
			
			PhotoFrame.instances.push(t)
			
			t.$wrapper = $(obj);
			
			t.sortable();	
			t.base(options);	
			
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
				'<form id="'+t.classes.upload+'" class="'+t.classes.form+' '+t.classes.wrapper+' '+t.classes.icons+'" action="'+PhotoFrame.Actions.upload_photo+(t.IE() ? '&ie=true' : '')+'&index='+t.index+'" method="POST" enctype="multipart/form-data" id="'+t.classes.upload+'-'+t.index+'" '+(t.IE() ? 'target="photo-frame-iframe-'+t.index+'"' : '')+'>',
					'<h3>'+PhotoFrame.Lang.select_file+'</h3>',
					'<input type="file" name="files[]" multiple>',
					'<button type="submit" class="'+t.classes.button+'"><span class="icon-upload"></span>'+t.buttonText+'</button>',
				'</form>'
			].join('');
			
			t.ui.form = $(html);
			t.ui.form.submit(function() {
				if(t.IE()) {
					t.ui.form.hide();
					t.showProgress(0, function() {
						t.startUpload();
					});
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
						'<span class="'+t.classes.indicator+'"></span> <p>'+PhotoFrame.Lang.uploading+'</p>',
						'<a class="'+t.classes.button+' '+t.classes.cancel+'"><span class="'+t.icons.cancel+'"></span> Cancel</a>',
					'</div>',
					'<div class="'+t.classes.progress+'"></div>',
					'<div class="'+t.classes.errors+'">',
						'<h3>'+PhotoFrame.Lang.errors+'</h3>',
						'<ul></ul>',
						'<a class="'+t.classes.button+' '+t.classes.cancel+'"><span class="'+t.icons.cancel+'"></span> Close</a>',
					'</div>',
					'<div class="'+t.classes.crop+'">',
						'<div class="'+t.classes.cropPhoto+'"></div>',
						'<div class="'+t.classes.renderBg+'"><div class="'+t.classes.renderText+'">'+PhotoFrame.Lang.rendering+'</div></div>',
						'<div class="'+t.classes.meta+'">',
							'<a href="#" class="'+t.classes.metaClose+' '+t.classes.floatRight+'"><span class="'+t.icons.cancel+'"></span></a>',
							'<h3>'+PhotoFrame.Lang.photo_details+'</h3>',
							'<ul>',
								'<li>',
									'<label for="title">'+PhotoFrame.Lang.title+'</label>',
									'<input type="text" name="title" value="" id="title" />',
								'</li>',
								'<!-- <li>',
									'<label for="keywords">'+PhotoFrame.Lang.keywords+'</label>',
									'<input type="text" name="keywords" value="" id="keywords" />',
								'</li> -->',
								'<li>',
									'<label for="title">'+PhotoFrame.Lang.description+'</label>',
									'<textarea name="description" id="description"></textarea>',
								'</li>',
							'</ul>',
						'</div>',
						'<div class="'+t.classes.toolbar+'">',
							'<div class="'+t.classes.tools+'">',
								'<a href="#" class="'+t.classes.toolBarToggle+'"><i class="'+t.icons.tools+'"></i></a>',
								/*'<a class="'+t.classes.infoToggle+'"><i class="'+t.icons.info+'"></i></a>',*/
							'</div>',
							'<a href="#"  class="'+t.classes.barButton+' '+t.classes.cancel+' '+t.classes.floatLeft+'"><span class="'+t.icons.cancel+'"></span> '+PhotoFrame.Lang.cancel+'</a>',
							'<a href="#"  class="'+t.classes.barButton+' '+t.classes.save+' '+t.classes.floatRight+'"><span class="'+t.icons.save+'"></span> '+PhotoFrame.Lang.save+'</a>',
						'</div>',
					'</div>',
				'</div>'
			].join('');
			
			t.ui.dimmer        = $(html);
			t.ui.toolbar       = t.ui.dimmer.find('.'+t.classes.toolbar);
			t.ui.tools         = t.ui.toolbar.find('.'+t.classes.tools);
			t.ui.toolBarToggle = t.ui.toolbar.find('.'+t.classes.toolBarToggle);
			t.ui.infoToggle    = t.ui.toolbar.find('.'+t.classes.infoToggle);
			
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
					
			t.buttonBar = new PhotoFrame.ButtonBar(t, t.buttons, {
				title: PhotoFrame.Lang.tools
			});
				
			$(window).keyup(function(e) {
				if (e.keyCode == 27) { 
					t.ui.cancel.click();
				} 
			});
				
			t.progressBar   = new PhotoFrame.ProgressBar(t.ui.progress, {
				callbacks: {
					cancel: function() {
						t.cancel = true;
						
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
						t.showProgress(parseInt(data.loaded / data.total * 100) * .5);
					},
					singleFileUploads: false,
					dropZone: t.ui.dropZone,
					url: t.getUploadUrl(),
					add: function (e, data) {

						if(t.maxPhotos > 0 && (t.maxPhotos <= t.getTotalPhotos())) {
							t.showErrors([PhotoFrame.Lang.max_photos_error], {
								max_photos: t.maxPhotos,
								max_photos_name: (t.maxPhotos == 1 ? 'photo' : 'photos')
							});
						}	
						else {
							if(data.files.length > 0) {
								t.ui.dropZone.hide();
								t.initialized = false;
								t.showProgress(0);
								t.startUpload(data.files, function() {
									t.jqXHR = data.submit();
								});
							}
						}
					},
					fail: function (e, data) {
						if(!t.cancel) {
							t.showErrors([PhotoFrame.Lang.unexpected_error]);	
						}						
						t.cancel = false;
					},
					done: function (e, data) {
						var errors = [];
						
						if(typeof data.result[0] == "undefined" || typeof data.result == "string") {
							errors = [PhotoFrame.Lang.unexpected_error];
						}	
						
						if(typeof data.result == "object" && data.result.length == 1) {
							t.showProgress(75, function() {
								t._uploadResponseHandler(data.result[0]);
							});
						}
						else {
							var count = 1;
							if(typeof data.result[0].success != "undefined") {
								t.showProgress(100, function() {
									$.each(data.result, function(i, result) {
										t._uploadResponseHandler(result, true, true, function() {
											if(count == data.result.length) {
												t.hideProgress();
												t.hideDimmer();
											}
											count++;
										});
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
		    	t.ui.iframe = $('<iframe name="photo-frame-iframe-'+t.index+'" id="photo-frame-iframe-'+t.index+'" src="" style="display:none;width:0;height:0"></iframe>');
		    	t.ui.body.append(t.ui.iframe);
	    	}

	    	for(var x in photos) {
		    	var photo = photos[x];
		    	
		    	new PhotoFrame.Photo(t, photo, {
		    		id: photo.id,
		    		manipulations: photo.manipulations,
		    		index: x,
		    		settings: $.extend({}, options.settings, {
			    		setSelect: [photo.x, photo.y, photo.x2, photo.y2]	
		    		}),
			    	$wrapper: t.$wrapper.find('#'+t.classes.photo+'-'+t.fieldId+'-'+x)
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
				t.callback(t.callbacks.browse);
			});
						
			t.ui.toolBarToggle.click(function(e) {
				t.toggleTools();
				e.preventDefault();
			});
			
			t.ui.infoToggle.click(function(e) {
		    	t.toggleMeta();
				e.preventDefault();
			});
			
			t.$wrapper.bind('dragover', function(e) {
				var obj 	= t.$wrapper.find('.'+t.classes.dropText);
				var parent  = obj.parent();
				
				if(t.maxPhotos == 0 || (t.maxPhotos > t.getTotalPhotos())) {
							
					t.ui.dropZone.show();
					
					obj.position({
						of: parent,
						my: 'center',
						at: 'center'
					});
					
					t.$wrapper.addClass(t.classes.dragging);					
				}

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
			
			t.bind('startCropBegin', function() {
				t.hideOverflow();
			});
			
			t.bind('saveEnd', function() {
				t.resetOverflow();
			});
			
			t.bind('cancel', function() {
				t.resetOverflow();
			});
			
			t.callback(t.callbacks.init);
		},
		
		getUploadUrl: function() {
			var _default = PhotoFrame.Actions.upload_photo
			var url = this.callbacks.buildUploadUrl();
			
			return url ? url : _default;	
		},

		parse: function(string, vars) {
			$.each(vars, function(i, value) {
				string = string.replace('{'+i+'}', value);
			});
			return string;
		},
		
		showError: function(error, vars) {
			var t = this;
			error = this.parse(error, vars);

			t.hideProgress(function() {
				t.ui.errors.find('ul').append('<li>'+error+'</li>');
				t.ui.errors.show();
				t.ui.errors.center();
				t.ui.dimmer.fadeIn();
				t.progressBar.reset();
			});
		},
		
		showErrors: function(errors, vars) {
			var t = this;
			t.ui.errors.find('ul').html('');
			t.ui.errors.hide();
			t.ui.activity.hide();
			t.ui.crop.hide();
			t.ui.form.hide();
			t.progressBar.hide();

			$.each(errors, function(i, error) {
				t.showError(error, vars);
			});
		},
		
		hideDimmer: function(callback) {
			if(this.buttonBar) {
				this.buttonBar.hide(false);
			}
			
			this.hideInstructions();
			this.ui.dimmer.hide(callback);
			this.ui.form.hide();
			this.ui.errors.fadeOut();
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
			for(var x in this.notices) {
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
		
		hideOverflow: function() {
			this.overflow = $('body').css('overflow');
			$('body').css('overflow', 'hidden');	
		},
		
		resetOverflow: function() {
			$('body').css('overflow', this.overflow);
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
	    			//t.resetProgress();
	    			//t.hideProgress();
	    			
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
				
				var props = {
					settings: this.settings,
					compression: this.compression,
					size: this.size,
					forceCrop: this.forceCrop,
					disableCrop: this.disableCrop,
					manipulations: {},
					//resize: this.resize,
					//resizeMax: this.resizeMax,
					index: this.photos.length,
				};
				
				var photo = new PhotoFrame.Photo(this, response, props);
				
				if(!noCrop && photo.forceCrop && !photo.disableCrop) {
					//this.hideProgress(function() {
						photo.startCrop();
					//});
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
		
		_fileBrowserResponseHandler: function(file, id, callback) {
			if(typeof id == "function") {
				callback = id;
				id = false;
			}
			
			var t = this;
			
			var options = {
				fieldId: t.fieldId,
				varId: t.varId, 
				colId: t.colId,
				file: file,
				assetId: (id ? id : false)
			};
			
			options = $.extend({}, options, t.callbacks.responseHandlerSettings());
			
			$.get(PhotoFrame.Actions.photo_response, options, function(response) {
					if(typeof response != "object") {
						t.log(response);
						t.showErrors([PhotoFrame.Lang.unexpected_error]);
					}
					else {
						if(typeof callback == "function") {				
							callback(response);
						}
					}
				}
			);
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
		
		hash: function(length, r) {
			var m = m || length; s = '', r = r ? r : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			for (var i=0; i < m; i++) { s += r.charAt(Math.floor(Math.random()*r.length)); }
			return s;
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
			else {
				if(files.length == 1) {
					t.ui.errors.hide();
					t.ui.crop.hide();
				}
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
				
		toggleTools: function() {
			if(this.buttonBar) {
				if(!this.buttonBar.isVisible()) {
					this.showTools();
				}
				else {
					this.hideTools();
				}
			}
		},
		
		showTools: function(callback) {
			if(this.buttonBar) {
				this.buttonBar.show(callback);
			}
		},
		
		hideTools: function(callback) {
			if(this.buttonBar) {
				this.buttonBar.hide(callback);
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
		},
		
		bind: function(event, callback) {
			if(!this.events[event]) {
				this.events[event] = [];
			}
			
			if(typeof callback == "function") {
				this.events[event].push(callback);
			}
		},
		
		trigger: function(event) {
			var t = this;
			var newArgs = arguments;
			var args = [];
					
			for(var x = 1; x <= newArgs.length; x++) {
				if(newArgs[x]) {
					args.push(newArgs[x]);
				}
			}
			
			if(this.events[event]) {
				$.each(this.events[event], function(i, callback) {
					callback.apply(this, args);				
				});
			}
		}
		
	});
	
	PhotoFrame.ButtonBar = PhotoFrame.Class.extend({
		
		/**
		 * An array of PhotoFrame.Button objects
		 */	
		 
		buttons: [],
		
		/**
		 * An object of classes
		 */	
		 
		classes: {
			active: 'photo-frame-active',
			wrapper: 'photo-frame-toolbar-tools',
			list: 'photo-frame-toolbar-tools-list',
			titleBar: 'photo-frame-toolbar-tools-title'
		},
		
		/**
		 * The parent PhotoFrame.Factory
		 */	
		 
		factory: false,

		/**
		 * The title of the button bar
		 */	
		 
		title: false,
				
		/**
		 * The child DOM objects
		 */	
		 
		ui: {
			list: false,
			titleBar: false,
			window: false
		},
		
		/**
		 * The wrapping DOM object
		 */	
		 
		// $wrapper: false,
				
		
		constructor: function(factory, buttons, options) {
			this.ui 	 = {};			
			this.buttons = [];
			this.base(options);
			this.factory = factory;
			this._buildButtonBar();
			this.addButtons(buttons);
			this.savePosition();
			
			if(this.buttons.length === 0) {
				this.factory.ui.tools.hide();
			}
		},
		
		addButton: function(button, options) {
			var button = this.loadButton(button, options);
			
			if(button) {
				var item = $('<li />').append(button.$obj);
				
				this.ui.list.append(item);			
				this.buttons.push(button);
			}
		},				
		
		addButtons: function(buttons, options) {
			var t = this;
			
			for(var x in buttons) {
				var button = buttons[x];
				
				this.addButton(button, options);
			}
		},
		
		unclick: function() {
			
		},
		
		click: function() {
			//this.ui.list.find('.'+this.classes.active).removeClass(this.classes.active);	
		},	
		
		loadButton: function(type, options) {
			if(typeof options != "object") {
				options = {};
			}
			
			if(PhotoFrame.Buttons[type.ucfirst()]) {
				var button = new PhotoFrame.Buttons[type.ucfirst()](this, $.extend(true, {}, {
					name: type
				}, options));
							
				return button;
			}
			else {
				this.log('The "'+type.ucfirst()+'" button does not exist.');
			}			
		},
		
		isVisible: function(callback) {
			return this.ui.window.css('display') != 'none' ? true : false;
		},
		
		show: function(save, callback) {
			if(typeof save == "undefined") {
				save = true;
			}
			else if(typeof save == "function") {
				callback = save;
				save = true;
			}
			
			if(this.buttons.length > 0) {
				this.factory.ui.toolBarToggle.addClass(this.classes.active);
				this.ui.window.fadeIn(callback);
				
				if(save) {
					this.setVisibility(true);
				}			
				this.showWindows();
			}
			
			this.savePosition();
		},
		
		hide: function(save, callback) {
			var t = this;
			
			if(typeof save == "undefined") {
				save = true;
			}
			else if(typeof save == "function") {
				callback = save;
				save = true;
			}
			
			for(var x in this.factory.windows) {
				this.factory.windows[x].close(false);
			}
			
			this.ui.list.find('.'+this.classes.active).removeClass(this.classes.active);			
			
			this.ui.window.fadeOut(function() {
				t.factory.ui.toolBarToggle.removeClass(t.factory.classes.active);
			});
			
			if(save) {
				this.setVisibility(false);
			}	
			
			this.savePosition();
		},
		
		showWindows: function() {
			for(var x in this.factory.windows) {
				var window = this.factory.windows[x];
				if(window.visible) {
					window.open();
				}
			}
		},
		
		hideWindows: function() {
			for(var x in this.factory.windows) {
				var window = this.factory.windows[x];
				if(!window.visible) {
					window.close(false);
				}
			}
		},
		
		position: function() {			
			if(this.hasPosition()) {
				var pos = this.getPosition();
				this.ui.window.css({
					left: pos.x,
					top: pos.y,
					position: 'fixed'
				});
				this.savePosition();
			}		
		},	
		
		_buildButtonBar: function() {
			var t = this;
			
			this.ui.window = $([
				'<div class="'+this.classes.wrapper+'">',
					'<div class="'+this.classes.titleBar+'">'+this.title+'</div>',
					'<ul class="'+this.classes.list+'"></ul>',
				'</div>'
			].join(''))
			.css('z-index', 1);
			
			this.ui.titleBar = this.ui.window.find('.'+this.classes.titleBar);
			this.ui.list     = this.ui.window.find('.'+this.classes.list);
			
			this.factory.ui.dimmer.append(this.ui.window);
			
			this.ui.window.draggable({
				handle: this.ui.titleBar,
				containment: 'parent',
				scroll: false,
				start: function() {
					t.bringToFront();
				},
				stop: function(e) {
					t.savePosition();
				}
			});
			
			this.ui.titleBar.mousedown(function() {
				t.bringToFront();
			});
			
			this.position();
		}
		
	});
	
	PhotoFrame.Button = PhotoFrame.Class.extend({
		
		/**
		 * The PhotoFrame.ButtonBar object
		 */	
		 
		buttonBar: false,
		
		/**
		 * The class of the icon to use
		 */	
		 
		icon: false,
		
		/**
		 * The name of the button
		 */	
		 
		name: false,
		
		/**
		 * A description of what the button does
		 */	
		 
		description: false,	
		
		/**
		 * The DOM object
		 */	
		 
		$obj: false,
	
		/**
		 * Should Photo Frame render the photo after removing the layer
		 */	
		 
		renderAfterRemovingLayer: true,
		
		/**
		 * The primary PhotoFrame.Window object 
		 */
		
		window: false,
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			css: '',
			title: false
		},
		
		/**
		 * Constructor method for the button
		 *
		 * @param	object  The PhotoFrame.ButtonBar object
		 * @param	object  A JSON object of options to override params
		 * @param	bool    If TRUE or undefined, the window will be built
		 * @return	object
		 */
		
		constructor: function(buttonBar, options, buildWindow) {
			var t = this;					
			
			if(typeof buildWindow === "undefined") {
				buildWindow = true;
			}
			
			this.ui  	   = {};
			this.buttonBar = buttonBar;
			this.base(options);
			this.$obj = $('<a href="#" title="'+this.description.replace('"', '')+'"></a>');
			this.$obj.append('<i />').find('i').addClass('icon-'+(this.icon ? this.icon : this.name.toLowerCase()));
			
			this.$obj.click(function(e) {
				t.click(e);
				e.preventDefault();
			});
			
			if(buildWindow === true) {
				this.buildWindow();
			}
		},	
		
		/**
		 * Show the manipulation
		 *
		 * @return	void
		 */
		
		showManipulation: function() {
			this.cropPhoto().showManipulation(this.name);
		},
		
		/**
		 * Hide the manipulation
		 *
		 * @return	void
		 */
		
		hideManipulation: function() {
			this.cropPhoto().hideManipulation(this.name);
		},
		
		/**
		 * Add the manipulation
		 *
		 * @param	bool	If true, the manipulation will be visible
		 * @param	object  A JSON object used to build the effect
		 * @return	void
		 */
		
		addManipulation: function(visible, data) {
			this.cropPhoto().addManipulation(this.name, visible, data);
		},
		
		/**
		 * Get the photo being cropped
		 *
		 * @return	object  PhotoFrame.Photo
		 */
		
		cropPhoto: function() {
			return this.buttonBar.factory.cropPhoto;
		},
		
		/**
		 * Update the manipulation JSON without an AJAX callback
		 *
		 * @return	void
		 */
		
		updateJson: function() {
			this.cropPhoto().updateJson();	
		},
		
		/**
		 * Render the manipulation
		 *
		 * @param	callback  A callback function triggered after the effects triggers
		 * @return	void
		 */
		
		render: function(callback) {
			this.cropPhoto().render(callback);	
		},
		
		/**
		 * Remove the manipulation
		 *
		 * @return	void
		 */
		
		removeManipulation: function() {
			delete this.buttonBar.factory.cropPhoto.manipulations[this.name.toLowerCase()];
			this.buttonBar.factory.trigger('removeManipulation', this);
		},
		
		/**
		 * Bind an event
		 *
		 * @param	bool	  The name of the event used to bind the callback
		 * @param	callback  The function called with the bound event
		 * @return	void
		 */
		
		bind: function(event, callback) {
			this.buttonBar.factory.bind(event, callback);
		},
		
		/**
		 * Build the PhotoFrame.Window object
		 *
		 * @param	object  A JSON object used to build the effect
		 * @return	void
		 */
		
		buildWindow: function(options) {
			if(typeof options == "object") {
				this.windowSettings = $.extend(true, {}, this.windowSettings, options);
			}
			this.window = new PhotoFrame.Window(this.buttonBar.factory, this.$obj, this.windowSettings);
		},
		
		/**
		 * This method is triggered when the button is clicked
		 *
		 * @param	object  The event object
		 * @return	void
		 */
		
		click: function(e) {
			if(this.$obj.hasClass(this.buttonBar.classes.active)) {
				this.buttonBar.unclick();
				this.$obj.removeClass(this.buttonBar.classes.active);
				this.window.close();
			}
			else {
				this.buttonBar.click();
				this.$obj.addClass(this.buttonBar.classes.active);
				this.window.open();
			}			
		},
		
		/**
		 * Hide the window
		 *
		 * @param	callback  This callback is triggered when the window is hidden
		 * @return	void
		 */
		
		hideWindow: function(callback) {
			this.$obj.removeClass(this.buttonBar.classes.active);
			this.window.close();
		},
		
		/**
		 * Show the window
		 *
		 * @param	callback  This callback is triggered when the window is hidden
		 * @return	void
		 */
		
		showWindow: function(callback) {		
			this.$obj.addClass(this.buttonBar.classes.active);		
			this.window.open();			
			this.window.position();
		},
		
		/**
		 * Get the manipulation visibility
		 *
		 * @return	bool
		 */
		
		getVisibility: function() {
			return this.getManipulation() ? this.getManipulation().visible : true;
		},
		
		/**
		 * Get the manipulation
		 *
		 * @return	mixed  Returns the manipulation object or FALSE is doesn't exist
		 */
		
		getManipulation: function() {
			if(this.cropPhoto()) {
				return this.cropPhoto().getManipulation(this.name);
			}
			return false;
		},
		
		/**
		 * Set the manipulation visibility to true or false
		 *
		 * @param	bool  True if visible, false for hidden
		 * @return	void
		 */
		
		setManipulation: function(visibility) {
			var m = this.getManipulation();
			m.visible = visibility;
		},
		
		/**
		 * This method is triggered when the layer is removed
		 *
		 * @return	void
		 */
		
		removeLayer: function() {
			this.reset();		
		},
		
		/**
		 * Start the rendering
		 *
		 * @param	callback  This callback is triggered when the photo starts rendering
		 * @return	void
		 */
		
		startRendering: function(callback) {
			this.cropPhoto().startRendering(callback);	
		},
		
		/**
		 * Stop the rendering
		 *
		 * @param	callback  This callback is triggered when the photo stops rendering
		 * @return	void
		 */
		
		stopRendering: function(callback) {
			this.cropPhoto().stopRendering(callback);	
		},
		
		/**
		 * This method is triggered when the photo starts being cropped
		 *
		 * @param	object  The PhotoFrame.Photo object
		 * @return	void
		 */
		
		startCrop: function(photo) {
			var m = this.getManipulation();	
			
			if(m) {
				if(m.visible) {
					this.enable();
				}
				else {
					this.disable();
				}
			}
		},
		
		/**
		 * This method toggles the layer's visibility and renders it
		 *
		 * @param	bool  The layer's visibility
		 * @param	bool  True to render the photo, false to skip rendering
		 * @return	void
		 */
		
		toggleLayer: function(visibility, render) {			
			if(!visibility) {
				this.disable();	
			}
			else {
				this.enable();
			}
			
			this.setManipulation(visibility);
			
			if(typeof render == "undefined" || render === true) {
				this.render();
			}
		},
		
		/**
		 * Get the data used for the save() method
		 *
		 * @return	object
		 */
		
		getData: function() {
			return {};
		},

		/**
		 * Add a manipulation and save the refreshed JSON object.
		 * Note, this method is different than render().
		 *
		 * @return	object
		 */
		
		save: function(data) {
			this.addManipulation(this.getVisibility(), data);
			this.updateJson();
		},

		/**
		 * Apply the effect to the photo
		 *
		 * @return	void
		 */
		
		apply: function() {},
		
		/**
		 * Enable the button controls
		 *
		 * @return	void
		 */
		
		enable: function() {},
		
		/**
		 * Disable the button controls
		 *
		 * @return	void
		 */
		
		disable: function() {},
		
		/**
		 * Reset the button controls
		 *
		 * @return	void
		 */
		
		reset: function() {},

		/**
		 * Triggers each time the startCropCallback is called
		 *
		 * @return	void
		 */
		
		startCropCallback: function() {},

		/**
		 * Triggers each time the startCropCallbackFailed is called
		 *
		 * @return	void
		 */
		
		startCropCallbackFailed: function() {}
		
	});
		
	PhotoFrame.Window = PhotoFrame.Class.extend({
		
		/**
		 * An an array of button objects
		 */	
		 
		buttons: [],
			
		/**
		 * These are CSS classes appended to the window (string)
		 */
		
		css: '',
		
		/**
		 * An object of callback functions
		 */	
		 
		callbacks: {
			drag: function() {},
			dragstart: function() {},
			dragend: function() {},
			close: function() {},
			open: function() {}
		},
		
		/**
		 * An object of classes
		 */	
		 
		classes: {
			close: 'photo-frame-tool-window-close',
			title: 'photo-frame-tool-window-title',
			window: 'photo-frame-tool-window',
			content: 'photo-frame-tool-window-content',
			buttons: 'photo-frame-tool-window-buttons',
			button: 'photo-frame-tool-window-button',
			save: 'photo-frame-tool-window-save',
			wrapper: 'photo-frame-toolbar-tools'
		},
		
		/**
		 * The animation duration
		 */	
		 
		duration: 333,
		
		/**
		 * The easeIn animation
		 */	
		 
		easeIn: 'easeInElastic',
		
		/**
		 * The easeOut animation
		 */	
		 
		easeOut: 'easeOutElastic',
		
		/**
		 * The parent PhotoFrame.Factory object
		 */	
		 
		factory: false,
		
		/**
		 * An object of icon classes
		 */	
		 
		icons: {
			close: 'icon-cancel'	 
		},
		 
		/**
		 * The parent jQuery obj used to position the window
		 */
		
		parent: false,
		 
		/**
		 * The window title
		 */
		
		title: false,
			
		/**
		 * The children DOM object
		 */	
		 
		ui: {
			close: false,
			content: false,
			title: false,
			window: false	
		},
			
		/**
		 * The window width (int)
		 */	
		 
		width: false,
		
		constructor: function(factory, parent, options) {
			this.ui      = {};
			this.factory = factory;
			this.parent  = parent;
			
			this.base(options);	
			
			if(!this.title) {
				this.title = 'New Window '+this.factory.windows.length;
			}
						
			this.buildWindow();
			
			this.visible = this.getVisibility();
			
			factory.windows.push(this);
		},
		
		bringToFront: function() {
			this.factory.zIndexCount++;
			this.ui.window.css('z-index', this.factory.zIndexCount);
		},
		
		buildButtons: function() {
		
			var t = this;
			
			$.each(this.buttons, function(i, button) {
				var css  = button.css ? button.css : '';
				var text = button.text ? button.text : '';
				var icon = button.icon ? '<i class="'+button.icon+'"></i>' : '';
				var $btn = $('<a href="#" class="'+css+' '+t.classes.button+'">'+icon+text+'</a>');
				
				button.ui = {
					button: $btn
				}
				
				if(typeof button.init === "function") {
					button.init(button);
				}
				
				if(typeof button.onclick === "function") {
					$btn.click(function(e) {
						button.onclick(e, button);
						e.preventDefault();
						return false;
					});
				}
				
				t.ui.buttons.append($btn);
			});
		},
		
		buildWindow: function() {			
			var t    = this;					
			var html = $([
				'<div class="'+this.classes.wrapper+' '+this.classes.window+'">',
					'<a href="#" class="'+this.classes.close+'"><i class="'+this.icons.close+'"></i></a>',
					'<div class="'+this.classes.title+'">'+(this.title ? this.title.ucfirst() : 'N/A')+'</div>',
					'<div class="'+this.classes.content+'"></div>',
					'<div class="'+this.classes.buttons+' '+this.factory.classes.clearfix+'"></div>',
				'</div>'
			].join(''));
			
			this.ui.window  = html;
			this.ui.buttons = html.find('.'+this.classes.buttons);
			this.ui.close   = html.find('.'+this.classes.close);
			this.ui.content = html.find('.'+this.classes.content);
			this.ui.title   = html.find('.'+this.classes.title);
			
			this.ui.window.addClass(this.css);
			
			this.ui.window.draggable({
				handle: this.ui.title,
				containment: 'parent',
				scroll: false,
				drag: this.callbacks.drag,
				start: function(e) {
					t.bringToFront();
					t.callback(t.callbacks.dragstart, e);
				},
				stop: function(e) {
					t.savePosition();
					t.callback(t.callbacks.dragend, e);
				}
			});
			
			if(this.width) {
				this.ui.window.width(this.width);
			}
			
			this.ui.window.mousedown(function() {
				t.factory.trigger('windowMousedown', t);
				t.bringToFront();
			})
			
			this.ui.close.click(function(e) {
				t.close();
				e.preventDefault();
			});
			
			this.buildButtons();
			this.factory.ui.dimmer.append(html);
		},
		
		close: function(save, callback) {	
			var t = this;
			
			if(typeof save == "undefined") {
				save = true;
			}
			else if(typeof save == "function") {
				callback = save;
				save = true;
			}
			
			this.parent.removeClass(this.factory.buttonBar.classes.active);			
			this.ui.window.fadeOut({
				duration: this.duration
			}, function() {
				t.callback(t.callbacks.close);
				t.callback(callback);
			});
			
			if(save) {
				this.setVisibility(false);
			}
		},
		
		open: function(save, callback) {
			var t = this;
			
			this.factory.trigger('windowOpenBegin', this);
			
			if(typeof save == "undefined") {
				save = true;
			}
			else if(typeof save == "function") {
				callback = save;
				save = true;
			}
			
			this.parent.addClass(this.factory.buttonBar.classes.active);
			
			this.ui.window.fadeIn({
				duration: this.duration,
				//easing: this.easeIn
			})
			.css('display', 'inline-block')
			.css('position', 'fixed');
			
			setTimeout(function() {
				t.callback(t.callbacks.open);
				t.callback(callback);
				t.factory.trigger('windowOpenEnd', t);
			}, this.duration);
			
			if(this.ui.window.data('open') != 1) {
				this.position();
			}
			
			this.bringToFront();	
			this.ui.window.data('open', 1);
			this.setVisibility(true);
			this.savePosition();			
		},
		
		position: function() {			
			var left, index  = parseInt(this.ui.window.parent().index()) + 1;
			
			var pos = this.getPosition();
			var x   = pos ? parseInt(pos.x.replace('px', '')) : 0;
			
			this.ui.window.position({
				of: this.parent,
				my: 'left top',
				at: 'right top',
				collision: 'flip'
			});
					
			if(x+this.ui.window.width() > $(window).width()) {
				pos.x = ($(window).width() - this.ui.window.width()) + 'px';
			}
					
			if(this.hasPosition()) {
				this.ui.window.css({
					left: pos.x,
					top: pos.y
				})
				.position('collision', 'fit');
			}
			else {	
				var width = 16;
				
				if(index % 2 == 0) {
					this.shift('left', width);
				}		
				
				this.shift('left', width);
			}

			this.bringToFront();
			this.savePosition();	
		},
				
		shift: function(prop, value) {
			var current = parseInt(this.ui.window.css(prop).replace('px', ''));
			
			this.ui.window.css(prop, current+value);
		},
		
		isOpen: function() {
			return this.ui.window.css('display') == 'none' ? false : true;
		},
		
		toggle: function() {
			if(this.isOpen()) {
				this.close();
			}
			else {
				this.open();
			}
		}	
	});

	PhotoFrame.Photo = PhotoFrame.Class.extend({
			
		/**
		 * The random string used to cache the photo
		 */			 
		
		cache: false,
			
		/**
		 * The cached photo URL. This property is set in the render() callback
		 */			 
		
		cacheUrl: false,
			
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
		 * Has the photo cropping been initialized?
		 */	
		 
		initialized: false,
		
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
		 * Image Manipulations
		 */
		 
		manipulations: {},
		 
		/**
		 * Original Image Manipulation
		 */
		 
		originalManipulations: {},
		 
		/**
		 * The original file path
		 */
		 
		originalPath: false,
		 
		/**
		 * The original file URL
		 */
		 
		originalUrl: false,
		 
		/**
		 * The framed file path
		 */
		 
		path: false,
		 
		/**
		 * The framed file path
		 */
		 
		rendering: false,
		 
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
			rendering: false,
			saving: false
		},
					
		/**
		 * The photo URL
		 */
		 
		url: false,
		
		/**
		 * use the cache image?
		 */
		 
		useCache: false,
		 			
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
			
			this.ui       = {};
			this.$wrapper = false
			this.cache    = factory.hash(12);
			
			this.base(options);

			this.factory      = factory;
		    this.title        = response.title;
		    this.description  = response.description;
		    this.keywords     = response.keywords;
			this.response     = response;
			this.originalPath = response.original_path;
			this.originalUrl  = response.original_url;
			this.url          = response.url;
			this.path         = response.file_path;
			
			this.ui.rendering	  = this.factory.ui.crop.find('.'+this.factory.classes.renderBg);
			this.ui.renderingTxt  = this.factory.ui.crop.find('.'+this.factory.classes.renderText);
			
			if(!this.manipulations) {
				this.manipulations = {};
			}
			
			if(!this.index) {
				this.index = this.factory.getTotalPhotos();
			}

			if(this.$wrapper) {
				this._loadFromObj(this.$wrapper);
			}
			else {
				this._bindClickEvents();
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
			
			t.load(response.file_url, function(img) {
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
			
			// console.log(t.ui.edit);

			if(t.ui.edit) {
				t.ui.edit.unbind('click').click(function(e) {
					t.showProgress(0);
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
				t.factory.$wrapper.append('<input type="hidden" name="photo_frame_delete_photos['+t.factory.delId+'][]" value="'+t.id+'" />');
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
		
		hideManipulation: function(title) {			
			var name   = title.toLowerCase();
			var exists = this.manipulations[name] ? this.manipulations[name] : false;
			if(this.manipulations[name]) {
				this.manipulations[name].visible = false;
			}
			this.factory.trigger('hideManipulation', this, name, exists);
		},
		
		showManipulation: function(title) {			
			var name   = title.toLowerCase();
			var exists = this.manipulations[name] ? this.manipulations[name] : false;
			if(this.manipulations[name]) {
				this.manipulations[name].visible = true;
			}
			this.factory.trigger('showManipulation', this, name, exists);
		},
		
		addManipulation: function(title, visibility, data) {
			var name   = title.toLowerCase();
			var exists = this.manipulations[name] ? this.manipulations[name] : false;
			
			if(data) {
				this.manipulations[name] = {
					visible: visibility,
					data: data
				};		
			}	
			
			this.factory.trigger('addManipulation', this, name, exists);
		},
		
		getManipulation: function(name) {
			name = name.toLowerCase();
			if(this.manipulations[name]) {
				return this.manipulations[name];
			}	
			return false;
		},
		
		getManipulations: function() {
			return this.manipulations;	
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
		
		initJcrop: function(callback, debug) {
			var t = this;
			
			t.factory.ui.toolbar.show();
			
			if(t.initialized) {
				t.destroyJcrop();
			}
			
            t.settings.onChange = function() {
            	t.hideInstructions();
	          	t.updateInfo();	
	            this.released = false;
	            t.factory.trigger('jcropOnChange', this);
            };
            
            t.settings.onRelease = function() {
	            this.released = true;            	
	            t.factory.trigger('jcropOnRelease', this);
            };
            
            t.settings.onSelect = function() {
	            this.released = false;	            
	            t.factory.trigger('jcropOnSelect', this);
            }
            
			if(t.settings.setSelect) {
				var size = 0;
				
				for(var x in t.settings.setSelect) {
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
		
		releaseCrop: function() {
			this.jcrop.setSelect([0, 0, 0, 0]);
			this.jcrop.release();
			this.released = true;
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

		getSaveData: function() {
			if(this.ui.field) {
				return this.ui.field.val();
			}
			else  {
				return false;
			}
		},

		setSaveData: function(data) {
			if(this.ui.field) {
				this.ui.field.val(data).html(data);
			}
		},

		updateJson: function() {
			var saveData = this.jsonEncode(this.getSaveData());

			saveData.manipulations = this.getManipulations();

			this.setSaveData(this.jsonDecode(saveData));
		},
		
		render: function(callback) {
			var t = this;
			
			if(!this.isRendering() && t.ui.cropPhoto) {
				this.startRendering();
				this.useCache = true;
				
				$.post(PhotoFrame.Actions.render, 
					{
						fieldId: this.factory.fieldId,
						colId: this.factory.colId,
						varId: this.factory.varId,
						gridId: this.factory.gridId,
						path: this.path,
						// url: this.url,
						originalPath: this.originalPath,
						originalUrl: this.originalUrl,
						cachePath: this.cachePath,
						cacheUrl: this.cacheUrl,
						cache: this.cache,
						manipulations: t.getManipulations(),
						directory: this.factory.directory
					}, function(data) {
						t.cacheUrl = data.url;
						t.load(data.url, function(img) {			
							t.ui.cropPhoto.html(img); 
							t.stopRendering();
							t.callback(callback, data);
							t.factory.trigger('render');
						});
					}
				);
			}
			else {
				t.callback(callback);
			}
		},
		
		totalManipulations: function() {
			var count = 0;
			
			for(var x in this.manipulations) {
				count++;
			}
			
			return count;
		},
		
		needsRendered: function() {
			var total = this.totalManipulations();
			
			if(!total || total == 1 && this.manipulations['crop']) {
				return false;
			}
			
			if(total > 0) {
				return true;
			}
		},
		
		needsRendering: function() {
			return this.needsRendered();	
		},
		
		isRendering: function() {
			return this.rendering;	
		},
		
		startRendering: function(callback) {
			this.rendering = true;
			this.factory.trigger('startRendering');
			this.factory.ui.dimmer.addClass(this.factory.classes.rendering);
			this.callback(callback);
		},
		
		stopRendering: function(callback) {
			this.rendering = false;
			this.factory.trigger('stopRendering');
			this.factory.ui.dimmer.removeClass(this.factory.classes.rendering);
			this.callback(callback);
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
				file = this.photoUrl();
			}
			window.loadImage(file, function(img) {
				if(typeof callback == "function") {
					callback(img);
				}
			});	
		},
		
		photoUrl: function() {	
			return this.useCache ? this.cacheUrl : this.originalUrl;	
		},
		
		startCrop: function(callback) {
		    			    	
			this.factory.cropPhoto = this;
			
			var t   = this;
			var obj = {
				fieldId: this.factory.fieldId ? this.factory.fieldId : false,
				varId: this.factory.varId ? this.factory.varId : false,
				colId: this.factory.colId ? this.factory.colId : false,
				gridId: this.factory.gridId ? this.factory.gridId : false,
				cache: this.cache,
				//url: this.originalUrl,
				originalUrl: this.originalUrl,
				originalPath: this.originalPath,
				exifData: this.response.exif_string ? this.response.exif_string : '',
				//path: this.factory.directory.server_path,
				manipulations: this.manipulations,
				directory: this.factory.directory
			};
			
			t.originalManipulations = $.extend(true, {}, t.manipulations);
			
			if(t.factory.buttonBar) {
				$.each(t.factory.buttonBar.buttons, function(i, button) {
					button.reset();	
				});
			}
			
	        t.factory.trigger('startCropBegin', t);
	        
			t.factory.ui.dimmer.fadeIn('fast');
			
			if(!t.initialized) {
				t.factory.ui.cropPhoto.remove();
			}
			
			t.factory.resetMeta();
			
			//t.factory.showProgress();
				
			$.post(PhotoFrame.Actions.start_crop, obj, function(response) {
			
				if(response.success) {
					t.factory.showProgress(100, function() {
						
						t.useCache  = true;
						t.cacheUrl  = response.cacheUrl;
						t.cachePath = response.cachePath;
						
						if(response.success) {
							$.each(t.factory.buttonBar.buttons, function(i, button) {
								button.startCropCallback(t, obj, response.data);
							});
							t.factory.trigger('startCropCallback', t, obj, response.data);
						}
						else {
							$.each(t.factory.buttonBar.buttons, function(i, button) {
								button.startCropCallbackFailed(t, obj, response.data);
							});
							t.factory.trigger('startCropCallbackFailed', t, obj, response);
						}
						
						t.load(t.photoUrl(), function(img) {
							
							t.factory.hideProgress();
							
							t.ui.cropPhoto = $('<div class="'+t.factory.classes.cropPhoto+'"></div>');
							t.factory.ui.cropPhoto = t.ui.cropPhoto;
							t.factory.trigger('cropPhotoLoaded', t, img);
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
				        	   	
				            t.hideMeta();
				            
				            if(t.factory.buttonBar && t.factory.buttonBar.getVisibility()) {
					            t.factory.showTools();
				            }
				            
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
				            
				        	t.updateInfo();
				        	
				            $(window).resize();
				            if(t.factory.buttonBar) {
					            for(var x in t.factory.buttons) {
				            
						            t.factory.buttonBar.buttons[x].startCrop(t);
					            }
				            }
				            if(t.needsRendered()) {
					            t.render(function() {
					            	t.factory.trigger('startCropEnd', t);
					            });
				            }
				            else {
					           t.factory.trigger('startCropEnd', t);
				            }
						});
							
					});
				}
				else {
					if(response.errors) {
						t.factory.showErrors(response.errors);
					}
					else {
						t.log(response);
						t.factory.showErrors([PhotoFrame.Lang.unexpected_error]);
					}
				}
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

		    	e.preventDefault();
			});
			
			t.factory.ui.cancel.unbind('click').click(function(e) {
				
				t.clearNotices();				
				t.hideMeta();
				t.hideProgress();
				
				t.manipulations  = $.extend(true, {}, t.originalManipulations);
				t.factory.cancel = true;
				t.render();
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
				
				t.factory.trigger('cancel', t);
												
				e.preventDefault();
			});
		},
		
		save: function(saveData) {
			var t 	 = this;			
			var date = new Date();
			var edit = t.edit;
			
			this.factory.trigger('saveBegin', this);
			
			if(!edit) {			
				t._createPhoto(saveData);
			}
			else {				
				t._updatePhoto(saveData);	
			}
			
			t.load(t.cropResponse.url, function(img) {
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
				
				t.factory.trigger('saveEnd', t);
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
			
			this.factory.trigger('saveCropStart', t);
			
			var errors = t.validate();
			  
			if(errors.length > 0) {
				t.factory.notify(errors);
			}
			else {
				t.clearNotices();
				
				t.ui.saving = $('<div class="'+t.factory.classes.saving+'"><span></span> '+PhotoFrame.Lang.saving+'</div>');
				
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
					t.cropResponse      = cropResponse;
					t.factory.cropPhoto = false;
					t.destroyJcrop();		
					t.save(cropResponse.save_data);	
					t.factory.trigger('saveCropStop', t, cropResponse);
				});
			}
		},
		
		_sendCropRequest: function(response, callback) {
			if(typeof response == "function") {
				callback = response;
				response = false;
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
    		
			$.post(PhotoFrame.Actions.crop_photo, {
				fieldId: t.factory.fieldId,
				varId: t.factory.varId,
				colId: t.factory.colId,
				gridId: t.factory.gridId,
				cache: t.cache,
				useCache: t.useCache,
				cacheUrl: t.cacheUrl,
				cachePath: t.cachePath,
				id: t.factory.directory.id,
				assetId: t.response.asset_id,
				index: t.factory.index,
				photo_id: t.id,
				image: response.file_path,
				name: response.file_name,
				manipulations: t.manipulations,
				directory: t.factory.directory,
				original: response.original_path,
				original_file: response.original_file,
				exifData: response.exif_string,
				url: response.url,
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
				compression: t.compression
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
		
		width: function() {
			return this.ui.cropPhoto ? this.ui.cropPhoto.find('img').width() : 0;
		},
		
		height: function() {
			return this.ui.cropPhoto ? this.ui.cropPhoto.find('img').height() : 0;
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
			var imgWidth    = Math.ceil(this.width());
			var imgHeight   = Math.ceil(this.height());
			
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
		 * The progress percentage.
		 */		
		 
		progress: 0,				
			
		/**
		 * An object of UI elements.
		 */		
		 
		ui: {},
		
		/**
		 * The wrapping DOM object.
		 */		
		 
		$wrapper: false,
			
		/**
		 * Constructor to set the options and UI events.
		 *
		 * @param object  The wrapper object
		 * @param object  An array of options to be set
		 */	
		 
		constructor: function(obj, progress, options) {	
			var t = this;
			
			t.progress = 0;
			t.ui 	   = {};
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
					progress: function() {},	
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
			
			t.callbacks.progress(t, t.progress);
			
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
			
			t.center();
			
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
		
	PhotoFrame.Database = PhotoFrame.Class.extend({
		
		/**
		 * The driver used
		 */	
		 
		driver: 'localStorage',
		
		/**
		 * Datatable Fields
		 */	
		 
		fields: [],
		
		/**
		 * The localStorageDB object
		 */	
		 
		model: false,
		
		/**
		 * The name of the datatable
		 */	
		 
		name: false,
		
		/**
		 * If TRUE the datatable will be reset with each page load
		 */	
		 
		reset: false,
		
		/**
		 * Easily istantiate a database using localStorage
		 *
		 * @param 	string 	The name of the datatable
		 * @param 	string 	The storage driver (defaults to localStorage)
		 * @return	mixed
		 */		
		 
		constructor: function(options) {			
			this.base(options);
			this.model = new localStorageDB('PhotoFrame', this.driver);
			if(this.reset) {
				this.clear();
			}
			this._firstRun();
		},
		
		/**
		 * Clear the datatable
		 *
		 * @return	void
		 */		
		 
		clear: function() {
			this.model.dropTable(this.name);
			this.model.commit();
		},
		
		/**
		 * Create the datatable
		 *
		 * @return	void
		 */		
		 
		create: function() {
			this.model.createTable(this.name, this.fields);
			this.model.commit();
		},
		
		/**
		 * Drop the datatable
		 *
		 * @return	void
		 */		
		 
		drop: function() {
			this.model.dropTable(this,name);
			this.model.commit();
		},
		
		/**
		 * Does the datatable exist?
		 *
		 * @return	bool  Returns TRUE if exists
		 */		
		 
		exists: function() {
			return this.model.tableExists(this.name);
		},
		
		/**
		 * Get the data from the datatable
		 *
		 * @param   object  A data object used filter the results
		 * @return	bool  Returns TRUE if exists
		 */		
		 
		get: function(data) {
			return this.model.query(this.name, data);
		},
		
		/**
		 * Inserts data into the datatable
		 *
		 * @param   object  An object of data to insert
		 * @return	void
		 */		
		 
		insert: function(data) {
			this.model.insert(this.name, data);
			this.model.commit();
		},
		
		/**
		 * Insert if data does not exist
		 *
		 * @param   object  An object of data to insert
		 * @return	void
		 */		
		 
		insertIfNew: function(data) {
			if(this.model.query(this.name, data).length == 0) {
				this.model.insert(this.name, data);
				this.model.commit();
			}
		},
		
		/**
		 * Insert or update
		 *
		 * @param   object  An object of data to insert
		 * @return	void
		 */		
		 
		insertOrUpdate: function(query, data) {
			this.model.insertOrUpdate(this.name, query, data);
			this.model.commit();
		},
		
		/**
		 * Update data in the datatable
		 *
		 * @param   object  The row ID to update
		 * @param   object  An object of data to update
		 * @return	void
		 */		
		
		update: function(query, data) {
			if(typeof query != "object") {
				query = {ID: query};
			}
			this.model.update(this.name, query, function(row) {
				return $.extend(true, {}, row, data);
			});
			this.model.commit();
		},
		
		/**
		 * Remove data from the datatable
		 *
		 * @param   object  The row ID to update
		 * @return	void
		 */	
		 
		remove: function(id) {
			this.model.deleteRows(this.name, {ID: id});
			this.model.commit();
		},
		
		/**
		 * The database first run
		 *
		 * @return	void
		 */	
		
		_firstRun: function() {
			if(!this.exists()) {
				this.create();
			}
		}
		
	});

	PhotoFrame.Slider = PhotoFrame.BaseElement.extend({

		/**
		 * Slider animation speed
		 */	

		animate: false,

		/**
		 * An object of callback methods
		 */	
		 
		callbacks: {
			create: function(event, ui) {},
			start: function(event, ui) {},
			slide: function(event, ui) {},
			stop: function(event, ui) {}
		},

		/**
		 * Is slider disabled?
		 */	

		disabled: false,
		 
		/**
		 * The PhotoFrame.Factory object
		 */	

		factory: false,

		/**
		 * Minimum slider value
		 */	

		min: false,
		 
		/**
		 * Maximum slider value
		 */	

		max: false,

		/**
		 * The slider's orientation
		 */	

		orientation: false,

		/**
		 * The parent jQuery object to append the slider
		 */	

		parent: false,

		/**
		 * Use the min & max for the slider's range?
		 */	

		range: false,

		/**
		 * The slider's increment value
		 */	

		step: 1,

		/**
		 * An object of UI elements
		 */	
		 
		ui: {
		 	slider: false,
			tooltip: false
		},

		/**
		 * Should the slider use the preferences?
		 */	

		usePreferences: false,

		/**
		 * The slider value
		 */	

		value: false,

		/**
		 * Constructor method
		 *
		 * @param   object  The PhotoFrame.Factory object
		 * @param   object  The parent jQuery object to append the slider
		 * @param   object  An object of options
		 * @return  void
		 */		
		 
		constructor: function(factory, parent, options) {
			this.base(factory, parent, options);
			this.buildSlider();
		},

		/**
		 * Build the slider HTML
		 *
		 * @return  void
		 */		
		 
		buildSlider: function() {
			var t 	    = this;
			var classes = 'photo-frame-slider-tooltip photo-frame-hidden';
			
		 	this.ui.slider  = $('<div class="photo-frame-slider"></div>');
		 	this.ui.tooltip = $('<div class="'+classes+'"></div>');

		 	this.parent.append(this.ui.slider);
		 	this.parent.append(this.ui.tooltip);

		 	this.ui.slider.slider({
		 		animate: this.animate,
		 		disabled: this.disabled,
				min: this.min,
				max: this.max,
				orientation: this.orientation,
				range: this.range,
				step: this.step,
				value: this.value,
				start: function(e, ui) {
					t.showTooltip();
					t.positionTooltip(ui);
					t.factory.trigger('sliderStart', t);
					t.callback(t.callbacks.start, e, ui);
				},
				create: function(e, ui) {
					t.positionTooltip(ui);
					t.factory.trigger('sliderCreate', t);
					t.callback(t.callbacks.create, e, ui);
				},
				slide: function(e, ui) {
					t.positionTooltip(ui);
					t.factory.trigger('sliderSlide', t);
					t.callback(t.callbacks.slide, e, ui);
					t.setPreference();
				},
				stop: function(e, ui) {
					t.hideTooltip();
					t.positionTooltip(ui);
					t.factory.trigger('sliderStop', t);
					t.callback(t.callbacks.stop, e, ui);
				}
			});

		 	this.setValueFromPreferences();
		},

		/**
		 * Position the tooltip
		 *
		 * @param   object  The slider UI object
		 * @return  void
		 */		
		 
		positionTooltip: function(ui) {			
			this.ui.tooltip.html(ui.value);		
			this.ui.tooltip.position({
				of: ui.handle,
				my: 'center top',
				at: 'center bottom'
			});
			
			var top = parseInt(this.ui.tooltip.css('top').replace('px', ''), 10);
			
			this.ui.tooltip.css('top', top+10);			
		},

		/**
		 * Show the tooltip
		 *
		 * @return  void
		 */		
		 
		showTooltip: function() {
			this.ui.tooltip.removeClass('photo-frame-hidden');
		},

		/**
		 * Hide the tooltip
		 *
		 * @return  void
		 */		
		 
		hideTooltip: function() {
			this.ui.tooltip.addClass('photo-frame-hidden');
		},

		/**
		 * Enable the slider
		 *
		 * @return  void
		 */		
		 
		enable: function() {
			this.disabled = false;
			this.ui.slider.slider('enable');
		},

		/**
		 * Disable the tooltip
		 *
		 * @return  void
		 */		
		 
		disable: function() {
			this.disabled = true;
			this.ui.slider.slider('disable');
		},

		/**
		 * Get the slider option
		 *
		 * @param   string  The slider option name
		 * @return  mixed
		 */		
		 
		getSliderOption: function(option) {
			return this.ui.slider.slider(option);
		},

		/**
		 * Show the tooltip
		 *
		 * @param   string  The option to set
		 * @param   mixed   The option value
		 * @return  void
		 */		
		 
		setSliderOption: function(option, value) {
			this.ui.slider.slider(option, value);
		},

		/**
		 * Set the slider value
		 *
		 * @param   mixed   The slider value
		 * @return  void
		 */		
		 
		setValue: function(value) {
			this.setSliderOption('value', value);
		},

		/**
		 * Get the slider value
		 *
		 * @return  int
		 */		
		 
		getValue: function() {
			return this.getSliderOption('value');
		},

		/**
		 * Is the slider enabled?
		 *
		 * @return  bool
		 */		
		 
		isEnabled: function() {
			return this.getSliderOption('disabled') ? false : true;
		},

		/**
		 * Is the slider disabled?
		 *
		 * @return  bool
		 */		
		 
		isDisabled: function() {
			return this.getSliderOption('disabled');
		},

		/**
		 * Set the last slider value to the preferences
		 *
		 * @return  void
		 */		
		 
		setPreference: function() {
			if(this.usePreferences) {
				PhotoFrame.Model.Preferences.setPreference('sliderLastValue', this.getValue());
			}
		},

		/**
		 * Get the last slider value to the preferences
		 *
		 * @return  mixed
		 */		
		 
		getPreference: function() {
			if(this.usePreferences) {
				return PhotoFrame.Model.Preferences.getPreference('sliderLastValue');
			}
			return false;
		},

		/**
		 * Set the slider value from the preferences
		 *
		 * @return  value
		 */		
		 
		setValueFromPreferences: function() {
			if(this.usePreferences && this.value === false) {
				this.setValue(this.getPreference());
			}
		}

	});
	
	PhotoFrame.ColorPicker = PhotoFrame.BaseElement.extend({

		/**
		 * An object of callback methods
		 */	

		callbacks: {
			init: function() {},
			change: function(color) {},
			move: function(color) {},
			hide: function(color) {},
			show: function(color) {},
			beforeShow: function(color) {},
		},

		/**
		 * Override the default cancel button text
		 */	

		cancelText: false,

		/**
		 * Override the default choose button text
		 */	

		chooseText: false,

		/**
		 * Add an additional class name to the color picker
		 */	

		className: 'photo-frame-color-picker',

		/**
		 * When clicking outside the colorpicker, force to change the value
		 */	

		clickoutFiresChange: false,

		/**
		 * The default color string
		 */	

		color: false,

		/**
		 * Disable the color picker by default
		 */	

		disabled: false,

		/**
		 * Flat mode
		 */	

		flat: false,

		/**
		 * Fonts PhotoFrame.Window object ID
		 */

		fontWindowId: 'fontWindowColorPicker',

		/**
		 * The default colors in the palette
		 */	

		palette: [],

		/**
		 * Change the preferred output of the color format
		 * Accepted Values: hex|hex6|hsl|rgb|name
		 */	

		preferredFormat: 'hex',

		/**
		 * Show the alpha transparency option
		 */	

		showAlpha: false,

		/**
		 * Show the cancel and choose buttons
		 */	

		showButtons: false,

		/**
		 * Show the initial color beside the new color
		 */	

		showInitial: false,

		/**
		 * Allow free form typing via text input
		 */	

		showInput: false,

		/**
		 * Show the user created color palette
		 */	

		showPalette: false,

		/**
		 * Show the color that is selected within the palette
		 */	

		showSelectionPalette: false,

		/**
		 * Should the slider use the preferences?
		 */	

		usePreferences: false,


		constructor: function(factory, parent, options) {
			this.base(factory, parent, options);
			this.buildColorPicker();

			if(!this.color) {
				this.setColorFromPreferences();
			}
		},

		buildColorPicker: function() {
			var t = this;

			this.parent.spectrum({
				cancelText: this.cancelText,
				chooseText: this.chooseText,
				className: this.className,
				clickoutFiresChange: this.clickoutFiresChange,
				color: this.color,
				disabled: this.disabled,
				flat: this.flat,
				palette: this.palette,
				preferredFormat: this.preferredFormat,
				showAlpha: this.showAlpha,
				showButtons: this.showButtons,
				showInitial: this.showInitial,
				showInput: this.showInput,
				showPalette: this.showPalette,
				showSelectionPalette: this.showSelectionPalette,
				change: function(color) {
					t.setPreference();
					t.callback(t.callbacks.change, color);
					t.factory.trigger('colorPickerChange', t, color);
				},
				move: function(color) {
					t.callback(t.callbacks.move, color);
					t.factory.trigger('colorPickerMove', t, color);
				},
				hide: function(color) {
					t.callback(t.callbacks.hide, color);
					t.factory.trigger('colorPickerHide', t, color);
				},
				show: function(color) {
					t.callback(t.callbacks.show, color);
					t.factory.trigger('colorPickerShow', t, color);
				},
				beforeShow: function(color) {
					t.callback(t.callbacks.beforeShow, color);
					t.factory.trigger('colorPickerBeforeShow', t, color);
				}
			});

			this.callback(this.callbacks.init);
			this.factory.trigger('colorPickerInit');
		},

		get: function() {
			return this.getColor();
		},

		set: function(color) {
			this.setColor(color);
		},

		getRgb: function() {
			return this.getColor().toRgb();
		},
		
		getRgbString: function() {
			return this.getColor().toRgbString();
		},

		getHsl: function() {
			return this.getColor().toHsl();
		},
		
		getHslString: function() {
			return this.getColor().toHslString();
		},

		getName: function() {
			return this.getColor().toName();
		},
		
		getPercentageRgb: function() {
			return this.getColor().toPercentageRgb();
		},
		
		getPercentageRgbString: function() {
			return this.getColor().toPercentageRgbString();
		},
		
		getHex: function() {
			return this.getColor().toHex();
		},

		getHexString: function() {
			return this.getColor().toHexString();
		},

		getColor: function() {
			return this.parent.spectrum('get');
		},
		
		getString: function(format) {
			return this.getColor().toString(format);
		},

		setColor: function(color) {
			this.parent.spectrum('set', color);
			this.setPreference();
		},
		
		enable: function() {
			this.parent.spectrum('enable');
			this.factory.trigger('colorPickerEnable');
		},

		disable: function() {
			this.parent.spectrum('disable');
			this.factory.trigger('colorPickerDiable');
		},

		destroy: function() {
			this.parent.spectrum('destroy');
			this.factory.trigger('colorPickerDestroy');
		},

		show: function() {
			this.parent.spectrum('show');
			this.factory.trigger('colorPickerShow');
		},

		hide: function() {
			this.parent.spectrum('hide');
			this.factory.trigger('colorPickerHide');
		},

		toggle: function() {
			this.parent.spectrum('toggle');
			this.factory.trigger('colorPickerToggle');
		},

		getPreference: function() {
			var _return = {
				rgb: PhotoFrame.Model.Preferences.getPreference('colorPickerLastColorRgb'),
				hex: PhotoFrame.Model.Preferences.getPreference('colorPickerLastColorHex')
			};

			if(!this.usePreferences && typeof _return == "array" && _return.length == 0) {
				return false;
			}

			return _return;
		},

		setPreference: function() {
			if(this.usePreferences) {
				PhotoFrame.Model.Preferences.setPreference('colorPickerLastColorRgb', this.getRgbString());
				PhotoFrame.Model.Preferences.setPreference('colorPickerLastColorHex', this.getHexString());
			}
		},

		setColorFromPreferences: function() {
			if(this.usePreferences) {
				this.setColor(this.getPreference().hex);
			}
		}
	});

	/**
	 * This datatable stores the locations of the windows
	 */
	 
	PhotoFrame.Model.Preferences = new PhotoFrame.Database({
		
		/**
		 * The name of the datatable
		 */
		 
		name: 'photoFramePrefs',
		
		/**
		 * An array of datatable columns
		 */
		 
		fields: ['key', 'value'],

		/**
		 * Get one or more preferences by defining a key.
		 * If no key is present, all preferences are returned.
		 *
		 * @param   mixed  A preference name (the key)
		 * @return  bool
		 */		
		 
		getPreference: function(key) {
			if(typeof key != "undefined") {
				var _return = PhotoFrame.Model.Preferences.get({key: key});

				if(_return.length > 0) {
					return _return[0].value;
				}

				return false;
			}
			return PhotoFrame.Model.Preferences.get();
		},
		
		/**
		 * Set one or preferences by passing a key and value.
		 * If an object is passed, it will set multiple prefs.
		 *
		 * @param  mixed  The preference name (Or object of keys and values)
		 * @param  mixed  The preference value
		 * @return void
		 */		
		 
		setPreference: function(key, value) {
			if(typeof key == "object") {
				var obj = key;
				for(key in obj) {
		  			this.setPreference(key, obj[key]);
	  			}
			}
			else {
				PhotoFrame.Model.Preferences.insertOrUpdate({key: key}, {
					key: key,
					value: value
				});	
			}
		}

	});
	
	/**
	 * This datatable stores the locations of the windows
	 */
	 
	PhotoFrame.Model.WindowLocations = new PhotoFrame.Database({
		
		/**
		 * The name of the datatable
		 */
		 
		name: 'windowLocations',
		
		/**
		 * An array of datatable columns
		 */
		 
		fields: ['title', 'x', 'y', 'visible']
		
	});
	
	PhotoFrame.WindowControls = PhotoFrame.Class.extend({
		
		/**
		 * Is the window visible by default?
		 */	
		 
		visible: false,
		
		/**
		 * Get the window visibility
		 *
		 * @return  bool
		 */		
		 
		getVisibility: function() {
			var data = PhotoFrame.Model.WindowLocations.get({title: this.title});
			
			return data.length > 0 && data[0].visible ? data[0].visible : false;
		},
		
		/**
		 * Set the window visibility
		 *
		 * @return  void
		 */		
		 
		setVisibility: function(visible) {
			visible = visible ? true : false;
			
			PhotoFrame.Model.WindowLocations.update({title: this.title}, {
				visible: visible
			});	
			
			this.visible = visible;
		},
		
		/**
		 * Save the window position
		 *
		 * @return  void
		 */		
		 
		savePosition: function() {
			PhotoFrame.Model.WindowLocations.insertOrUpdate({title: this.title}, {
				visible: this.getVisibility(),
				title: this.title,
				y: this.ui.window.css('top'),
				x: this.ui.window.css('left')
			});	
		},
		
		/**
		 * Bring window to the front
		 *
		 * @return  void
		 */		
		 
		bringToFront: function() {
			this.factory.zIndexCount++;
			this.ui.window.css('z-index', this.factory.zIndexCount);
		},
		
		/**
		 * Does the window have a position?
		 *
		 * @return  bool
		 */		
		 
		hasPosition: function() {
			return this.getPosition() ? true : false;	
		},
		
		/**
		 * Get the window position
		 *
		 * @return  object
		 */		
		 
		getPosition: function() {
			var pos = PhotoFrame.Model.WindowLocations.get({title: this.title});
			
			if(pos.length == 0) {
				return false;
			}
			
			return pos[0];
		},
		
		/**
		 * Restore the window position
		 *
		 * @return  void
		 */		
		 
		restorePosition: function() {
			var position = this.getPosition();
			
			this.setPosition(position.x, position.y);
		},
		
		/**
		 * Set the window position
		 *
		 * @return  void
		 */		
		 
		setPosition: function(x, y) {
			this.ui.window.css('left', x).css('top', y);
		}
		
	});

	PhotoFrame.Window.implement(PhotoFrame.WindowControls);
	PhotoFrame.ButtonBar.implement(PhotoFrame.WindowControls);
		
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

/**
 * Capitalize the first letter in a string
 *
 * @return string
 */
 
String.prototype.ucfirst = function() {
	return this.substr(0, 1).toUpperCase() + this.substr(1);
};