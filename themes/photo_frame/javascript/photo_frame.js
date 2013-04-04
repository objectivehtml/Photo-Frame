var PhotoFrame;

(function($) {
	PhotoFrame = function(obj, options) {
		
		var t          = this;
		
		t.options      = options;
		t.settings     = options.settings;
		t.$wrapper     = $(obj);
		t.response     = {};
		t.jcrop        = {};
		t.photos       = options.photos;
		t.edit         = false;
		t.edit_id	   = 0;
		t.isNewPhoto   = true;
		t.directory    = t.options.directory;
		t.index        = PhotoFrame.instances.length;
		t.messageWidth = 500; 
		t.instructions = t.options.instructions;
		t.disable      = false;
		t.size 		   = t.options.size;
		t.released	   = false;
		t.initialized  = false;
		t.scale        = 1;
		t.rotate	   = 0;
		t.resize 	   = options.resize ? options.resize: false;
		t.resizeMax    = options.resizeMax ? options.resizeMax: false;
		t.title		   = options.title ? options.title : '';
		t.description  = options.description ? options.description : '';
		t.keywords     = options.keywords ? options.keywords : '';
		t.compression  = options.compression;
		
		t.ui   = {
			body: $('body'),
			upload: t.$wrapper.find('.photo-frame-upload'),
			form: $('#photo-frame-upload'),
			dimmer: $('.photo-frame-dimmer'),
			activity: $('.photo-frame-activity'),
			preview: t.$wrapper.find('.photo-frame-preview'),
			del: t.$wrapper.find('.photo-frame-delete'),
			edit: t.$wrapper.find('.photo-frame-edit'),
			helper: t.$wrapper.find('.photo-frame-helper')
		};
		
		t.IE = function() {
			return t.$wrapper.children().hasClass('photo-frame-ie');
		}
		
		t.save = function(data) {
			
			var date = new Date();
			var index = t.edit === false ? t.photos.length : t.edit;
		
		    data.title = t.title;
		    data.description = t.description;
		    data.keywords = t.keywords;
		    
			if(t.edit === false) {
				var html = $([
				    '<li>',
	    				'<div class="photo-frame-photo" id="photo-frame-photo-'+t.options.fieldId+'-'+index+'">',
	    					//'<img src="'+data.file+'?_='+date.getTime()+'" alt="'+data.file_name+'" />',				
	    					'<div class="photo-frame-action-bar">',
	    						'<a href="#'+index+'" class="photo-frame-edit" data-new-entry="true"><span class="icon-edit"></span></a>',
	    						'<a href="#'+index+'" class="photo-frame-delete" data-new-entry="true"><span class="icon-trash"></span></a>',
	    					'</div>',
	    					'<textarea name="'+t.options.fieldName+'[][new]" id="photo-frame-new-photo-'+t.options.fieldId+'-'+index+'" style="display:none">'+data.save_data+'</textarea>',
	    				'</div>',
					'</li>'
				].join(''));
				
				window.loadImage(
			        data.file,
			        function (img) {
				     	$(html).find('.photo-frame-photo').prepend(img);
			    
						t.ui.preview.find('ul').append(html);
						t.photos.push(data); 
						 
						if(t.options.maxPhotos > 0 && (t.options.maxPhotos <= t.getTotalPhotos())) {
							t.hideUpload();
						}	
											
						t.ui.saving.remove();
						t.ui.dimmer.hide();
			        }
			    );
			}
			else {
				
				var obj = $('#photo-frame-photo-'+t.options.fieldId+'-'+t.edit);
				
				if(obj.find('a').attr('data-new-entry')) {
					t.$wrapper.find('#photo-frame-new-photo-'+t.options.fieldId+'-'+t.edit+'').html(data.save_data);
				}
				else {	
					data.id = t.edit_id;
					
					t.$wrapper.find('#photo-frame-edit-photo-'+t.edit_id+'-'+index).html(data.save_data);
				}
				
				window.loadImage(
			        data.file,
			        function (img) {
				        t.$wrapper.find('#photo-frame-photo-'+t.options.fieldId+'-'+t.edit+' img').attr('src', img.src+'?date='+(new Date().getTime()));
				        t.edit = false;
							
						if(t.options.maxPhotos > 0 && (t.options.maxPhotos <= t.getTotalPhotos())) {
							t.hideUpload();
						}
						
						t.ui.saving.remove();
						t.ui.dimmer.hide();					
			        }
			    );
			    
				t.photos[t.edit] = data;
			}
		};
		
		t.startUpload = function(callback) {
			if(t.IE()) {
				t.ui.form.hide();
			}
			
			t.ui.activity.show();
			t.ui.errors.hide();
			t.ui.crop.hide();
			
			t.ui.dimmer.fadeIn(function() {
				if(typeof callback == "function") {
					callback();	
				}
			});
		};
		
		t.stopUpload = function(data, image, callback) {
			
			if(typeof image == "function") {
				callback = image;
				image = false;
			}
			
			if(!image) {
				image = data.file_url;
			}
			
			t.ui.dimmer.show();
			t.ui.errors.hide();
			t.ui.image.hide();
			t.ui.crop.show();
			
			t.resetMeta();
			
			if(t.jcrop.destroy) {
				t.jcrop.destroy();	
			}
			
			t.ui.window = $(window);
					
			window.loadImage(
		        image,
		        function (img) {
			        t.ui.activity.hide();
		        	t.ui.image.remove();
		        	
		        	if(t.instructions && t.edit === false) {
		        		t.ui.instructions = $('<div class="photo-frame-instructions" />').html(t.instructions);
		        		
		        		t.ui.dimmer.append(t.ui.instructions);
		        		if(typeof t.options.size == "string") {
			        		//t.ui.instructions.hide();
		        		}
		        		
		        	}
		        	else {
			        	t.ui.instructions = false;
		        	}
		        	
		        	t.ui.image = $('<div class="photo-frame-image"></div>');
			        t.ui.crop.prepend(t.ui.image);   	
		            t.ui.image.html(img).show();	        	
		            t.ui.crop.center();
		            t.hideMeta();
		            
		            t.settings.onChange = function() {
			          	t.updateInfo();
		            };
		            
		            if(t.ui.instructions && t.ui.instructions.css('display') != 'none') {
			            t.settings.onChange = function() {
			          		t.updateInfo();
				            if(t.initialized) {
				            	t.ui.instructions.fadeOut();
				            }
			            }
		            }
		            
		            if(t.edit === false && t.size != 'false') {
		            	var size = t.size.split('x');
		            	
		            	size[0] = parseInt(size[0]);
		            	size[1] = parseInt(size[1]);
		            	
		           		var x  = (t.ui.image.width()  / 2) - (size[0] / 2);
		           		var x2 = x + size[0];
		           		var y  = (t.ui.image.height() / 2) - (size[1] / 2);
		           		var y2 = y + size[1];
		           		
		           		t.settings.setSelect = [x, y, x2, y2];
		            }
		            
		            t.settings.onRelease = function() {
			            t.released = true;
		            };
		            
		            t.settings.onSelect = function() {
			            t.released = false;
		            }
		            
	            	var photo = t.photos[t.edit];
	            	
	            	if(photo) {
		            	if(photo.title) {
			        		t.ui.meta.find('input[name="title"]').val(photo.title);
			        	}
			        	
			        	if(photo.keywords) {
			        		t.ui.meta.find('input[name="keywords"]').val(photo.keywords);
			        	}
			        	
			        	if(photo.description) {
			        		t.ui.meta.find('textarea').val(photo.description);
			        	}
		        	}
	            	
		            t.initJcrop(callback);				
		        }
		    );
		};
		
		t.initJcrop = function(callback) {
			t.setScale();
	        
			t.ui.toolbar.show();
	        t.ui.image.Jcrop(t.settings, function() {
	        	t.jcrop = this;
	        	t.updateInfo();
	            if(typeof callback == "function") {
		            callback();
	            }
	        });
	        
			t.initialized = true;
		}
		
		t.closeMessages = function(animation) {
		
			if(!animation) {
				animation = 300;
			}
			
			$('.photo-frame-message').each(function() {
				$(this).animate({right: -t.messageWidth}, animation);
			});
		}
		
		t.getTotalPhotos = function() {
			return t.$wrapper.find('.photo-frame-photo').length;
		}
		
		t.cropImage = function(image, size) {
			
			var response = t.response;
			var errors   = t.validate();
			
			if(errors.length > 0) {
				t.notify(errors);
			}
			else {
				t.closeMessages();
				
				t.ui.saving = $('<div class="photo-frame-saving"><span></span> Saving...</div>');
				t.ui.dimmer.append(t.ui.saving);			
				t.ui.dimmer.find('.photo-frame-saving span').activity();			
				t.ui.crop.fadeOut();
				
				if(t.ui.info) {
					t.ui.info.fadeOut();
				}
				
				t.hideMeta();
				t.ui.saving.center();
				
				t.title       = t.ui.meta.find('input[name="title"]').val();
				t.description = t.ui.meta.find('textarea').val();
				t.keywords    = t.ui.meta.find('input[name="keywords"]').val();
				
				$.get(t.options.cropUrl, {
					id: t.directory.id,
					photo_id: t.edit_id,
					image: image,
					name: t.response.file_name,
					directory: t.directory.server_path,
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
				}, function(data) {
					t.save(data);
				});
			}
		};
		
		t.isCropped = function(cropSize) {
		
			if(!cropSize && t.jcrop.tellSelect) {
				var cropSize = t.jcrop.tellSelect();
			}
			
			if(t.ui.dimmer.find('.jcrop-tracker').width() == 0) {
				return false;
			}
			
			return typeof cropSize == "undefined" || cropSize.x || cropSize.y || cropSize.x2 || cropSize.y2 ? true : false;	
		}
		
		t.cropDimensions = function(cropSize) {
			var defaultCropSize = {
				w: 0,
				h: 0,
				x: 0,
				x2: 0,
				y: 0,
				y2: 0
			}
				
			if(!cropSize && t.jcrop.tellSelect) {
				var cropSize = t.jcrop.tellSelect();
			}
			else {
				var cropSize = defaultCropSize;
			}
			
			var image = {
				w: t.ui.image.find('img').width(),
				h: t.ui.image.find('img').height()
			};
			
			cropSize.w = cropSize.w == 0 ? image.w : cropSize.w;
			cropSize.h = cropSize.h == 0 ? image.h : cropSize.h;
			
			if(!t.settings.aspectRatio) {
				var aspect = t.reduce(Math.ceil(cropSize.w), Math.ceil(cropSize.h));
			}
			else {
				var aspect = t.settings.aspectRatioString.split(':');
				
				if(typeof aspect[0] == "undefined") {
					aspect[0] = 0;
				}	
				
				if(typeof aspect[1] == "undefined") {
					aspect[1] = 0;
				}	
				
				if(!t.isCropped()) {
					aspect = [cropSize.w, cropSize.h];	
				}
				
				aspect = t.reduce(aspect[0], aspect[1]);
			}
			
			if(!t.isCropped()) {
				cropSize   = defaultCropSize;
				cropSize.w = image.w;
				cropSize.h = image.h;
				
				aspect = t.reduce(image.w, image.h);
			};
			
			cropSize.a = aspect;		
			
			return cropSize;
		}
		
		t.aspectRatio = function(d) {
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
		}
		
		t.round = function(number, place) {
			if(!place) {
				var place = 100;
			}
			
			return Math.round(number * place) / place;
		}
		
		t.validate = function(json) {
			
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
			var imgWidth    = Math.ceil(t.ui.image.find('img').width());
			var imgHeight   = Math.ceil(t.ui.image.find('img').height());
			
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
		
		t.autoScale = function() {
			var window = t.ui.window;
			var img    = t.ui.image.find('img');
			var scale  = 1;
				
			window = {
				w: window.width(),
				h: window.height()
			};
			
			img = {
				w: img.width(),
				h: img.height()
			};
			
			if(img.w < img.h) {
				if(img.w > window.w) {
					scale = window.w / img.w;		
				}
			}
			else {
				if(img.h > window.h) {
					scale = window.h / img.h;
				}
			}
			
			if(scale != 1) {
				t.ui.image.find('img').css({
					width: img.w * scale,
					height: img.h * scale,
				});
				
				if(t.jcrop.destroy) {
					t.jcrop.destroy();
				}
			}
			
			t.scale = scale;
			
			return scale;
		}
		
		t.setScale = function(scale) {
			if(scale) {
				t.scale = scale;
			}	
				
			if(t.scale != 1) {
		        var img = t.ui.image.find('img');
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
		}
		
		t.getScale = function() {
			return t.scale;
		}
		
		t.notify = function(notifications, delay, animation) {
			
			var $panel   = $('.photo-frame-panel');
			var messages = [];
				
			if(!delay) {
				delay = 190;	
			}
			
			if(!animation) {
				animation = 300;
			}
			
			function show() {
				var html = $('<div class="photo-frame-panel" />');
				
				$.each(notifications, function(i, message) {
					message = $([
						'<div class="photo-frame-message">',
							'<p><span class="icon-warning-sign"></span>'+message+'</p>',
							'<a href="#" class="photo-frame-close"><span class="icon-cancel"></span></a>',
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
							$(message).animate({right: -t.messageWidth}, animation);
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
		}
		
		t.showError = function(error) {
			t.ui.errors.find('ul').append('<li>'+error+'</li>');
			t.ui.errors.center();
		};
		
		t.showErrors = function(errors) {
			t.ui.errors.find('ul').html('');
			t.ui.errors.show();
			t.ui.activity.hide();
			t.ui.crop.hide();
			
			$.each(errors, function(i, error) {
				t.showError(error);
			});
		};
	
		t.callback = function(data) {
			t.response = data;
			
			t.ui.toolbar.hide();
			
			if(t.response.success) {
				t.$wrapper.append('<textarea name="'+t.options.fieldName+'[][uploaded]" style="display:none">{"field_id": "'+t.options.fieldId+'", "col_id": "'+t.options.colId+'", "row_id": "'+t.options.rowId+'", "path": "'+t.response.file_path+'", "original_path": "'+t.response.original_path+'", "file": "'+t.response.file_name+'"}</textarea>');
				
				t.stopUpload(t.response);
			}
			else {
				t.showErrors(t.response.errors);	
			}
		}
		
		t.init = function(settings) {
			
			t.$wrapper.bind('dragover', function(e) {
				
				var obj 	= t.$wrapper.find('.photo-frame-drop-text');
				var parent  = obj.parent();
				
				obj.position({
					of: parent,
					my: 'center',
					at: 'center'
				});
				
				t.$wrapper.addClass('photo-frame-dragging');
												
				e.preventDefault();
			});
			
			t.$wrapper.bind('drop dragleave', function(e) {
				
				t.$wrapper.removeClass('photo-frame-dragging');
				
				e.preventDefault();
			});
			
			var html = [
				'<form id="photo-frame-upload" class="photo-frame-form photo-frame-wrapper" action="'+t.options.url+(t.IE() ? '&ie=true' : '')+'" method="POST" enctype="multipart/form-data" id="photo-frame-upload-'+t.index+'" '+(t.IE() ? 'target="photo-frame-iframe-'+t.index+'"' : '')+'>',
					'<h3>Select a file to upload...</h3>',
					'<input type="file" name="files">',
					'<button type="submit" class="photo-frame-button"><span class="icon-upload"></span>'+t.options.buttonText+'</button>',
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
				'<div class="photo-frame-dimmer" id="photo-frame-dimmer-"'+t.options.index+'">',
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
					'<div class="photo-frame-errors">',
						'<h3>Errors</h3>',
						'<ul></ul>',
						'<a class="photo-frame-button photo-frame-cancel"><span class="icon-cancel"></span> Close</a>',
					'</div>',
					'<div class="photo-frame-crop">',
						'<div class="photo-frame-image"></div>',
						'<div class="photo-frame-meta">',
							'<a href="#" class="photo-frame-close-meta photo-frame-float-right"><span class="icon-cancel"></span></a>',
							'<h3>Photo Details</h3>',
							'<ul>',
								'<li>',
									'<label for="title">Title</label>',
									'<input type="text" name="title" value="'+t.description+'" id="title" />',
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
		
			if(t.options.infoPanel) {
				t.ui.info = t.ui.dimmer.find('.photo-frame-info-panel');
				t.ui.info.draggable();
				t.ui.info.find('.photo-frame-close').click(function(e) {			
					t.ui.info.fadeOut();
					e.preventDefault();
				});
			}
					
			t.ui.activity = t.ui.dimmer.find('.photo-frame-activity');
			t.ui.activity.find('.photo-frame-indicator').activity({color: '#fff'});
			
			t.ui.save       = t.ui.dimmer.find('.photo-frame-save');
			t.ui.cancel     = t.ui.dimmer.find('.photo-frame-cancel');
			t.ui.errors     = t.ui.dimmer.find('.photo-frame-errors');
			t.ui.crop       = t.ui.dimmer.find('.photo-frame-crop');
			t.ui.image      = t.ui.dimmer.find('.photo-frame-image');
			t.ui.meta       = t.ui.dimmer.find('.photo-frame-meta');
			t.ui.metaToggle = t.ui.dimmer.find('.photo-frame-meta-toggle');
			t.ui.metaClose  = t.ui.dimmer.find('.photo-frame-close-meta');
			
			if(!t.IE()) {
				t.ui.form.fileupload({
					//url: '/live/home/index',
					dropZone: t.$wrapper.find('.photo-frame-drop-zone'),
					url: t.options.url,
					add: function (e, data) {
						t.initialized = false;
						t.startUpload(function() {			
							data.submit();
						});
					},
					done: function (e, data) {
						t.callback(data.result);
					}
		    	});
	    	}
	    	else {
		    	t.ui.iframe = $('<iframe name="photo-frame-iframe-'+t.index+'" id="photo-frame-iframe-'+t.index+'" src="#" style="display:none;width:0;height:0"></iframe>');
		    	t.ui.body.append(t.ui.iframe);
	    	}
	    	 	
	    	t.ui.metaToggle.click(function(e) {
		    	t.toggleMeta();	    		    	
		    	e.preventDefault();
	    	});
	    	
	    	t.ui.metaClose.click(function(e) {
	    		t.hideMeta();
		    	e.preventDefault();
	    	});
	    	
	    	t.ui.save.click(function() {
	    		if(t.options.showMeta && t.ui.meta.css('display') == 'none') {
	    			var errors = t.validate();
	    		
	    			if(errors.length == 0) {
			    		t.showMeta();
			    	}
			    	else {
				    	t.notify(errors);
			    	}
		    	}
		    	else {
		    		var _default = {
		    			x: 0,
		    			y: 0,
		    			x2: 0,
		    			y2: 0,
		    			w: 0,
		    			h: 0
		    		};
		    		
		    		var size = t.released ? _default : t.jcrop.tellScaled();
		    		
		    		t.hideMeta();
			    	t.cropImage(t.response.file_path, size);
		    	}
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
					
					//t.ui.image.hide();
					t.ui.form.show().center();
				}
				
				t.resetMeta();			
				e.preventDefault();
			});
			
			t.ui.cancel.click(function(e) {			
				t.closeMessages();			
				t.ui.dimmer.fadeOut('fast');	
				t.hideMeta();	
				e.preventDefault();
			});
			
			$(window).resize(function() {
				//t.autoScale();
				
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
			
			t.ui.edit.live('click', function(e) {
				var $t = $(this)
				var id = $t.attr('href').replace('#', '');
				
				var photo = t.photos[id];
				
				t.response    = photo;
				t.edit        = id;
				t.edit_id	  = photo.id;
				t.edit_index  = id;
				t.isNewPhoto  = false;
			
				if($t.attr('data-new-entry') == 'true') {
					t.isNewPhoto = true;
				}
				
				t.stopUpload(photo, photo.original_url, function() {
					if(photo.x != '0' || photo.y != '0' || photo.x2 != '0' || photo.y2 != '0') {
						t.jcrop.setSelect([photo.x, photo.y, photo.x2, photo.y2]);
					}
				});
					
				e.preventDefault();
			});
				
			t.ui.del.live('click', function(e) {
				
				var $t = $(this);
				var id = $t.attr('href').replace('#', '');
					
				$t.parents('.photo-frame-photo').parent('li').remove();
					
				if($t.attr('data-new-entry') != 'true') {
					t.$wrapper.append('<input type="hidden" name="photo_frame_delete_photos['+t.options.fieldId+'][]" value="'+id+'" />');
				}
				
				$(this).parents('.photo-frame-photo').fadeOut(function() {
					$(this).remove();
					
					if((t.options.maxPhotos > 0 && t.options.maxPhotos > t.getTotalPhotos()) || (t.options.minPhotos == 0 && t.options.maxPhotos == 0)) {
						t.showUpload();
					}
					else {
						t.hideUpload();
					}									
				});
				
				e.preventDefault();
			});
	
			$(window).keyup(function(e) {
				if (e.keyCode == 27) { 
					t.ui.cancel.click();
				} 
			});
				
			t.sortable();
		};
		
		t.sortable = function() {    	
			if(t.options.sortable) {
			    t.$wrapper.find('.photo-frame-sortable').sortable({
	                placeholder: "photo-frame-sortable-placeholder"
	            });
	            
	            t.$wrapper.find('.photo-frame-sortable').disableSelection();
			}
		}
		
		t.showUpload = function() {
			t.ui.upload.show();
			t.ui.helper.show();	
		}
		
		t.hideUpload = function() {
			t.ui.upload.hide();
			t.ui.helper.hide();	
		}
		
		t.showCrop = function() {
			t.ui.crop.fadeIn('fast');	
		}
		
		t.hideCrop = function() {
			t.ui.crop.fadeOut('fast');	
		}
		
		t.showImage = function() {
			t.ui.image.parent().fadeIn('fast');	
		}
		
		t.hideImage = function() {
			t.ui.image.parent().fadeOut('fast');	
		}
		
		t.resetMeta = function() {
			t.ui.meta.find('input[name="title"]').val('');
	    	t.ui.meta.find('input[name="keywords"]').val('');
	    	t.ui.meta.find('textarea').val('');  
		}
		
		t.showMeta = function() {
			t.ui.metaToggle.addClass('active');	
			t.ui.meta.fadeIn('fast');
			t.ui.meta.center();
		}
		
		t.hideMeta = function() {	
			t.ui.metaToggle.removeClass('active');	
			t.ui.meta.fadeOut('fast');
		}
		
		t.toggleMeta = function(image) {
			if(t.ui.meta.css('display') == 'none') {
				t.showMeta();
				
				if(image) {
					t.hideImage();
				}
			}
			else {
				t.hideMeta();
				
				if(image) {
					t.showImage();
				}
			}
		}
		
		t.reduce = function(numerator,denominator){
			var gcd = function gcd (a, b) {
	            return (b == 0) ? a : gcd (b, a%b);
	        }
			
			gcd = gcd(numerator,denominator);
			
			return [numerator/gcd, denominator/gcd];
		};
			
		t.updateInfo = function() {
			if(t.ui.info) {		
				var crop = t.cropDimensions();		
				var aspect = crop.a;
				
				t.ui.info.fadeIn();
				t.ui.info.find('.size .width').html(Math.ceil(crop.w)+'px');
				t.ui.info.find('.size .height').html(Math.ceil(crop.h)+'px');
				t.ui.info.find('.aspect').html('('+aspect[0]+':'+aspect[1]+')');
				t.ui.info.find('.x').html(Math.ceil(crop.x)+'px');
				t.ui.info.find('.x2').html(Math.ceil(crop.x2)+'px');
				t.ui.info.find('.y').html(Math.ceil(crop.y)+'px');
				t.ui.info.find('.y2').html(Math.ceil(crop.y2)+'px');
				
				var errors = t.validate(true);
				
				t.ui.info.find('.width').removeClass('photo-frame-invalid');
				t.ui.info.find('.height').removeClass('photo-frame-invalid');
				t.ui.info.find('.aspect').removeClass('photo-frame-invalid');
				
				if(!errors.validWidth) {
					t.ui.info.find('.width').addClass('photo-frame-invalid');
				}
				
				if(!errors.validHeight) {
					t.ui.info.find('.height').addClass('photo-frame-invalid');
				}
				
				if(!errors.validRatio) {
					t.ui.info.find('.aspect').addClass('photo-frame-invalid');
				}
			}
		}
		
		t.init(t.settings, t.photos);
				
		PhotoFrame.instances.push(t);
		
		return t;
	}
	
		
}(jQuery));

PhotoFrame.instances = [];
PhotoFrame.matrix = [];

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
