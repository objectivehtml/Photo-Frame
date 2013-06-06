<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

if(!class_exists('BaseClass'))
{
	require_once(PATH_THIRD . 'photo_frame/libraries/BaseClass.php');
}

if(!class_exists('ImageEditor'))
{
	require_once(PATH_THIRD . 'photo_frame/libraries/ImageEditor.php');
}

if(!class_exists('PhotoFrameEffect'))
{
	abstract class PhotoFrameEffect extends BaseClass {
		
		protected $name;
		
		protected $description;
		
		protected $effect = FALSE;
		
		protected $image  = FALSE;
		
		public function __construct($params = array()) 
		{
			parent::__construct($params);
		}
		
		public function getEffect()
		{
			return $this->effect ? $this->effect : strtolower($this->getName());
		}
		
		public function install() { }
		
		public function update($current = '') { }
		
		public function uninstall() { }
		
		public function modifyTables($table = array()) { return $table; }
		
		abstract function render($image);
	}
}