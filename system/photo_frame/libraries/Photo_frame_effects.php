<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

if(!class_exists('Photo_frame_base_api'))
{
	require_once PATH_THIRD . 'photo_frame/libraries/Photo_frame_base_api.php';
}

class Photo_frame_effects extends Photo_frame_base_api {
	
	protected $class_name   = 'PhotoFrameEffect';
	
	protected $order_config = 'photo_frame_effects_order';
	
	protected $dir_name     = 'effects';
	
	protected $suffix       = 'Effect';
}