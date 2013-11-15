<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once PATH_THIRD.'photo_frame/libraries/ImageEditor.php';
		
class Photo_frame_lib {
	
	protected $id, $name, $dir, $url;
	
	public function __construct()
	{
		$this->EE =& get_instance();
		
		$this->EE->load->config('photo_frame_config');
		$this->EE->lang->loadfile('photo_frame');
		
		$this->EE->load->model('photo_frame_model');					
		$this->EE->load->helper('addon_helper');
	
		if(!isset($this->EE->theme_loader))
		{
			$this->EE->load->library('Theme_loader');
		}

		$this->EE->theme_loader->module_name = 'photo_frame';
		
		$this->id        = $this->EE->input->get_post('id', TRUE);
		$this->photo_id  = $this->EE->input->get_post('photo_id', TRUE);
		$this->name      = $this->EE->input->get_post('name', TRUE);
		$this->img       = $this->EE->input->get_post('image', TRUE);
		$this->dir       = $this->EE->input->get_post('directory', TRUE);
		$this->orig      = $this->EE->input->get_post('original', TRUE);
		$this->orig_file = $this->EE->input->get_post('original_file', TRUE);
		$this->orig_name = $this->EE->input->get_post('original_file_name', TRUE);
		$this->edit      = $this->EE->input->get_post('edit', TRUE) == 'true' ? TRUE : FALSE;
		$this->url       = $this->EE->input->get_post('url', TRUE);
	}
	
	public function assets_installed()
	{		
		return $this->EE->photo_frame_model->assets_installed();
	}
	
	public function color_bars($colors, $width = FALSE, $height = '14px')
	{
		$bars = array();
		
		if(!$width)
		{
			$width = 100 / count($colors) . '%';
		}
		
		foreach($colors as $index => $color)
		{
			$bars[] = '<div class="color color-'.$index.'" data-r="'.$color->r.'" data-g="'.$color->g.'" data-b="'.$color->b.'"  style="display:inline-block;background:rgb('.($color->r.','.$color->g.','.$color->b).');width:'.$width.';height:'.$height.'"></div>';
		}
		
		return $bars;
	}
	
	public function get_average_color($file, $num_colors = 10, $granularity = 5)
	{		
		$file = $this->EE->photo_frame_model->parse($file, 'server_path');
		
		return ImageEditor::init($file)->averageColor($num_colors, $granularity);
	}
	
	public function get_colors($file, $num_colors = 10, $granularity = 5)
	{
		$file = $this->EE->photo_frame_model->parse($file, 'server_path');
		
		$return = array();
		
		return ImageEditor::init($file)->getColorPalette($num_colors, $granularity);
	}
		
	public function build_size($settings, $index)
	{
		$size  = isset($settings['photo_frame_'.$index.'_width'])  ? (!empty($settings['photo_frame_'.$index.'_width']) ? $settings['photo_frame_'.$index.'_width'] : 0) : 0;
		$size .= 'x';
		$size .= isset($settings['photo_frame_'.$index.'_height']) ? (!empty($settings['photo_frame_'.$index.'_height']) ? $settings['photo_frame_'.$index.'_height'] : 0) : 0;
		$size  = rtrim($size, 'x');
		
		if(empty($size))
		{
			$size = FALSE;
		}
		
		return $size;
	}
	
	public function get_themes()
	{    
		$this->EE->load->library('photo_frame_themes');
		
		return $this->EE->photo_frame_themes->get();	
	}
	
	public function get_theme($index)
	{    
	    $themes = $this->get_themes();
	    
	    if(isset($themes[$index]))
	    {
    	    return $themes[$index];
	    }
	    
	    return FALSE;
	}
	
