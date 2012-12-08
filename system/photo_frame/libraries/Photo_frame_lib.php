<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once PATH_THIRD.'photo_frame/libraries/ImageEditor.php';
		
class Photo_frame_lib {
	
	protected $id, $name, $dir, $url;
	
	public function __construct()
	{
		$this->EE =& get_instance();
		
		$this->EE->load->config('photo_frame_config');
		$this->EE->lang->loadfile('photo_frame');
		
		if(!class_exists('photo_frame_model'))
		{
			$this->EE->load->model('photo_frame_model');
		}
		
		$this->id   = $this->EE->input->get_post('id', TRUE);
		$this->name = $this->EE->input->get_post('name', TRUE);
		$this->img  = $this->EE->input->get_post('image', TRUE);
		$this->dir  = $this->EE->input->get_post('directory', TRUE);
		$this->orig = $this->EE->input->get_post('original', TRUE);
		$this->edit = $this->EE->input->get_post('edit', TRUE) == 'true' ? TRUE : FALSE;
		$this->url  = $this->EE->input->get_post('url', TRUE);
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
	    require_once PATH_THIRD . 'photo_frame/libraries/BaseClass.php';
	    require_once PATH_THIRD . 'photo_frame/libraries/PhotoFrameTheme.php';	
	    
		$this->EE->load->helper('directory');
		
		$directory = config_item('photo_frame_extra_dir_name');
		
		$basepath = $this->EE->theme_loader->theme_path() . $directory . '/';
		$baseurl  = $this->EE->theme_loader->theme_url() . $directory . '/';
		
		$return = array();
		
		if(is_dir($basepath))
		{
			foreach(directory_map($basepath) as $index => $file)
			{
			    $return[$index] = PhotoFrameTheme::load($index, $basepath, $baseurl);
			}	
		}
		
		return $return;	
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
	
	public function upload_action()
	{
		$this->EE->load->library('filemanager');
		$this->EE->load->config('photo_frame_config');
		
		$framed_dir_name = config_item('photo_frame_directory_name');
		
		$dir_id     = $this->EE->input->get_post('dir_id');
		$field_id   = $this->EE->input->get_post('field_id');
		$settings   = $this->EE->photo_frame_model->get_settings($field_id);
		$errors     = $this->EE->photo_frame_model->validate_image_size();
		$directory  = $this->EE->filemanager->directory($dir_id, FALSE, TRUE);
		$ie			= $this->EE->input->get_post('ie') == 'true' ? TRUE : FALSE;
		
		if(count($errors) == 0)
		{
			$framed_dir = $directory['server_path'] . $framed_dir_name . '/';
			
			if(!is_dir($framed_dir))
			{
				mkdir($framed_dir, DIR_WRITE_MODE);
			}
			
			$response  = $this->EE->filemanager->upload_file($dir_id);
			
			$file_name = $file_path = $file_url = $orig_path = $orig_url = NULL;
			
			$errors    = isset($response['error']) ? array($response['error']) : array();
			
			if(count($errors) == 0)
			{
				$file_name = $response['file_name'];
				$file_path = $framed_dir . $file_name;
				$orig_path = $directory['server_path'] . $file_name;
				$file_url  = $directory['url'] . $framed_dir_name . '/' . $file_name;
				$orig_url  = $directory['url'] . $file_name;
							
				copy($response['rel_path'], $framed_dir.$response['title']);
			}
		}
		
		return $this->json(array(
			'success'       => count($errors) == 0 ? TRUE : FALSE,
			'directory'     => $directory,
			'file_name'     => isset($file_name) ? $file_name : NULL,
			'file_url'      => isset($file_url) ? $file_url : NULL,
			'file_path'     => isset($file_path) ? $file_path : NULL,
			'original_url'  => isset($orig_url) ? $orig_url : NULL,
			'original_path' => isset($orig_path) ? $orig_path : NULL,
			'errors'        => $errors
		), $ie);
	}
	
	public function crop_action()
	{
		// var_dump(array_merge($_GET, $_POST));exit();
		
		$height     = $this->EE->input->get_post('height', TRUE);
		$width      = $this->EE->input->get_post('width', TRUE);
		$x          = $this->EE->input->get_post('x', TRUE);
		$x2         = $this->EE->input->get_post('x2', TRUE);
		$y          = $this->EE->input->get_post('y', TRUE);
		$y2         = $this->EE->input->get_post('y2', TRUE);
		$resize     = $this->EE->input->get_post('resize', TRUE);
		$resize_max = $this->EE->input->get_post('resizeMax', TRUE);
		
		$compression = $this->EE->input->get_post('compression', TRUE);
		$compression = $compression ? $compression : 100;
		
		if($this->edit)
		{
			copy($this->orig, $this->img);
		}
		
		$image = new ImageEditor($this->img, array(
			'compression' => $compression
		));
		
		if(empty($this->dir))
		{
			return $this->crop_json(FALSE);
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
			'height'      => $height,
			'width'       => $width,
			'x'           => $x,
			'x2'          => $x2,
			'y'           => $y,
			'y2'          => $y2
		));
	}
	
