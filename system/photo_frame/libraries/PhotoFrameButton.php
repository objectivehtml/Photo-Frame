<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

if(!class_exists('BaseClass'))
{
	require_once(PATH_THIRD . 'photo_frame/libraries/BaseClass.php');
}

if(!class_exists('ImageEditor'))
{
	require_once(PATH_THIRD . 'photo_frame/libraries/ImageEditor.php');
}

abstract class PhotoFrameButton extends BaseClass {
	
	public $name;
	
	public $description;
	
	public $path;
	
	public $url;
	
	public $image = FALSE;
	
	public function __construct($params = array()) 
	{
		parent::__construct($params);
	}
	
	public function render($manipulation = array()) {}
	
	public function startCrop($data = array())
	{ 
		return array(); 
	}
	
	public function css()
	{
		return array();
	}
	
	public function javascript()
	{
		return array();
	}
	
}