	public function response_action()
	{
		$this->EE->load->library('filemanager');
		$this->EE->load->config('photo_frame_config');
		
		$framed_dir_name = config_item('photo_frame_directory_name');
		
		$errors        = array();	
		$field_id      = $this->EE->input->get_post('fieldId', TRUE);
		$folder_id 	   = $this->EE->input->get_post('folderId', TRUE);
		$var_id        = $this->EE->input->get_post('varId', TRUE) != 'false' ? $this->EE->input->get_post('varId', TRUE) : FALSE;
		$site_id       = $this->EE->input->get_post('siteId', TRUE);
		$grid_id       = $this->EE->input->get_post('gridId', TRUE) != 'false' ? $this->EE->input->get_post('gridId', TRUE) : FALSE;
		$col_id        = $this->EE->input->get_post('colId', TRUE);
		$col_id		   = $col_id != 'false' ? preg_replace('/^col_id_/', '', $col_id) : FALSE;
		$original_url  = $this->EE->input->get_post('url', TRUE);	
		$original_path = $this->EE->input->get_post('file', TRUE);
		$asset_id      = $this->EE->input->get_post('assetId', TRUE);
		
		// Hack: 07/11/13 - EE 2.5.5 - Photo Frame 1.0.2.5 (1.1 beta)
		// Site id in an AJAX request is always 1 if using MSM.
		// So the solution is to pass the original site id
		// through the AJAX request and set it again here. LAME!!

		$this->EE->config->set_item('site_id', ($site_id ? $site_id : 1));

		// END HACK

		$file_name 	   = $this->EE->photo_frame_lib->filename($original_path);		
		$settings 	   = $this->EE->photo_frame_model->get_settings($field_id, $col_id, $var_id, $grid_id);
	
		$dir_id        = $settings['photo_frame_upload_group'];	
		$directory     = $this->EE->photo_frame_model->get_directory($dir_id);		

		$framed_dir    = $directory['server_path'] . $framed_dir_name . '/';	
		$file_url      = $directory['url'] . $framed_dir_name . '/' . $file_name;
		$file_path     = $directory['server_path'] . $framed_dir_name . '/' . $file_name;
		$original_path = $directory['server_path'] . $file_name;
		
		if($asset_id != "false")
		{
			$original_path = $this->replace_asset_subdir($asset_id, $original_path);
		}
		
		$exif_data = array();
		
		/*
		if($folder_id)
		{
			$id = $this->EE->input->get_post('assetId');
			//$original_path = $this->EE->input->get_post('file');
			
			$file = $this->EE->assets_lib->get_file_by_id($id);
			
			if($file->folder_row()->source_type != 'ee')
			{
				$path = $file->get_local_copy();
				$filename = str_replace('.tmp', '.'.$file->extension(), basename($path));
				
				//rename($path, str_replace(basename($path), $filename, $path));
				//copy()
			}
		}
		*/
		
		if( function_exists('exif_read_data') && 
			($this->extension($original_path) == 'jpg' || $this->extension($original_url) == 'jpeg') &&
			file_exists($original_path))
		{	
			$exif_data = @exif_read_data($original_path);
		}
				
		$response = $this->create_directory($directory);
		$errors   = array_merge($errors, $response->errors);
		
		if($response->exists)
		{
			if(file_exists($original_path))
			{
				copy($original_path, $framed_dir.$file_name);
			}
			else
			{
				$errors[] = $this->EE->photo_frame_lib->parse(array(
					'file' => $original_path
				), lang('photo_frame_upload_file_not_exists'));
			}
		}
		else
		{
			$errors[] = $this->EE->photo_frame_lib->parse(array(
				'directory' => $directory['server_path']
			), lang('photo_frame_upload_dir_not_exists'));
		}
		
		if(!$original_path)
		{
			$original_path = $directory['server_path'] . '/' . $file_name;
		}
		
		if(!$original_url)
		{
			$original_url  = $directory['url'] . '/' . $file_name;
		}
		
		/*
		var_dump(array(
			'success'            => count($errors) == 0 ? TRUE : FALSE,
			'directory'          => $directory,
			'file_name'          => isset($file_name) ? $file_name : NULL,
			'file_url'           => isset($file_url)  ? $file_url  : NULL,
			'file_path'          => isset($file_path) ? $file_path : NULL,
			'original_file'      => '{filedir_'.$dir_id.'}'.$file_name,
			'original_file_name' => $file_name,
			'original_url'       => $original_url,
			'original_path'      => $original_path,
			'errors'             => $errors,
			'exif_data'			 => $exif_data,
			'exif_string'		 => json_encode($exif_data),
			'asset_id'			 => $asset_id
		));exit();
		*/
		
		return $this->json(array(
			'success'            => count($errors) == 0 ? TRUE : FALSE,
			'directory'          => $directory,
			'file_name'          => isset($file_name) ? $file_name : NULL,
			'file_url'           => isset($file_url)  ? $file_url  : NULL,
			'file_path'          => isset($file_path) ? $file_path : NULL,
			'original_file'      => '{filedir_'.$dir_id.'}'.$file_name,
			'original_file_name' => $file_name,
			'original_url'       => $original_url,
			'original_path'      => $original_path,
			'errors'             => $errors,
			'exif_data'			 => $exif_data,
			'exif_string'		 => json_encode($exif_data),
			'asset_id'			 => $asset_id
		));
	}
	
	public function rgb2hex($rgb)
	{
		$hex = "#";
		$hex .= str_pad(dechex($rgb[0]), 2, "0", STR_PAD_LEFT);
		$hex .= str_pad(dechex($rgb[1]), 2, "0", STR_PAD_LEFT);
		$hex .= str_pad(dechex($rgb[2]), 2, "0", STR_PAD_LEFT);
	
		return $hex; // returns the hex value including the number sign (#)
	}
	
	public function resize_maximum_size($path, $settings)
	{
		if(is_object($path))
		{
			$image = $path;
		}
		else
		{
			$image  = new ImageEditor($path);
		}
		
		$width  = $image->getWidth();
		$height = $image->getHeight(); 
		
		$gcd    = $width > $height ? 'width' : 'height';
		$errors = array();
		$resize = FALSE;

		$resizeFixedWidth  = isset($settings['photo_frame_resize_fixed_width']) &&
						   !empty($settings['photo_frame_resize_fixed_width']) ? 
						   (int) $settings['photo_frame_resize_fixed_width'] : FALSE;
						   		
		$resizeFixedHeight = isset($settings['photo_frame_resize_fixed_height']) &&
						   !empty($settings['photo_frame_resize_fixed_height']) ? 
						   (int) $settings['photo_frame_resize_fixed_height'] : FALSE;		
		
		$resizeMaxWidth  = isset($settings['photo_frame_resize_max_width']) &&
						   !empty($settings['photo_frame_resize_max_width']) ? 
						   (int) $settings['photo_frame_resize_max_width'] : FALSE;
						   		
		$resizeMaxHeight = isset($settings['photo_frame_resize_max_height']) &&
						   !empty($settings['photo_frame_resize_max_height']) ? 
						   (int) $settings['photo_frame_resize_max_height'] : FALSE;
		
		$max_size        = isset($settings['photo_frame_max_size']) &&
						   !empty($settings['photo_frame_max_size']) ? 
						   (float) $settings['photo_frame_max_size'] * 1000000: FALSE;	

		if($resizeFixedWidth || $resizeFixedHeight)
		{
			if(!$resizeFixedWidth)
			{
				$resizeFixedWidth = $width;
			}

			if(!$resizeFixedHeight)
			{
				$resizeFixedHeight = $height;
			}

			$width  = (int) $resizeFixedWidth;
			$height = (int) $resizeFixedHeight;

			$image->resize($resizeFixedWidth, $resizeFixedHeight);
		}

		if($resizeMaxWidth && $width > $resizeMaxWidth && ($gcd == 'width' || $resizeMaxHeight == 0))
		{	
			$image->resizeToWidth($resizeMaxWidth);
		}		
			   
		if($resizeMaxHeight && $height > $resizeMaxHeight && ($gcd == 'height' || $resizeMaxWidth == 0))
		{
			$image->resizeToHeight($resizeMaxHeight);
		}
	}
	
