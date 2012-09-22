<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Photo Frame
 * 
 * @package		Photo Frame
 * @author		Justin Kimbrell
 * @copyright	Copyright (c) 2012, Justin Kimbrell
 * @link 		http://www.objectivehtml.com/photo-frame
 * @version		0.2.0
 * @build		20120921
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
			'success'         => count($errors) == 0 ? TRUE : FALSE,
			'response'        => $response,
			'directory'       => $directory,
			'file_name'		  => $response['file_name'],
			'img_url'		  => $directory['url'].$response['file_name'],
			'framed_img_path' => $directory['server_path'].'/'.$response['file_name'],
			'framed_img_url'  => $directory['url'].$framed_dir_name.'/'.$response['file_name'],
			'framed_img_path' => $directory['server_path'].$framed_dir_name.'/'.$response['file_name'],
			'framed_dir'      => $framed_dir,
			'framed_dir_name' => $framed_dir_name,
			'file'            => array(),
			'errors'          => $errors
		));
	}
	
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
				
		$id   = $this->EE->input->get('id', TRUE);
		$name = $this->EE->input->get('name', TRUE);
		
		return $this->json(array(
			'id'		=> $id,
			'success' 	=> TRUE,
			'file_path' => $dir,
			'file_name' => $name,
			'file_url'  => $url,
			'save_data' => '{filedir_'.$id.'}'.$name
		));
		
	}
	
	private function json($data)
	{
		header('Content-type: application/json');
		exit(json_encode($data));
	}
}