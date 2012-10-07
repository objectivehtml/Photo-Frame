<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class ImageEditor {
 
	protected $image;
	
	protected $meta;
	
	protected $type;
	
	protected $filename;
	
	protected $compression = .75; // JPEG only
	
	protected $bgd_color = 0;
	
	public function __construct($filename)
	{
		$meta = getimagesize($filename);
		
		$this->meta = $meta;
		$this->type = $meta[2];
		
		switch($this->type) {
			case IMAGETYPE_JPEG:
				$this->image = imagecreatefromjpeg($filename);
				break;
			case IMAGETYPE_GIF:
				$this->image = imagecreatefromgif($filename);
				break;
			case IMAGETYPE_PNG:
				$this->image = imagecreatefrompng($filename);
				break;
		}
	}
	
	function save($filename, $permissions = NULL)
	{
		switch($this->type) {
			case IMAGETYPE_JPEG:
				imagejpeg($this->image, $filename, $this->compession);
				break;
			case IMAGETYPE_GIF:
				imagegif($this->image, $filename);
				break;
			case IMAGETYPE_PNG:
				imagepng($this->image, $filename);
				break;
		}
		
		if( $permissions != null)
		{
			chmod($this->filename, $permissions);
		}
	}
	 
	function getWidth()
	{
      return imagesx($this->image);
	}
	
	function get_width()
	{
		return getWidth();
	}
	
	function getHeight()
	{
      return imagesy($this->image);
	}
	
	function get_height()
	{
		return getHeight();
	}
	
	function resizeToHeight($height)
	{	
		$ratio = $height / $this->getHeight();
		$width = $this->getWidth() * $ratio;
		$this->resize($width,$height);
	}
	
	function resize_to_height($height)
	{
		return resizeToHeight($height);
	}
	
	function resizeToWidth($width)
	{
		$ratio  = $width / $this->getWidth();
		$height = $this->getHeight() * $ratio;
		$this->resize($width,$height);
	}
	
	function resize_to_width($width)
	{
		return resizeToWidth($width);
	}
	
	function scale($scale)
	{
		$width  = $this->getWidth()  * $scale / 100;
		$height = $this->getHeight() * $scale / 100;
		$this->resize($width,$height);
	}
	
	function rotate($angle = 0, $ignore_transparent = 0)
	{
		imagerotate($this->image, $angle , $this->bgd_color, $ignore_transparent);
	}
 
	function resize($width, $height)
	{
		$resized_image = imagecreatetruecolor($width, $height);
		imagecopyresampled($resized_image, $this->image, 0, 0, 0, 0, $width, $height, $this->getWidth(), $this->getHeight());
		$this->image = $resized_image;
	}
}