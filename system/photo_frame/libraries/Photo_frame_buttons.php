<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

if(!class_exists('Photo_frame_base_api'))
{
	require_once PATH_THIRD . 'photo_frame/libraries/Photo_frame_base_api.php';
}

class Photo_frame_buttons extends Photo_frame_base_api {
	
	protected $class_name   = 'PhotoFrameButton';
	
	protected $order_config = 'photo_frame_button_order';
	
	protected $dir_name     = 'buttons';
	
	protected $suffix       = 'Button';
}