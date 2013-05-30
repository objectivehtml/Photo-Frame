<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class EffectsButton extends PhotoFrameButton {
	
	public $name = 'Effects';
	
	public function startCrop($data = array())
	{
		/*
		$m         = $data['manipulation'];
		$cache     = $data['cache'];
		$cachePath = $data['cachePath'];
		$url       = $data['url'];
		$path      = $data['path'];
		*/
		
		$ee =& get_instance();
		
		$ee->load->helper('string');
		$ee->load->config('photo_frame_effects');
		
		$effects = config_item('photo_frame_effects');
		
		if(!class_exists('ImageEditor'))
		{
			require_once(PATH_THIRD . 'libraries/ImageEditor.php');
		}
		
		$return = array();
		
		foreach($effects as $method => $name)
		{
			$filename = basename($data['url']);
			$path     = rtrim($data['path'], '/') . '/_thumbs/' . $filename;
			
			$obj = $ee->photo_frame_lib->cache_image(random_string(), $path);
		
			ImageEditor::init($obj->path)->$method();
			
			$return[] = (object) array(
				'url'    => $obj->url,
				'method' => $method,
				'name'   => $name
			);
		}
		
		return $return;
	}
	
	public function render($manipulation = array())
	{
		if(is_object($manipulation->data->effects))
		{
			foreach($manipulation->data->effects as $method)
			{
				$this->image->$method();
			}
		}
	}
}