	public function upload_action()
	{
		$this->EE->load->library('filemanager');
		$this->EE->load->config('photo_frame_config');
		
		$framed_dir_name = config_item('photo_frame_directory_name');
		
		$errors     = array();
		$dir_id     = $this->EE->input->get_post('dir_id', TRUE);
		$folder_id  = $this->EE->input->get_post('folder_id', TRUE);
		$site_id    = $this->EE->input->get_post('site_id', TRUE);
		$index	    = $this->EE->input->get_post('index', TRUE);
		$field_id   = $this->EE->input->get_post('field_id', TRUE) != 'false' ? $this->EE->input->get_post('field_id', TRUE) : FALSE;
		$var_id     = $this->EE->input->get_post('var_id', TRUE) != 'false' ? $this->EE->input->get_post('var_id', TRUE) : FALSE;
		$grid_id    = $this->EE->input->get_post('grid_id', TRUE) != 'false' ? $this->EE->input->get_post('grid_id', TRUE) : FALSE;
		
		// Hack: 07/11/13 - EE 2.5.5 - Photo Frame 1.0.2.5 (1.1 beta)
		// Site id in an AJAX request is always 1 if using MSM.
		// So the solution is to pass the original site id
		// through the AJAX request and set it again here. LAME!!

		if($site_id)
		{
			$this->EE->config->set_item('site_id', $site_id);
		}

		// END HACK

		$settings   = $this->EE->photo_frame_model->get_settings($field_id, FALSE, $var_id, $grid_id);
		
		$directory  = $this->EE->photo_frame_model->get_directory($dir_id);

		// $directory  = $this->EE->filemanager->directory($dir_id, FALSE, TRUE);

		$ie			= $this->EE->input->get_post('ie') == 'true' ? TRUE : FALSE;
		
		$files 		= $_FILES;
		
		for($x = 0; $x < count($files['files']['name']); $x++)
		{
			$_FILES = array(
				'files' => array(
					'name'     => $files['files']['name'][$x],
					'type'     => $files['files']['type'][$x],
					'tmp_name' => $files['files']['tmp_name'][$x],
					'error'    => $files['files']['error'][$x],
					'size'     => $files['files']['size'][$x],
				)
			);
			
			$exif_data = array();
				
			if(function_exists('exif_read_data') && $files['files']['type'][$x] == 'image/jpeg')
			{	
				$exif_data = exif_read_data($files['files']['tmp_name'][$x]);
			}
			
			$errors = $this->EE->photo_frame_model->validate_image_size($_FILES['files']['tmp_name'], $settings);
		
			if(count($errors) == 0)
			{
				$response  = ee()->filemanager->upload_file($dir_id);	

				$errors    = isset($response['error']) ? array($response['error']) : array();
							
				$dir_response = $this->EE->photo_frame_lib->create_directory($directory, $framed_dir_name);			
				$framed_dir   = $dir_response->path;
			
				$errors = array_merge($errors, $dir_response->errors);
				
				$file_name = $file_path = $file_url = $orig_path = $orig_url = NULL;
				
				if(count($errors) == 0)
				{
					$file_name = $response['file_name'];
					$file_path = $framed_dir . $file_name;
					$orig_path = $directory['server_path'] . $file_name;
			
					$file_url  = $directory['url'] . $framed_dir_name . '/' . $file_name;
					$orig_url  = $directory['url'] . $file_name;
					
					if(!isset($response['title']))
					{
						$response['title'] = $file_name;
					}	
						
					copy($response['rel_path'], $framed_dir.$response['title']);	
				}
			}
			
			$return[] = array(
				'success'            => count($errors) == 0 ? TRUE : FALSE,
				'directory'          => $directory,
				'index'				 => $index,
				'exif_data'			 => $exif_data,
				'file_name'          => isset($file_name) ? $file_name : NULL,
				'file_url'           => isset($file_url) ? $file_url : NULL,
				'file_path'          => isset($file_path) ? $file_path : NULL,
				'original_file'      => isset($response['file_name']) ? '{filedir_'.$dir_id.'}'.$response['file_name'] : NULL,
				'original_file_name' => isset($response['file_name']) ? $response['file_name'] : NULL,
				'original_url'       => isset($orig_url) ? $orig_url : NULL,
				'original_path'      => isset($orig_path) ? $orig_path : NULL,
				'errors'             => $errors
			);
		}
		
		return $this->json($return, $ie);
	}
	
	public function create_directory($directory, $framed_dir_name = FALSE)
	{
		if(!$framed_dir_name)
		{
			$framed_dir_name = config_item('photo_frame_directory_name');
		}
		
		$path = $directory['server_path'] . $framed_dir_name . '/';;
		
		$errors = array();
		$dir_exists = TRUE;
		
		if(!is_dir($path))
		{
			if(!is_dir($directory['server_path']))
			{
				$errors = array($this->parse(array(
					'directory' => $directory['server_path']
				), lang('photo_frame_upload_dir_not_exists')));
				$dir_exists = FALSE;
			}
			else
			{		
				mkdir($path, DIR_WRITE_MODE);
				
				$dir_exists = TRUE;
			}
		}
		
		return (object) array(
			'errors' => $errors,
			'path'   => $path,
			'exists' => $dir_exists
		);
	}
	
