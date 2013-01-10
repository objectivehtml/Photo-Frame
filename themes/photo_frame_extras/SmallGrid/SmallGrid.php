<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class SmallGrid_PhotoFrameTheme extends PhotoFrameTheme {
	
	public function __construct($params = array())
	{
    	parent::__construct($params);
	}
	
	protected $title        = 'Small Grid';
	protected $description  = 'Your photos will in a 75px &times; 75px square ratio, inside a responsive grid.';
	protected $wrapperClass = 'photo-frame-small-grid';
	protected $photoClass   = 'photo-frame-small-grid-photo';
}