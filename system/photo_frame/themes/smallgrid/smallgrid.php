<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class SmallGridTheme extends PhotoFrameTheme {
	
	protected $title        = 'Small Grid';
	protected $name         = 'smallgrid';
	protected $description  = 'Your photos will in a 200px &times; 200px square ratio, inside a responsive grid.';
	protected $wrapperClass = 'photo-frame-small-grid';
	protected $photoClass   = 'photo-frame-small-grid-photo';
	
	public function __construct($params = array())
	{
    	parent::__construct($params);
	}
}