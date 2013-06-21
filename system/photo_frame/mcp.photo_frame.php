<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Photo Frame
 * 
 * @package		Photo Frame
 * @author		Justin Kimbrell
 * @copyright	Copyright (c) 2012, Justin Kimbrell
 * @link 		http://www.objectivehtml.com/photo-frame
 * @version		0.7.0
 * @build		20121031
 */
 
class Photo_frame_mcp {

	public function __construct()
	{
	   	$this->EE =& get_instance();
	   	
	   	$this->EE->load->config('photo_frame_config');
	}
	
	public function index()
	{
		echo 'index';exit();
	}
	
	public function start_crop()
	{
		$this->EE->load->library('photo_frame_lib');
		
		if(!isset($this->EE->theme_loader))
		{
			$this->EE->load->library('theme_loader');
		}
		
		$this->EE->theme_loader->module_name = 'photo_frame';
		
		$manipulations = $this->EE->input->post('manipulations', TRUE);
		$directory	   = $this->EE->input->post('directory', TRUE);
		$cache 		   = $this->EE->input->post('cache', TRUE);
		$url 		   = $this->EE->input->post('url', TRUE);
		$path 		   = $this->EE->input->post('path', TRUE);
		$exif_data     = json_encode($this->EE->input->post('exifData', TRUE));
		$buttons 	   = $this->EE->photo_frame_lib->get_buttons();
		
		$return      = array();
		$success     = TRUE;
		$return_path = FALSE;
		
		foreach($buttons as $button)
		{
			$name = strtolower($button->getName());			
			$data = array(
				'url'          => $url,
				'cachePath'    => $directory['server_path'] . config_item('photo_frame_cache_directory') . '/',
				'cache'        => $cache,
				'path'		   => $path,
				'manipulation' => isset($manipulations[$name]) ? $manipulations[$name] : array(),
				'directory'    => $directory,
				'exifData'	   => $exif_data
			);
			
			$response = $button->startCrop($data);
			
			if(!is_string($response))
			{	
				$return[$name] = $response;
			}
			else
			{
				$return_path = $response;
				$success     = FALSE;
			}
		}
		
		$this->EE->photo_frame_lib->json(array(
			'success'    => $success,
			'path'		 => $path,
			'data'       => $return,
			'validPath'  => $return_path,
			'exifData'	 => $exif_data
		));
	}
	
	public function upload_photo()
	{			
		$this->EE->lang->loadfile('photo_frame');		
		$this->EE->load->add_package_path(PATH_THIRD . 'photo_frame');
		
		if(count($_FILES) > 0 && count($_POST) == 0)
		{
			$this->EE->load->library('photo_frame_lib');
			$this->EE->photo_frame_lib->upload_action();
		}	
	}
	
	public function crop_photo()
	{		
		$this->EE->load->library('photo_frame_lib');
		
		$this->EE->photo_frame_lib->crop_action();
	}
	
	public function photo_response()
	{		
		$this->EE->load->library('photo_frame_lib');
		
		$this->EE->photo_frame_lib->response_action();
	}
	