	public function replace_asset_subdir($asset_id, $file)
	{
		if($this->assets_installed())
		{
			$this->EE->load->add_package_path(PATH_THIRD . 'assets');
			$this->EE->load->library('assets_lib');
			
			$obj = $this->EE->assets_lib->get_file_by_id($asset_id);
			
			if($obj)
			{
				$row = $obj->row();
				
				if($row['source_type'] == 'ee')
				{
					$file = str_replace($obj->file_name(), $obj->subpath(), $file);
				}
			}
		}
		
		return $file;
	}
	
	public function crop_action()
	{
		$field_id      = $this->EE->input->post('fieldId', TRUE) != 'false' ? $this->EE->input->post('fieldId', TRUE) : false;
		$var_id        = $this->EE->input->post('varId', TRUE) != 'false' ? $this->EE->input->post('varId', TRUE) : false;
		$col_id        = $this->EE->input->post('colId', TRUE) != 'false' ? $this->EE->input->post('colId', TRUE) : false;
		$grid_id       = $this->EE->input->post('gridId', TRUE) != 'false' ? $this->EE->input->post('gridId', TRUE) : false;
		$asset_id      = $this->EE->input->post('assetId', TRUE) != 'false' ? $this->EE->input->post('assetId', TRUE) : false;
		
		$cache 		   = $this->EE->input->get_post('cache', TRUE);
		$cacheUrl 	   = $this->EE->input->get_post('cacheUrl', TRUE);
		$cachePath 	   = $this->EE->input->get_post('cachePath', TRUE);
		$directory     = $this->EE->input->get_post('directory', TRUE);
		$index         = $this->EE->input->get_post('index', TRUE);
		$height        = $this->EE->input->get_post('height', TRUE);
		$width         = $this->EE->input->get_post('width', TRUE);
		$x             = $this->EE->input->get_post('x', TRUE);
		$x2            = $this->EE->input->get_post('x2', TRUE);
		$y             = $this->EE->input->get_post('y', TRUE);
		$y2            = $this->EE->input->get_post('y2', TRUE);
		$resize        = $this->EE->input->get_post('resize', TRUE);
		$resize_max    = $this->EE->input->get_post('resizeMax', TRUE);
		$manipulations = $this->EE->input->get_post('manipulations', TRUE);
		$exif_data     = $this->EE->input->get_post('exifData', TRUE);
		$response      = $this->EE->input->get_post('response', TRUE);
		$manipulations = $this->array_to_object($manipulations);
		$compression   = $this->EE->input->get_post('compression', TRUE);
		$compression   = $compression ? $compression : 100;
		
		$settings = $this->EE->photo_frame_model->get_settings($field_id, $col_id, $var_id, $grid_id);
		
		//$cache_image   = $this->EE->photo_frame_lib->cache_image($cache, $this->orig, $directory['server_path'], $directory['url']);
		
		$this->img = $cachePath;
		$this->url = $cacheUrl;
		
		//if($this->edit)
		//{
			copy($this->orig, $this->img);
		//}
		
		$this->resize_maximum_size($this->img, $settings);
		
		$image = new ImageEditor($this->img, array(
			'compression' => $compression
		));
		
		if(empty($this->dir))
		{
			return $this->crop_json(FALSE);
		}
		
		if($asset_id)
		{
			$this->orig_file = $this->replace_asset_subdir($asset_id, $this->orig_file);
		}
		
		$buttons = $this->EE->photo_frame_lib->get_buttons(array(
			'originalPath' => $this->orig,
			'path'         => $this->img,
			'originalUrl'  => $this->EE->photo_frame_model->parse($this->orig_file, 'url'),
			'url' 		   => $cacheUrl,
			'image'        => $image
		));
		
		foreach($manipulations as $name => $manipulation)
		{
			if($manipulation->visible === TRUE || $manipulation->visible == 'true')
			{
				if(isset($buttons[$name]))
				{
					$buttons[$name]->render($manipulation);
				}	
			}
		}
		
		$width  = (int) ($width  ? $width  : $image->get_width());
		$height = (int) ($height ? $height : $image->get_height());
		
		$image->crop($width, $height, $x, $y);
		
		$resize = ($resize != 'false') ? $resize : FALSE;
		
		if($resize)
		{
			$resize = explode('x', $resize);
			$resize_width  = (int) $resize[0];
			$resize_height = (int) $resize[1];
			
			if($resize_width > 0 || $resize_height > 0)
			{
				if($resize_width == 0)
				{
					$resize_width = $width;
				}
				
				if($resize_height == 0)
				{
					$resize_height = $height;
				}
				
				$image->resize($resize_width, $resize_height);	
			}
		}
		
		$resize_max = ($resize_max != 'false') ? $resize_max : FALSE;
		
		if($resize_max)
		{
			$gcd           = $width > $height ? 'width' : 'height';
			$resize_max    = explode('x', $resize_max);
			$resize_max[0] = (int) $resize_max[0];
			$resize_max[1] = (int) $resize_max[1];
			
			if($resize_max[0] && $width > $resize_max[0] && ($gcd == 'width' || $resize_max[1] == 0))
			{	
				$image->resizeToWidth($resize_max[0]);
			}		
			
			if($resize_max[1] && $height > $resize_max[1] && ($gcd == 'height' || $resize_max[0] == 0))
			{
				$image->resizeToHeight($resize_max[1]);
			}	
		}
		
		return $this->crop_json(TRUE, array(
			'exif_data'		=> json_decode($exif_data),
			'asset_id'		=> isset($response['asset_id']) ? $response['asset_id'] : NULL,
			'manipulations' => $manipulations, 
			'height'        => $height,
			'width'         => $width,
			'x'             => $x,
			'x2'            => $x2,
			'y'             => $y,
			'y2'            => $y2
		));
	}
	
