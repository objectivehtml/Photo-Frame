<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

if(!class_exists('PhotoFrameTheme'))
{
	abstract class PhotoFrameTheme extends BaseClass {
	        
	    protected $name = FALSE;
	    
	    protected $moduleName = 'photo_frame';
	    
	    protected $title;
	    
	    protected $description;
	    
	    protected $wrapperClass;
	    
	    protected $photoClass;
	    
	    protected $basePath;
	    
	    protected $baseUrl;
	    
	    public function __construct($params = array())
	    {
	        parent::__construct($params);
	        
	    }
	    
	    public function getName()
	    {
		    return $this->name ? $this->name : strtolower($this->title);
	    }
	    
	    public function getModuleName()
	    {
		    return $this->moduleName ? $this->moduleName : $this->getName();
	    }
	    
		public function css()
		{
	    	return array($this->getName() . '.css');
		}  
	    
	    public function javascript()
	    {
	        return array();
	    }
	}
}