	public function render()
	{
		$this->EE->load->library('photo_frame_lib');
		
		//$url           = $this->EE->input->get_post('url');
		
		$orig_path     = $this->EE->input->get_post('originalPath');
		$orig_url      = $this->EE->input->get_post('originalUrl');
		$file_path	   = $this->EE->input->get_post('path');
		$file_url 	   = $this->EE->input->get_post('url');
		$cache  	   = $this->EE->input->get_post('cache');
		$directory 	   = $this->EE->input->get_post('directory');
		$manipulations = $this->EE->input->get_post('manipulations');
		$manipulations = $this->EE->photo_frame_lib->array_to_object($manipulations);
		$cache_path    = $this->EE->photo_frame_lib->cache_image($cache, $orig_path, $directory['server_path'], $directory['url']);
		
		if(!$cache_path)
		{
			return $orig_path;	
		}
		
		copy($orig_path, $cache_path->path);
		
		$image = new ImageEditor($cache_path->path);
		
		$buttons = $this->EE->photo_frame_lib->get_buttons(array(
			'originalPath' => $orig_path,
			'path'         => $file_path,
			'originalUrl'  => $orig_url,
			'url' 		   => $file_url,
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
		
		return $this->json(array(
			'url' => $cache_path->url
		));
	}
	
	/*
	public function upload_action()
	{
		$this->EE->load->library('filemanager');
		
		$dir_id     = $this->EE->input->get_post('dir_id');
		$directory  = $this->EE->filemanager->directory($dir_id, FALSE, TRUE);
	
		$framed_dir_name = config_item('photo_frame_directory_name');
		$framed_dir      = $directory['server_path'] . $framed_dir_name . '/';
		
		if(!is_dir($framed_dir))
		{
			mkdir($framed_dir, DIR_WRITE_MODE);
		}
		$response  = $this->EE->filemanager->upload_file($dir_id);
		$errors    = isset($response['error']) ? array($response['error']) : array();
					
		copy($response['rel_path'], $framed_dir.$response['title']);
		
		return $this->json(array(
			'success'            => count($errors) == 0 ? TRUE : FALSE,
			'response'           => $response,
			'directory'          => $directory,
			'file_name'		     => $response['file_name'],
			'img_url'		     => $directory['url'].$response['file_name'],
			'framed_img_path'    => $directory['server_path'].'/'.$response['file_name'],
			'framed_img_url'     => $directory['url'].$framed_dir_name.'/'.$response['file_name'],
			'framed_img_path'    => $directory['server_path'].$framed_dir_name.'/'.$response['file_name'],
			'framed_dir'         => $framed_dir,
			'framed_dir_name'    => $framed_dir_name,
			'file'               => array(),
			'errors'             => $errors
		));
	}
	*/
	
	public function crop_action()
	{
		$image  = $this->EE->input->get('image', TRUE);
		$height = $this->EE->input->get('height', TRUE);
		$width  = $this->EE->input->get('width', TRUE);
		$x      = $this->EE->input->get('x', TRUE);
		$x2     = $this->EE->input->get('x2', TRUE);
		$y      = $this->EE->input->get('y', TRUE);
		$y2     = $this->EE->input->get('y2', TRUE);
		$dir    = $this->EE->input->get('directory', TRUE);
		$url    = $this->EE->input->get('url', TRUE);
		
		/*
		$file_type = '';
		
		if(preg_match('/(jpeg)|(jpg)$/', $dir))
		{
			$file_type = 'jpeg';
		}
		else if(preg_match('/(gif)$/', $dir))
		{
			$file_type = 'gif';
		}
		else if(preg_match('/(png)$/', $dir))
		{
			$file_type = 'png';
		}
		
		// Get new dimensions
		list($source_width, $source_height) = getimagesize($dir);
	
		$image_p = imagecreatetruecolor($width, $height);
		
		if($file_type == 'png')
		{
			$image = imagecreatefrompng($dir);
		}
		elseif($file_type == 'jpeg')
		{
			$image = imagecreatefromjpeg($dir);  
		}
		elseif($file_type == 'gif')
		{
			$image = imagecreatefromgif($dir);
		}
		
		imagecopyresampled($image_p, $image, 0, 0, $x, $y, $source_width, $source_height, $source_width, $source_height);
		
		header('Content-Type: image/'.$file_type);
		
		if($file_type == 'png')
		{
			$image = imagepng($image_p, $dir);
		}
		elseif($file_type == 'jpeg')
		{
			$image = imagejpeg($image_p, $dir); 
		}
		elseif($file_type == 'gif')
		{
			$image = imagegif($image_p, $dir);
		}
		*/
				
		$id   = $this->EE->input->get('id', TRUE);
		$name = $this->EE->input->get('name', TRUE);
		
		return $this->json(array(
			'id'          => $id,
			'success'     => TRUE,
			'file_path'   => $dir,
			'file_name'   => $name,
			'file_url'    => $url,
			'title'       => $this->EE->input->get('title') ? $this->EE->input->get('title') : NULL,
			'description' => $this->EE->input->get('description') ? $this->EE->input->get('description') : NULL,
			'keywords'    => $this->EE->input->get('keywords') ? $this->EE->input->get('keywords') : NULL, 
			'save_data'   => '{filedir_'.$id.'}'.$name
		));
		
	}
	
	private function json($data)
	{
		header('Content-type: application/json');
		exit(json_encode($data));
	}
}
