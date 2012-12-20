<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

abstract class PhotoFrameTheme extends BaseClass {
        
    protected $name;
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
    
    
	public function getCss()
	{
    	return array($this->baseUrl . $this->name . '.css');
	}  
    
    public function getJs()
    {
        return;
    }
    
    public function render()
    {
        
    }   
    
    public static function load($name, $basePath = NULL, $baseUrl = NULL)
    {
        $returnObj = FALSE;
        
        if(!is_array($name))
        {
            $returnObj = TRUE;
            $name      = array($name);
        }
        
        $return = array();
        
        foreach($name as $name)
        {
            $theme  = $basePath . $name . '/';
            $file   = $theme . $name . '.php';
            $method = $name.'_'.__CLASS__;
    			 
            if(file_exists($file))
            {
                require_once $file;
                
                $return[] = new $method(array(
                    'name'     => $name,
                    'basePath' => $theme,
                    'baseUrl'  => $baseUrl . $name . '/'
                ));
                
            }
        }
        
        if($returnObj)
        {
            $return = $return[0];
        }
        
        return $return;
    }
}