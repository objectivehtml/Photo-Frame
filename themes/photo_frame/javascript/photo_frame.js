jQuery.fn.center = function () {
    var w = $(window);
    this.css("position","fixed");
    
    this.css("top",w.outerHeight()/2-this.height()/2 + "px");
    this.css("left",w.outerWidth()/2-this.width()/2  + "px");
    return this;
}

var PhotoFrame = function(options) {
	
	var t          = this;
	t.settings     = options.settings;
	t.$wrapper     = $(options.wrapper);
	t.response     = {};
	t.jcrop        = {};
	t.photos       = options.photos;
	t.edit         = false;
	t.isNewPhoto   = false;
	t.directory    = options.directory;
	t.index        = PhotoFrameGlobal.instance.length;
	t.messageWidth = 500; 
	
	t.ui   = {
		body: $('body'),
		upload: t.$wrapper.find('.photo-frame-upload'),
		form: $('#photo-frame-upload'),
		dimmer: $('.photo-frame-dimmer'),
		activity: $('.photo-frame-activity'),
		preview: t.$wrapper.find('.photo-frame-preview'),
		delete: t.$wrapper.find('.photo-frame-delete'),
		edit: t.$wrapper.find('.photo-frame-edit')
	};
	
	t.save = function(data) {
		
		var index = t.edit === false ? t.photos.length : t.edit;
		
		if(!t.edit) {
			var html = [
				'<div class="photo-frame-photo" id="photo-frame-photo-'+options.fieldId+'-'+index+'">',
					'<img src="'+data.file+'" alt="'+data.file_name+'" />',				
					'<div class="photo-frame-action-bar">',
						'<a href="#'+index+'" class="photo-frame-edit" data-new-entry="true"><span class="icon-edit"></span></a>',
						'<a href="#'+index+'" class="photo-frame-delete" data-new-entry="true"><span class="icon-trash"></span></a>',
					'</div>',
				'</div>'
			].join('');
			
			t.$wrapper.append('<textarea type="hidden" name="photo_frame_new_photos['+options.fieldId+']['+index+']" id="photo-frame-new-photo-'+options.fieldId+'-'+index+'" style="display:none">'+data.save_data+'</textarea>');
			t.ui.preview.append(html);
			t.photos.push(data);
		}
		else {
			
			var obj = $('#photo-frame-photo-'+options.fieldId+'-'+t.edit);
			
			if(obj.attr('data-new-entry')) {
				t.$wrapper.find('#photo-frame-new-photo-'+options.fieldId+'-'+t.edit+'').html(data.save_data);
			}
			
			t.$wrapper.find('#photo-frame-update-photo-'+options.fieldId+'-'+index).remove();
			
			t.$wrapper.append('<textarea type="hidden" name="photo_frame_update_photo['+options.fieldId+']['+t.edit_id+']" id="photo-frame-update-photo-'+index+'" style="display:none">'+data.save_data+'</textarea>');
			
			window.loadImage(
		        data.file,
		        function (img) {
			        t.$wrapper.find('#photo-frame-photo-'+options.fieldId+'-'+t.edit+' img').attr('src', img.src+'?date='+(new Date().getTime()));
			        t.edit = false;
		        }
		    );
		    
			t.photos[t.edit] = data;
		}
		
		t.ui.dimmer.hide();
	};
	
	t.startUpload = function(callback) {
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
			image = data.file_url
		}
		
		t.ui.dimmer.show();
		t.ui.activity.hide();
		t.ui.errors.hide();
		t.ui.image.hide();
		t.ui.crop.show();
		
		if(t.jcrop.destroy) {
			t.jcrop.destroy();	
		}
		
		window.loadImage(
	        image,
	        function (img) {
	        	t.ui.image.remove();
	        	
	        	t.ui.image = $('<div class="photo-frame-image"></div>');
		        t.ui.crop.prepend(t.ui.image);
	        		        	
	            t.ui.image.html(img).show();	        	
	            t.ui.crop.center();
	            
	            t.settings.onChange = function() {
		          	t.updateInfo();
	            };
	            
	            t.ui.image.Jcrop(t.settings, function() {
	            	t.jcrop = this;
	            	t.updateInfo();
		            if(typeof callback == "function") {
			            callback();
		            }
	            });
	        }
	    );
	};
	
	t.closeMessages = function(animation) {
	
		if(!animation) {
			animation = 300;
		}
		
		$('.photo-frame-message').each(function() {
			$(this).animate({right: -t.messageWidth}, animation);
		});
	}
	
	t.cropImage = function(image, size) {
		
		var response = t.response;
		var errors   = t.validate();
		
		if(errors.length > 0) {
			t.notify(errors);
		}
		else {
			t.closeMessages();
			
			$.get(options.cropUrl, {
				id: t.directory.id,
				image: image,
				name: t.response.file_name,
				directory: t.directory.server_path,
				original: t.response.original_path,
				url: t.response.file_url,
				edit: t.edit !== false ? true : false,
				height: size.h,
				width: size.w,
				x: size.x,
				x2: size.x2,
				y: size.y,
				y2: size.y2
			}, function(data) {
				t.save(data);
			});
		}
	};
	
	t.isCropped = function(cropSize) {
	
		if(!cropSize) {
			var cropSize    = t.jcrop.tellSelect();
		}
		
		return cropSize.x || cropSize.y || cropSize.x2 || cropSize.y2 ? true : false;	
	}
	
	t.cropDimensions = function(cropSize) {
	
		if(!cropSize) {
			var cropSize    = t.jcrop.tellSelect();
		}
		
		cropSize.w = cropSize.w == 0 ? t.ui.image.outerWidth()  : cropSize.w;
		cropSize.h = cropSize.h == 0 ? t.ui.image.outerHeight() : cropSize.h;
		
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
		
		cropSize.a = aspect;
		
		return cropSize;
	}
	
	t.validate = function() {
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
		
		var imgWidth    = Math.ceil(t.ui.image.outerWidth());
		var imgHeight   = Math.ceil(t.ui.image.outerHeight());
			
		if(minWidth > 0 && minWidth > width) {
			errors.push('The image must have a minimum width of '+minWidth+'px');
		}
		
		if(minHeight > 0 && minHeight > height) {
			errors.push('The image must have a minimum height of '+minHeight+'px');
		}
		
		if(maxWidth > 0 && maxWidth < width) {
			errors.push('The image must have a maximum width of '+maxWidth+'px');
		}
		
		if(maxHeight > 0 && maxHeight < height) {
			errors.push('The image must have a maximum height of '+maxHeight+'px');
		}
		
		if(!isCropped) {
			if(ratio != cropWidth / cropHeight) {
				errors.push('The image must have an apect ratio of '+t.settings.aspectRatioString);
			}
		}
		
		return errors;
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
						'<a href="#" class="photo-frame-close"><span class="icon-remove"></span></a>',
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

	t.init = function(settings, photos) {
		
		var html = [
			'<form id="photo-frame-upload" class="photo-frame-form" action="'+options.url+'" method="POST" enctype="multipart/form-data" id="photo-frame-upload-"'+options.index+'">',
				'<input type="file" name="files">',
			'</form>'
		].join('');
		
		t.ui.form = $(html);
		t.ui.body.append(t.ui.form);
	
		var html = [
			'<div class="photo-frame-dimmer" id="photo-frame-dimmer-"'+options.index+'">',
				'<div class="photo-frame-info-panel">',
					'<a href="#" class="photo-frame-close"><span class="icon-remove"></span></a>',
					'<p class="size">W: <span class="width"></span> H: <span class="height"></span> <span class="aspect"></span></p>',
					'<p class="coords">',
						'X: <span class="x"></span>',
						'Y: <span class="y"></span>',
						'X2: <span class="x2"></span>',
						'Y2: <span class="y2"></span>',
					'</p>',
					'<!-- <p class="aspect">',
						'Aspect Ratio: <span></span>',
					'</p> -->',
				'</div>',
				'<div class="photo-frame-activity">',
					'<span class="photo-frame-indicator"></span> <p>Uploading...</p>',
					'<a class="photo-frame-button photo-frame-cancel"><span class="icon-remove"></span> Cancel</a>',
				'</div>',
				'<div class="photo-frame-errors">',
					'<h3>Errors</h3>',
					'<ul></ul>',
					'<a class="photo-frame-button photo-frame-cancel"><span class="icon-remove"></span> Close</a>',
				'</div>',
				'<div class="photo-frame-crop">',
					'<div class="photo-frame-image"></div>',
					'<div class="photo-frame-toolbar">',
						'<a class="photo-frame-bar-button photo-frame-cancel photo-frame-float-left"><span class="icon-remove"></span> Cancel</a>',
						'<a class="photo-frame-bar-button photo-frame-save photo-frame-float-right"><span class="icon-check"></span> Save</a>',
					'</div>',
				'</div>',
			'</div>'
		].join('');
		
		t.ui.dimmer = $(html);
		t.ui.body.append(t.ui.dimmer);
	
		t.ui.activity = t.ui.dimmer.find('.photo-frame-activity');
		t.ui.activity.find('.photo-frame-indicator').activity({color: '#fff'});
		
		t.ui.save     = t.ui.dimmer.find('.photo-frame-save');
		t.ui.cancel   = t.ui.dimmer.find('.photo-frame-cancel');
		t.ui.errors   = t.ui.dimmer.find('.photo-frame-errors');
		t.ui.crop     = t.ui.dimmer.find('.photo-frame-crop');
		t.ui.image    = t.ui.dimmer.find('.photo-frame-image');
		t.ui.info     = t.ui.dimmer.find('.photo-frame-info-panel');
		
		t.ui.info.draggable();
		
		t.ui.form.fileupload({
			//url: '/live/home/index',
			url: options.url,
			add: function (e, data) {
				t.startUpload(function() {			
					data.submit();
				});
			},
			done: function (e, data) {
				t.response   = data.result;
			
				if(t.response.success) {
					t.stopUpload(t.response);
				}
				else {
					t.showErrors(t.response.errors);	
				}
			}
    	});
    	
    	t.ui.save.click(function() {
	    	t.cropImage(t.response.file_path, t.jcrop.tellScaled());
    	});
		
		t.ui.upload.click(function(e) {
			t.ui.form.find('input').click();			
			e.preventDefault();
		});
		
		t.ui.cancel.click(function(e) {			
			t.closeMessages();			
			t.ui.dimmer.fadeOut('fast');			
			e.preventDefault();
		});
		
		t.ui.info.find('.photo-frame-close').click(function(e) {			
			t.ui.info.fadeOut();
			e.preventDefault();
		});
		
		$(window).resize(function() {
			t.ui.crop.center();
			
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
			
		t.ui.delete.live('click', function(e) {
			
			var $t = $(this);
			var id = $t.attr('href').replace('#', '');
				
			if($t.attr('data-new-entry') != 'true') {
				t.$wrapper.append('<input type="hidden" name="photo_frame_delete_photos['+options.fieldId+'][]" value="'+id+'" />');
			}
			else {
				t.$wrapper.find('#photo-frame-new-photo-'+options.fieldId+'-'+id).remove();
			}
			
			$(this).parents('.photo-frame-photo').fadeOut(function() {
				$(this).remove();
			});
			
			e.preventDefault();
		});

		$(window).keyup(function(e) {
			if (e.keyCode == 27) { 
				t.ui.cancel.click();
			} 
		});
		
	};
	
	t.reduce = function(numerator,denominator){
		var gcd = function gcd(a,b){
			return b ? gcd(b, a%b) : a;
		};
		
		gcd = gcd(numerator,denominator);
		
		return [numerator/gcd, denominator/gcd];
	};
		
	t.updateInfo = function() {
	
		var crop = t.cropDimensions();		
		var aspect = crop.a;
		
		if(t.ui.info.css('display') == 'none') {
			t.ui.info.fadeIn();	
		}
		
		t.ui.info.find('.size .width').html(Math.ceil(crop.w)+'px');
		t.ui.info.find('.size .height').html(Math.ceil(crop.h)+'px');
		t.ui.info.find('.aspect').html('('+aspect[0]+':'+aspect[1]+')');
		t.ui.info.find('.x').html(Math.ceil(crop.x));
		t.ui.info.find('.x2').html(Math.ceil(crop.x2));
		t.ui.info.find('.y').html(Math.ceil(crop.y));
		t.ui.info.find('.y2').html(Math.ceil(crop.y2));
	}
	
	t.init(t.settings, t.photos);
	
	return t;
}