	public function parse_vars($photo = FALSE, $upload_prefs = FALSE, $directory = FALSE)
	{
		$parse = array_merge((array) $photo, array(
			'random_alpha'   => random_string('alpha', config_item('photo_frame_random_string_len')),
			'random_alnum'   => random_string('alnum', config_item('photo_frame_random_string_len')),
			'random_numeric' => random_string('numeric', config_item('photo_frame_random_string_len')),
			'random_string'  => random_string('alnum', config_item('photo_frame_random_string_len')),
			'random_nozero'  => random_string('nozero', config_item('photo_frame_random_string_len')),
			'random_unique'  => random_string('unique', config_item('photo_frame_random_string_len')),
			'random_sha1'    => random_string('sha1', config_item('photo_frame_random_string_len'))
		));
		
		if($photo)
		{
			$photo = (object) $photo;
						
			preg_match("/.(\w)*$/", $photo->file_name, $ext_matches);
			
			$parse['height']    = $photo->height;
			$parse['width']     = $photo->width;
			
			if(isset($photo->sizes))
			{
				$sizes = json_decode($photo->sizes);
				
				if(is_object($sizes))
				{
					foreach($sizes as $index => $size)
					{
						$parse[$index.':height'] = $size->height;
						$parse[$index.':width']  = $size->width;
						$parse[$index.':file_name'] = $this->EE->photo_frame_model->parse($size->file);
						$parse[$index.':file_name'] = $this->EE->photo_frame_model->file_name($parse[$index.':file_name']);
						$parse[$index]  	   = $this->EE->photo_frame_model->parse($size->file);
						$parse[$index.':url']  = $this->EE->photo_frame_model->parse($size->file);
						$parse[$index.':file'] = $this->EE->photo_frame_model->parse($size->file, 'server_path');
					}
				}
			}
			
			if(isset($photo->photo_id))
			{
				$parse['photo_id'] = $photo->photo_id;
				$parse['id']   	   = $photo->photo_id;
			}
			
			if($directory)
			{
				$parse[$directory] = $this->EE->photo_frame_model->parse($this->EE->photo_frame_lib->swap_filename($parse['file_name'], $parse['original_file'], $directory.'/'));
				$parse[$directory.':file_name'] = $this->EE->photo_frame_model->file_name($parse[$directory]);
				$parse[$directory.':url']  = $parse[$directory];
				$parse[$directory.':file'] = $this->EE->photo_frame_model->parse($this->EE->photo_frame_lib->swap_filename($parse['file_name'], $parse['original_file'], $directory.'/'), 'file');
			}
			
			$parse['file_name']     = preg_replace('/.\w*$/', '', $photo->original_file_name);
			$parse['filename']      = $parse['file_name'];
			$parse['extension']     = ltrim($ext_matches[0], '.');			
			$parse['url']           = $this->EE->photo_frame_model->parse($parse['file'], 'url', $upload_prefs);
			$parse['file']          = $this->EE->photo_frame_model->parse($parse['file'], 'file', $upload_prefs);
			$parse['original_url']  = $this->EE->photo_frame_model->parse($parse['original_file'], 'url', $upload_prefs);	
			$parse['original_file'] = $this->EE->photo_frame_model->parse($parse['original_file'], 'file', $upload_prefs);			
		}
		
		return $parse;
	}
	
	public function extension($string)
	{
		return strtolower(pathinfo($string, PATHINFO_EXTENSION));
	}
	
	public function filename($string, $replace = '')
	{
		$return = basename($string);
		
		if($return == $string)
		{
			return !empty($replace) ? $replace : $return;	
		}
		
		return $return;
	}
	
	public function swap_filename($filename, $file_path, $insert = NULL)
	{
		preg_match("/(".LD."filedir_(\d*)".RD.")(.*)/", $file_path, $matches);
		
		return $matches[1] . $insert . $this->filename($matches[3], $filename);
	}
	
	public function rename($photo, $settings = FALSE, $return_parse = FALSE, $entry = array())
	{
		$photo = (object) $photo;
		
		if(!is_array($settings))
		{		
			$field_id = $this->input->get_post('field_id');
			$settings = $this->photo_frame_model->get_settings($field_id);		
		}
				
		if(isset($settings['photo_frame_name_format']) && !empty($settings['photo_frame_name_format']))
		{
			$parse = array_merge($this->parse_vars($photo), array(
				'name' => config_item('photo_frame_original_size'),
			), $entry);
			
			preg_match("/".LD."filedir_(\d*)".RD."/", $photo->file, $matches);
				
			$orig_file_name = $file_name = $photo->original_file_name;
			
			$path = $this->EE->photo_frame_model->parse($photo->original_file, 'server_path', FALSE, $photo->asset_id);
			
			$parse['width']  = ImageEditor::width($path);
			$parse['height'] = ImageEditor::height($path);
			
			if($return_parse)
			{
				return $parse;
			}
			
			$file_name = $this->parse($parse, $settings['photo_frame_name_format']);		
		
			//$path = $this->EE->photo_frame_model->parse($photo->original_file, 'server_path');
			
			//$orig = $matches[0].$photo->file_name;
			$orig = $matches[0].$orig_file_name;
			$orig = $this->EE->photo_frame_model->parse($orig, 'server_path');
			
			$orig_path = $matches[0].$orig_file_name;
			$orig_path = $this->EE->photo_frame_model->parse($orig_path, 'server_path');
			
			$framed = $matches[0].config_item('photo_frame_directory_name').'/'.$photo->file_name;
			$framed = $this->EE->photo_frame_model->parse($framed, 'server_path');
			
			$framed_path = $matches[0].config_item('photo_frame_directory_name').'/'.$file_name;
			$framed_path = $this->EE->photo_frame_model->parse($framed_path, 'server_path');
			
			$orig_file_name = $this->parse($parse, $settings['photo_frame_name_format']);
			
			$photo->file_name     = $file_name;
			$photo->file          = $matches[0].config_item('photo_frame_directory_name').'/'.$file_name;
			//$photo->original_file = $this->replace_asset_subdir($photo->asset_id, $matches[0].$orig_file_name);
			
			ImageEditor::init($orig)->rename($orig_path);	
			ImageEditor::init($framed)->rename($framed_path);			
		}	
		
		return $photo;		
	}
	
