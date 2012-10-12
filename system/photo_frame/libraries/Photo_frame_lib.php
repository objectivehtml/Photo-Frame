<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once PATH_THIRD.'photo_frame/libraries/ImageEditor.php';
		
class Photo_frame_lib {
	
	protected $id, $name, $dir, $url;
	
	public function __construct()
	{
		$this->EE =& get_instance();
		
		$this->EE->load->config('photo_frame_config');
		
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
		));
	}
	
	public function crop_action()
	{
		// var_dump(array_merge($_GET, $_POST));exit();
		
		$height = $this->EE->input->get_post('height', TRUE);
		$width  = $this->EE->input->get_post('width', TRUE);
		$x      = $this->EE->input->get_post('x', TRUE);
		$x2     = $this->EE->input->get_post('x2', TRUE);
		$y      = $this->EE->input->get_post('y', TRUE);
		$y2     = $this->EE->input->get_post('y2', TRUE);
		
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
		
		$width  = $width  ? $width  : $image->get_width();
		$height = $height ? $height : $image->get_height();
		
		$image->crop($width, $height, $x, $y);
		
		return $this->crop_json(TRUE, array(
			'height'      => $height,
			'width'       => $width,
			'x'           => $x,
			'x2'          => $x2,
			'y'           => $y,
			'y2'          => $y2
		));
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
	
	private function json($data)
	{
		header('Content-type: application/json');
		exit(json_encode($data));
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

}