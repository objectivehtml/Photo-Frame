<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once PATH_THIRD . 'photo_frame/libraries/Base_class.php';

class ImageEditor extends Base_class {
 
	protected $image;
	
	protected $meta;
	
	protected $type;
	
	protected $filename;
	
	protected $compression = 100; // JPEG only
	
	protected $bgd_color = 0;
	
	public function __construct($filename, $params = array())
	{		
		parent::__construct($params);
		
		$this->filename = $filename;
		
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
	
	function save($filename = FALSE, $permissions = NULL)
	{
		//header('Content-Type: image/'.$this->type);
		
		if(!$filename)
		{
			$filename = $this->filename;
		}
		
		switch($this->type) {
			case IMAGETYPE_JPEG:
				imagejpeg($this->image, $filename, $this->compression);
				break;
			case IMAGETYPE_GIF:
				imagegif($this->image, $filename);
				break;
			case IMAGETYPE_PNG:
			    // need this for transparent png to work          
			    imagealphablending($this->image, false);
			    imagesavealpha($this->image,true);
			    imagepng($this->image,$filename);
			    break;
		}
		  
		if( $permissions != null)
		{
			chmod($this->filename, $permissions);
		}
	}
	
	function getImage()
	{
		return $this->image;
	}
	
	function get_image()
	{
		return $this->getImage();
	}
	
	function getType($return_int = FALSE)
	{
		if($return_int)
		{
			return $this->type;	
		}
		
		switch($this->type) {
			case IMAGETYPE_JPEG:
				return 'jpeg';
			case IMAGETYPE_GIF:
				return 'gif';
			case IMAGETYPE_PNG:
				return 'png';
		}
	}
	
	function get_type()
	{
		return $this->getType();
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
	
	function resizeToWidth($width, $scale = FALSE)
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
 
	function resize($width, $height, $x = 0, $y = 0, $x2 = 0, $y2 = 0)
	{
		$resized_image = imagecreatetruecolor($width, $height);
		
		/* Check if this image is PNG or GIF, then set if Transparent*/  
		
		$resized_image = $this->preserve_transparency($resized_image, $width, $height);
		
		imagecopyresampled($resized_image, $this->image, $x2, $y2, $x, $y, $width, $height, $this->getWidth(), $this->getHeight());
		
		$this->image = $resized_image;
		
		$this->save();
	}
	
	function preserve_transparency($image = FALSE, $width = FALSE, $height = FALSE)
	{
		$return = TRUE;
		
		if(!$image)
		{	
			$return = FALSE;
			$image = $this->image;	
		}
		
		if(!$height)
		{
			$height = $this->getHeight();	
		}
		
		if(!$width)
		{
			$width = $this->getWidth();	
		}
		
		if(($this->type == IMAGETYPE_GIF) || ($this->type==IMAGETYPE_PNG)){
			imagealphablending($image, false);
			imagesavealpha($image,true);
			$transparent = imagecolorallocatealpha($image, 255, 255, 255, 127);
			imagefilledrectangle($image, 0, 0, $width, $height, $transparent);
		}
		
		if($return)
		{
			return $image;
		}
		else
		{
			$this->image = $image;
		}
	}
	
	function crop($width, $height, $x = 0, $y = 0, $x2 = 0, $y2 = 0)
	{
		$resized_image = imagecreatetruecolor($width, $height);
		
		/* Check if this image is PNG or GIF, then set if Transparent*/  
		
		$this->preserve_transparency($resized_image, $width, $height);
		
		imagecopyresampled($resized_image, $this->image, $x2, $y2, $x, $y, $width, $height, $width, $height);
		
		$this->image = $resized_image;
		
		$this->save();
	}
}