	public function resize_photos($field_id, $entry_id, $col_id = FALSE, $row_id = FALSE, $var_id = FALSE, $settings = array(), $matrix = FALSE)
	{
		if(isset($settings['photo_frame_cropped_sizes']))
		{
			$where  = array(
				'field_id' => $field_id, 
				'entry_id' => $entry_id
			);
			
			if($col_id)
			{
				$where['col_id'] = $col_id;	
			}
			
			if($row_id)
			{
				$where['row_id'] = $row_id;	
			}
			
			if($var_id)
			{
				$where['var_id'] = $var_id;
			}
			
			$entry  = $this->EE->photo_frame_model->get_entry($entry_id);
			
			$photos = $this->EE->photo_frame_model->get_photos(array(
				'where' => $where
			));
			
			foreach($photos->result() as $photo)
			{
				$photo_sizes = json_decode($photo->sizes);
				
				$sizes = $settings['photo_frame_cropped_sizes'];
		
				preg_match("/".LD."filedir_(\d*)".RD."/", $photo->file, $matches);
			
				$framed_path = $matches[0].config_item('photo_frame_directory_name').'/'.$photo->file_name;
				$framed_path = $this->EE->photo_frame_model->parse($framed_path, 'server_path');
				
				foreach($sizes as $size)
				{
					if(!empty($size['width']) || !empty($size['height']))
					{
						$ratio = $photo->height / $photo->width;
					
						if(empty($size['height']))
						{
							$size['height'] = ceil($size['width'] * $ratio);	
						}
						
						if(empty($size['width']))
						{
							$size['width'] = ceil($size['height'] * $ratio);	
						}
						
						$parse = array_merge($entry->row_array(), $this->parse_vars($photo), $size);
						
						if(isset($settings['photo_frame_name_format']) && !empty($settings['photo_frame_name_format']))
						{
							$new_file_name = $this->parse($parse, $settings['photo_frame_name_format']);
						}
						else
						{
							$new_file_name = $photo->original_file_name;
						}
						
						$format     = $matches[0].config_item('photo_frame_directory_name').'/'.$new_file_name;
						$sized_path = $this->EE->photo_frame_model->parse($format, 'server_path');
						
						if(isset($photo_sizes->{$size['name']}))
						{
							$photo_size      = $photo_sizes->{$size['name']};
							$photo_size_path = $this->EE->photo_frame_model->parse($photo_size->file, 'server_path');;
							
							if(file_exists($photo_size_path))
							{
								$format     = $photo_size->file;
								$sized_path = $photo_size_path;
							}
						}					
						
						$width  = (int) $size['width'];
						$height = (int) $size['height'];
						
						ImageEditor::init($framed_path)->duplicate($sized_path, $width, $height);
							
						$resized_photos[$size['name']] = array(
							'width'  => $width,
							'height' => $height,
							'file'   => $format
						);	
					}		
				}
				
				if(isset($resized_photos))
				{
					$update['sizes'] = $resized_photos;
					
					$this->EE->photo_frame_model->update_photo($photo->id, $update);
				}				
			}
			
		}
	}
	
	public function cache_image($cache, $orig_path, $cache_path, $cache_url)
	{
		$filename  = $this->filename($orig_path);
		$extension = $this->extension($orig_path);
		$basepath  = $cache_path;

		if(is_writable($basepath))
		{
			$cache_basepath = config_item('photo_frame_cache_directory') . '/';
			
			$basepath .= $cache_basepath;
			
			if(!is_dir($basepath))
			{
				mkdir($basepath, DIR_WRITE_MODE);
			}
			
			$cache_file = $cache.'.'.$extension;
			$cache_path = $basepath.$cache_file;
			$cache_url .= $cache_basepath.$cache_file;
			
			copy($orig_path, $cache_path);
			
			return (object) array(
				'url'  => $cache_url,
				'path' => $cache_path
			);
		}
		
		return FALSE;
	}
	
	public function get_buttons($params = array())
	{
		$this->EE->load->library('photo_frame_buttons');
		
		return $this->EE->photo_frame_buttons->get($params);
	}
	
	public function get_effects($params = array())
	{
		$this->EE->load->library('photo_frame_effects');
		
		return $this->EE->photo_frame_effects->get($params);
	}
	