	public function resize_photos($field_id, $entry_id, $settings = array())
	{
		if(isset($settings['photo_frame_cropped_sizes']))
		{
			$this->EE->load->helper('string');
			
			$entry  = $this->EE->photo_frame_model->get_entry($entry_id);
			$photos = $this->EE->photo_frame_model->get_photos($field_id, $entry_id);
			$sizes  = $settings['photo_frame_cropped_sizes'];
			$parse  = array(
				'entry_id'   => $entry_id,
				'channel_id' => $entry->row('channel_id'),
				'url_title'  => $entry->row('url_title'),
				'title'      => $entry->row('title')
			);
			
			$resized_photos = array();
			
			foreach($photos->result() as $photo)
			{
				$update = array();
				
				$photo_id = $photo->id;
				
				$parse['photo_id']       = $photo_id;
				$parse['name']           = config_item('photo_frame_original_size');
				$parse['file_name']      = $photo->file_name;
				$parse['random_alpha']   = random_string('alpha', config_item('photo_frame_random_string_len'));
				$parse['random_alnum']   = random_string('alnum', config_item('photo_frame_random_string_len'));
				$parse['random_numeric'] = random_string('numeric', config_item('photo_frame_random_string_len'));
				$parse['random_string']  = random_string('alnum', config_item('photo_frame_random_string_len'));
				$parse['random_nozero']  = random_string('nozero', config_item('photo_frame_random_string_len'));
				$parse['random_unique']  = random_string('unique', config_item('photo_frame_random_string_len'));
				$parse['random_sha1']    = random_string('sha1', config_item('photo_frame_random_string_len'));
				
				preg_match("/.(\w)*$/", $photo->file_name, $ext_matches);
				
				$parse['extension'] = ltrim($ext_matches[0], '.');
				
				preg_match("/".LD."filedir_(\d*)".RD."/", $photo->file, $matches);
					
				$file_name = $photo->file_name;
					
				if(isset($settings['photo_frame_name_format']) && !empty($settings['photo_frame_name_format']))
				{
					$file_name = $this->parse($parse, $settings['photo_frame_name_format']);	
					
					$orig  = $matches[0].$file_name;
					$orig  = $this->EE->photo_frame_model->parse_file($orig, 'server_path');
					
					$parse['name']		= config_item('photo_frame_default_size');
					
					$new  = $matches[0].config_item('photo_frame_directory_name').'/'.$file_name;
					$new  = $this->EE->photo_frame_model->parse_file($new, 'server_path');
					
					$update['file_name']     = $file_name;
					
					foreach(array('file' => $new, 'original_file' => $orig) as $type => $renamed_file)
					{
						$rename_photo = $this->EE->photo_frame_model->parse_file($photo->$type, 'server_path');
						$rename_photo = new ImageEditor($rename_photo);
						$rename_photo->rename($renamed_file);
						
						$update[$type] = str_replace($photo->file_name, $file_name, $photo->$type);
					}
				}
				
				foreach($sizes as $size)
				{
					$parse['file_name'] = $photo->file;
					$parse = array_merge($parse, $size);
					
					if(isset($settings['photo_frame_name_format']) && !empty($settings['photo_frame_name_format']))
					{
						$file_name = $this->parse($parse, $settings['photo_frame_name_format']);
					}
					$width  = (int) $size['width'];
					$height = (int) $size['height'];					
					$file   = $this->EE->photo_frame_model->parse_file(isset($update['file']) ? $update['file'] : $photo->file, 'server_path');					
					$new_format = $matches[0].config_item('photo_frame_directory_name').'/'.$file_name;
					$new    	= $this->EE->photo_frame_model->parse_file($new_format, 'server_path');
					
					$resized_photos[$size['name']] = array(
						'width'  => $width,
						'height' => $height,
						'file'   => $new_format
					);
					
					$image = new ImageEditor($file);
					
					$image->duplicate($new, $width, $height);
				}
			}
						
			$update['sizes'] = $resized_photos;
						
			if(isset($photo_id))
			{
				$this->EE->photo_frame_model->update_photo($photo_id, $update);
			}
		}	
	}
	
	public function crop_json($success = TRUE, $save_data = array())
	{
		$original_file = '{filedir_'.$this->id.'}'.$this->name;
		$new_file      = '{filedir_'.$this->id.'}'.config_item('photo_frame_directory_name').'/'.$this->name;
		
		return $this->json(array_merge(array(
			'id'            => $this->id,
			'success'       => $success,
			// 'file_path'     => $this->dir,
			'file_name'     => $this->name,
			'file_url'      => $this->url,
			'file_path'     => $this->EE->photo_frame_model->parse_filename($new_file, 'server_path'),
			'original_url'  => $this->EE->photo_frame_model->parse_filename($original_file),
			'original_path' => $this->EE->photo_frame_model->parse_filename($original_file, 'server_path'),
			'file'          => $this->EE->photo_frame_model->parse_filename($new_file),
			'save_data' 	=> json_encode(array_merge(array(
				'original_file' => $original_file,
				'file'          => $new_file,
				'file_name'		=> $this->name,
				'title' 		=> $this->EE->input->get_post('title', TRUE) ? $this->EE->input->get_post('title', TRUE) : '',
				'description'   => $this->EE->input->get_post('description', TRUE) ? $this->EE->input->get_post('description', TRUE) : '',
				'keywords' 		=> $this->EE->input->get_post('keywords', TRUE) ? $this->EE->input->get_post('keywords', TRUE) : '',
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
	
	private function json($data, $ie = FALSE)
	{
		if(!$ie)
		{
			header('Content-type: application/json');
			exit(json_encode($data));
		}
		else
		{
			echo '<script type="text/javascript">window.top.PhotoFrame.instances[0].callback('.json_encode($data).');</script>';
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
			$tagdata = str_replace(LD.$var.RD, $value, $tagdata);	
		}
		
		return $tagdata;
	}
}