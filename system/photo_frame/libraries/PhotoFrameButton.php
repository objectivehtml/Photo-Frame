<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

if(!class_exists('BaseClass'))
{
	require_once(PATH_THIRD . 'photo_frame/libraries/BaseClass.php');
}

if(!class_exists('ImageEditor'))
{
	require_once(PATH_THIRD . 'photo_frame/libraries/ImageEditor.php');
}

if(!class_exists('PhotoFrameButton'))
{
	abstract class PhotoFrameButton extends BaseClass {
		
		protected $name;
		
		protected $description;
		
		protected $path;
		
		protected $url;
				
		protected $className = FALSE;
		
		protected $moduleName = FALSE;
		
		protected $jsDirectory = 'javascript';
		
		protected $dirName = 'buttons';
		
		protected $image = FALSE;
		
		protected $preview = FALSE;
		
		public function __construct($params = array()) 
		{
			parent::__construct($params);
		}
		
		public function install() { }
		
		public function update($current = '') { }
		
		public function uninstall() { }
		
		public function modifyTables($table = array()) { return $table; }
		
		public function render($manipulation = array()) {}
		
		public function postSave($savePhoto, $origPhoto = array())
		{
			return $savePhoto;
		}
		
		public function getClassName()
		{
			return $this->className ? $this->className : strtolower($this->name);
		}
		
		public function getModuleName()
		{
			return $this->moduleName ? $this->moduleName : 'photo_frame';
		}
		
		public function getJsDirectory()
		{
			return $this->jsDirectory;
		}
		
		public function prepSavedData($savedData)
		{ 
			return $savedData;
		}
		
		public function startCrop($data = array(), $settings = array())
		{ 
			return array(); 
		}
		
		public function css()
		{
			return array();
		}
		
		public function javascript()
		{
			return array($this->dirName . '/' . strtolower($this->name));
		}
		
		public function parseVars($row)
		{
			return array();
		}

		public function settings($data)
		{
			return array();
		}
	}
}