	/*
	public function resize_photos($field_id, $entry_id, $col_id = FALSE, $row_id = FALSE, $settings = array(), $matrix = FALSE)
	{		
		$this->EE->load->helper('string');
		
		$where  = array(
			'field_id' => $field_id, 
			'entry_id' => $entry_id
		);
		
		if($col_id)
		{
			$where['col_id'] = $col_id;	
		}
		
		if($row_id)
		{
			$where['row_id'] = $row_id;	
		}
		
		$entry  = $this->EE->photo_frame_model->get_entry($entry_id);
		$photos = $this->EE->photo_frame_model->get_photos(array(
			'where' => $where
		));
		
		$parse  = array(
			'entry_id'   => $entry_id,
			'field_id'   => $field_id,
			'channel_id' => $entry->row('channel_id'),
			'url_title'  => $entry->row('url_title'),
			'title'      => $entry->row('title')
		);
		
		$resized_photos = array();
		
		foreach($photos->result() as $photo)
		{
			$update = array();
			
			$parse = array(
				'random_alpha'   => random_string('alpha', config_item('photo_frame_random_string_len')),
				'random_alnum'   => random_string('alnum', config_item('photo_frame_random_string_len')),
				'random_numeric' => random_string('numeric', config_item('photo_frame_random_string_len')),
				'random_string'  => random_string('alnum', config_item('photo_frame_random_string_len')),
				'random_nozero'  => random_string('nozero', config_item('photo_frame_random_string_len')),
				'random_unique'  => random_string('unique', config_item('photo_frame_random_string_len')),
				'random_sha1'    => random_string('sha1', config_item('photo_frame_random_string_len')),
				'height'         => $photo->height,
				'width'          => $photo->width,
				'photo_id'       => $photo->id,
				'name'           => config_item('photo_frame_original_size'),
				'file_name'      => preg_replace('/.\w*$/', '', $photo->original_file_name)
			);
			
			$parse['filename']       = $parse['file_name'];
						
			preg_match("/.(\w)*$/", $photo->file_name, $ext_matches);
			
			$parse['extension'] = ltrim($ext_matches[0], '.');
			
			preg_match("/".LD."filedir_(\d*)".RD."/", $photo->file, $matches);
				
			$orig_file_name = $file_name = $photo->original_file_name;
			
			$path = $this->EE->photo_frame_model->parse($photo->original_file, 'server_path');
				
			$parse['width']  = ImageEditor::width($path);
			$parse['height'] = ImageEditor::height($path);
			
			$orig = $matches[0].$photo->file_name;
			$orig = $this->EE->photo_frame_model->parse($orig, 'server_path');
			
			$orig_path = $matches[0].$orig_file_name;
			$orig_path = $this->EE->photo_frame_model->parse($orig_path, 'server_path');
			
			$framed = $matches[0].config_item('photo_frame_directory_name').'/'.$photo->file_name;
			$framed = $this->EE->photo_frame_model->parse($framed, 'server_path');
			
			$framed_path = $matches[0].config_item('photo_frame_directory_name').'/'.$file_name;
			$framed_path = $this->EE->photo_frame_model->parse($framed_path, 'server_path');
			
			$update['file_name']     = $file_name;
			$update['file']          = str_replace($photo->file_name, $file_name, $photo->file);
			$update['original_file'] = str_replace($photo->file_name, $orig_file_name, $photo->original_file);
			
			if(isset($settings['photo_frame_cropped_sizes']))
			{
				$sizes = $settings['photo_frame_cropped_sizes'];
		
				foreach($sizes as $size)
				{
					$parse['file_name'] = $photo->original_file_name;
					$parse = array_merge($parse, $size);
					
					if(isset($settings['photo_frame_name_format']) && !empty($settings['photo_frame_name_format']))
					{
						$new_file_name = $this->parse($parse, $settings['photo_frame_name_format']);
					}
					else
					{
						$new_file_name = $photo->original_file_name;
					}
					
					$format     = $matches[0].config_item('photo_frame_directory_name').'/'.$new_file_name;
					$sized_path = $this->EE->photo_frame_model->parse($format, 'server_path');
					
					$width  = (int) $size['width'];
					$height = (int) $size['height'];
					
					ImageEditor::init($framed_path)->duplicate($sized_path, $width, $height);
						
					$resized_photos[$size['name']] = array(
						'width'  => $width,
						'height' => $height,
						'file'   => $format
					);			
				}
					
				$update['sizes'] = $resized_photos;
			}
			
			$this->EE->photo_frame_model->update_photo($photo->id, $update);			
		}	
	}
	*/
	
	public function manipulate($photo)
	{
		$manipulations = FALSE;
		
		$photo->manipulations = json_decode($photo->manipulations);
		
		if(isset($photo->id))
		{
			$existing = $this->EE->photo_frame_model->get_photo($photo->id);
		
			if($existing->num_rows() > 0)
			{
				$existing      = $existing->row();
				$manipulations = json_decode($existing->manipulations); 
			}
		}
		
		$orig_path = $this->EE->photo_frame_model->parse($photo->original_file, 'server_path');
		$path      = $this->EE->photo_frame_model->parse($photo->file, 'server_path');
		
		$buttons = $this->EE->photo_frame_lib->get_buttons(array(
			'originalPath' => $orig_path,
			'path'		   => $path,
			'originalUrl'  => $this->EE->photo_frame_model->parse($photo->original_file, 'url'),
			'url'		   => $this->EE->photo_frame_model->parse($photo->file, 'url'),
			'image'        => new ImageEditor($path)
		));
		
		if($this->needs_manipulation($photo->manipulations, $manipulations))
		{
			copy($orig_path, $path);
			
			foreach($photo->manipulations as $name => $manipulation)
			{
				$has_changed = $this->has_changed($manipulation, isset($manipulations->$name) ? $manipulations->$name : (object) array());
				if($has_changed)
				{
					if(isset($buttons[$name]) && ($manipulation->visible === 'true' || $manipulation->visible === TRUE))
					{	
						$buttons[$name]->render($manipulation);					
					}	
				}		
			}
		}
				
        $photo->manipulations = json_encode($photo->manipulations);		    
	}
	
	public function object_to_array($object)
	{
		$return = array();
		
		if(is_object($object))
		{
			foreach($object as $index => $value)
			{
				if(is_object($value))
				{
					$return[$index] = $this->object_to_array($value);
				}
				else
				{
					$return[$index] = $value;
				}
			}
			
			return (array) $return;
		}
		
		return array();
	}
	
	public function array_to_object($array)
	{
		if(is_array($array))
		{
			foreach($array as $index => $value)
			{
				if(is_array($value))
				{
					$array[$index] = $this->array_to_object($value);
				}
				else
				{
					if($value == 'true')
					{
						$array[$index] = true;
					}
					else if($value == 'false')
					{
						$array[$index] = false;
					}
					else if(preg_match('/^\d*$/', $value))
					{
						$array[$index] = (float) $value;
					}
					else
					{						
						$array[$index] = $value;
					}
				}
			}
			
			return (object) $array;
		}
		
		return (object) array();
	}
	
	public function needs_manipulation($subject, $compare)
	{
		if(is_array($subject) || is_object($subject))
		{	
			if (!count(get_object_vars($subject)) && count(get_object_vars($compare)) > 0)
			{
				return TRUE;
			}
			
			foreach($subject as $name => $manipulation)
			{
				if($this->has_changed($manipulation, isset($compare->$name) ? $compare->$name : (object) array()))
				{
					return TRUE;
				}
			}
		}		
		
		return FALSE;
	}
	
	public function has_changed($subject, $compare)
	{
		if (!count(get_object_vars($subject)) && count(get_object_vars($compare)) > 0 ||
		   	!count(get_object_vars($compare)) && count(get_object_vars($subject)) > 0 
		   )
		{
			return TRUE;
		}
	
		if(isset($subject->visible) && isset($compare->visible))
		{
			$subject_visible = $subject->visible === 'true' || $subject->visible === TRUE ? TRUE : FALSE;
			$compare_visible = $compare->visible === 'true' || $compare->visible === TRUE ? TRUE : FALSE;	
			
			if($compare_visible === $subject_visible && $subject_visible === FALSE)
			{
				return FALSE;
			}
		}
		
		if(isset($subject->data) && isset($compare->data))
		{
			foreach($subject->data as $index => $data)
			{
				if(isset($subject->data->$index) && isset($compare->data->$index))
				{
					$subject_data = $this->object_to_array($subject->data);
					$compare_data = $this->object_to_array($compare->data);
					
					if(is_array($subject_data[$index]) && is_array($compare_data[$index]))
					{
						if(count(array_diff($subject_data[$index], $compare_data[$index])) > 0 || count($subject_data[$index]) != count($compare_data[$index]))
						{
							return TRUE;
						}
					}
					else
					{
						if(count(array_diff_assoc($subject_data, $compare_data)) > 0)
						{
							return TRUE;
						}
					}
				}
				else
				{
					return TRUE;
				}
			}
		}
		
		return FALSE;
	}
		
	public function crop_json($success = TRUE, $save_data = array())
	{
		$original_file = $this->orig_file;
		
		$new_file      = '{filedir_'.$this->id.'}'.config_item('photo_frame_directory_name').'/'.$this->name;
		$manipulations = $this->EE->input->get_post('manipulations', TRUE);
		
		return $this->json(array_merge(array(
			'id'            => $this->id,
			'success'       => $success,
			'photo_id'      => $this->photo_id,
			// 'file_path'     => $this->dir,
			'file_name'     => $this->name,
			'url'     		=> $this->url,
			'file_path'     => $this->EE->photo_frame_model->parse($new_file, 'server_path'),
			'original_file' => $original_file,
			'original_file_name' => $this->name,
			'original_url'  => $this->EE->photo_frame_model->parse($original_file),
			'original_path' => $this->EE->photo_frame_model->parse($original_file, 'server_path'),
			'file'          => $this->EE->photo_frame_model->parse($new_file),
			'save_data' 	=> json_encode(array_merge(array(
				'original_file' => $original_file,
				'file'          => $new_file,
				'cachePath'		=> $this->img,
				'cacheUrl'		=> $this->url,
				'id'      		=> $this->photo_id,
				'file_name'		=> $this->name,
				'title' 		=> $this->EE->input->get_post('title', TRUE) ? $this->EE->input->get_post('title', TRUE) : '',
				'description'   => $this->EE->input->get_post('description', TRUE) ? $this->EE->input->get_post('description', TRUE) : '',
				'keywords' 		=> $this->EE->input->get_post('keywords', TRUE) ? $this->EE->input->get_post('keywords', TRUE) : '',
				'manipulations'	=> $manipulations ? $manipulations : array(),
			), $save_data))
		), $save_data));
	}
	
	public function decode_array($data)
	{
		if(is_array($data))
		{
			foreach($data as $index => $value)
			{
				$data[$index] = (array) json_decode($value);
			}
		}
		else
		{
			$data = array();
		}
		
		return $data;
	}
	
	public function json($data, $ie = FALSE)
	{
		if(!$ie)
		{
			header('Content-type: application/json');
			exit(json_encode($data));
		}
		else
		{
			echo '<script type="text/javascript">
			var progress, t, count = 1, data = '.json_encode($data).';
			
			for(var i in data) {				
				var response = data[i];
				t = window.top.PhotoFrame.instances[parseInt(response.index, 10)];
				
				if(data.length == 1) {
					if(response.success) {
						t.showProgress(100, function() {
							t._uploadResponseHandler(response);				    	
						});
					}
					else {
						t.showErrors(response.errors);
					}
				} else {
					progress = parseInt(count / data.length * 100);
					t._assetResponseHandler(response, progress);
					count++;
				}
			};
			
			</script>';
			exit();
		}
	}
	
	public function reindex($data, $index)
	{
		if(is_string($data))
		{
			$old_index = $index;
			$index     = $data;
			$data      = $old_index;
		}

		$array = array();
		
		foreach($data as $key => $value)
		{
			if(is_array($value))
			{
				$array[$value[$index]] = $value;
			}
			
			if(is_object($value))
			{
				$array[$value->$index] = $value;
			}
		}
		
		return $array;
	}

	public function parse($vars, $tagdata = NULL)
	{
		foreach($vars as $var => $value)
		{
			if(!is_object($value) && !is_array($value))
			{
				$tagdata = str_replace(LD.$var.RD, $value, $tagdata);
			}
				
		}
		
		return $tagdata;
	}
}
